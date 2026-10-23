// Step 1 of the Book Street content pipeline:
// Parses raw wishlist text exports in `data/books/source/wishlist-*.txt` (plus optional
// `data/books/source/manual-additions.json`), preserves the original title & author fields,
// strips obvious marketplace/promotional text, applies `data/books/corrections.json` and
// `data/books/overrides.json`, detects likely duplicates without deleting records, and
// outputs `data/books/books.normalized.json`.

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  PATHS,
  SOURCE_DIR,
  readJson,
  writeJson,
  normalizeText,
  matchKey,
  titleCase,
  personNameCase,
  relative,
} from "./lib.mjs";

const NOISE_PREFIXES = [
  /^best\s*seller$/i,
  /^\d+(\.\d+)?\s+out of\s+5\s+stars/i,
  /^\d+%\s+off\b/i,
  /^₹\s*[\d,]+/i,
  /^m\.?r\.?p\.?\s*:/i,
  /^price dropped/i,
  /^format\s*:/i,
  /^item added\b/i,
  /^priority\s*:/i,
  /^see all buying options$/i,
  /^add to cart$/i,
  /^add a note$/i,
  /^edit a note$/i,
  /^move$/i,
];

function isNoiseLine(line) {
  return NOISE_PREFIXES.some((re) => re.test(line));
}

/**
 * Splits a raw wishlist text file into individual item blocks separated by `Move` lines.
 */
function parseRawWishlistText(rawText, sourceFile) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const blocks = [];
  let current = [];
  for (const line of lines) {
    current.push(line);
    if (/^move$/i.test(line)) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    blocks.push(current);
  }

  const parsedItems = [];

  for (const block of blocks) {
    // Filter out "Best seller" badge lines at the very top of a block
    const filtered = block.filter((l) => !/^best\s*seller$/i.test(l));
    if (filtered.length === 0) continue;

    // First non-noise line is the raw listing title
    const rawTitleLine = filtered.find((l) => !isNoiseLine(l) && !/^by\s+/i.test(l));
    if (!rawTitleLine) continue;

    const byLine = filtered.find((l) => /^by\s+/i.test(l)) || null;
    const formatLine = filtered.find((l) => /^format\s*:/i.test(l)) || null;
    const addedLine = filtered.find((l) => /^item added\b/i.test(l)) || null;

    let rawAuthor = null;
    let bindingFromBy = null;
    if (byLine) {
      const m = byLine.match(/^by\s+(.+?)(?:\s*\(([^)]+)\))?$/i);
      if (m) {
        rawAuthor = m[1].trim();
        bindingFromBy = m[2] ? m[2].trim() : null;
      }
    }

    const format = formatLine
      ? formatLine.replace(/^format\s*:\s*/i, "").trim()
      : bindingFromBy || null;

    const addedDate = addedLine
      ? addedLine.replace(/^item added\s+/i, "").trim()
      : null;

    parsedItems.push({
      sourceFile,
      originalListingTitle: rawTitleLine,
      originalListingAuthor: rawAuthor,
      format,
      addedDate,
    });
  }

  return parsedItems;
}

/**
 * Separates a clean book title, optional subtitle, series note, and stripped promotional text
 * from a marketplace listing title.
 */
function cleanMarketplaceTitle(rawTitle, currentAuthor) {
  let working = rawTitle.trim();
  const strippedParts = [];
  let extractedAuthor = null;
  let series = null;
  let subtitle = null;

  // 1. Handle ALL-CAPS inline "BY <AUTHOR> PAPERBACK ENGLISH EDITION 2023"
  const inlineByMatch = working.match(
    /^(.+?)\s+BY\s+([A-Z][A-Z\s.]+?)(?:\s+(?:PAPERBACK|HARDCOVER|KINDLE|ENGLISH|EDITION|\d{4}|\s)+)?$/
  );
  if (inlineByMatch && !currentAuthor) {
    working = inlineByMatch[1].trim();
    extractedAuthor = personNameCase(inlineByMatch[2].trim());
    strippedParts.push(rawTitle.slice(inlineByMatch[1].length).trim());
  }

  // 2. Strip pipe-delimited marketing blurbs: "Title | The Gripping YA..."
  if (working.includes("|")) {
    const [head, ...rest] = working.split("|");
    working = head.trim();
    strippedParts.push(rest.join(" | ").trim());
  }

  // 3. Extract parenthetical series info at the end, e.g. "(Plated Prisoner, 6)" or "(The Powerless Trilogy)"
  const parenMatches = [...working.matchAll(/\(([^)]+)\)/g)];
  for (const pm of parenMatches) {
    const inside = pm[1].trim();
    if (/^(pb|sc|hc|paperback|hardcover)$/i.test(inside)) {
      strippedParts.push(pm[0]);
      working = working.replace(pm[0], "").trim();
    } else if (
      /book|trilogy|series|vol|shepherd king|folk of the air|plated prisoner|hades|letters of enchantment/i.test(
        inside
      )
    ) {
      series = inside;
      working = working.replace(pm[0], "").trim();
    }
  }

  // 4. Strip trailing format/edition tokens like "Paperback by Elle Kennedy Latest Edition", "Special Edition", "SC"
  const trailingFormatRe =
    /\s+(?:Paperback(?:\s+by\s+[A-Za-z\s.]+)?(?:\s+Latest Edition)?|Special Edition|SPECIAL\s*\/E|English|SC)$/i;
  if (trailingFormatRe.test(working)) {
    const m = working.match(trailingFormatRe);
    if (m) strippedParts.push(m[0].trim());
    working = working.replace(trailingFormatRe, "").trim();
  }

  // 5. Handle colons and dashes separating title from promotional blurbs or series markers
  const promoPatterns = [
    /oprah'?s book club/i,
    /sunday times/i,
    /new york times/i,
    /usa today/i,
    /bestsell/i,
    /tiktok/i,
    /book club/i,
    /thrilling final book/i,
    /epic conclusion/i,
    /epic romantasy/i,
    /sizzling story/i,
    /addictive fake dating/i,
    /unforgettable love story/i,
    /award-winning ya/i,
    /from the (?:international )?bestselling author/i,
    /now a netflix series/i,
    /totally gripping thriller/i,
    /highly anticipated sequel/i,
    /^a novel$/i,
    /^a story$/i,
    /^volume\s+\d+$/i,
    /^book\s+\d+$/i,
    /^\d+$/,
  ];

  if (working.includes(":")) {
    const segments = working.split(":").map((s) => s.trim());
    const mainTitle = segments[0];
    const keptSubsegments = [];

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      if (
        /^(the will trent,\s*book\s*\d+|red queen\s*book\s*\d+|city of [a-z\s]+)$/i.test(
          seg
        )
      ) {
        if (/^city of/i.test(seg)) {
          keptSubsegments.push(seg);
        } else {
          series = series || titleCase(seg);
        }
      } else if (promoPatterns.some((re) => re.test(seg))) {
        strippedParts.push(seg);
      } else {
        keptSubsegments.push(seg);
      }
    }

    // Special case: "The Mortal Instruments 6: City of Heavenly Fire" -> Title: "City of Heavenly Fire", Series: "The Mortal Instruments, Book 6"
    const tmiMatch = mainTitle.match(/^The Mortal Instruments\s+(\d+)$/i);
    if (tmiMatch && keptSubsegments.length > 0) {
      series = `The Mortal Instruments, Book ${tmiMatch[1]}`;
      working = keptSubsegments[0];
      subtitle = keptSubsegments.slice(1).join(": ") || null;
    } else {
      working = mainTitle;
      subtitle = keptSubsegments.length > 0 ? titleCase(keptSubsegments.join(": ")) : null;
    }
  }

  return {
    title: titleCase(working),
    subtitle,
    series,
    extractedAuthor,
    promotionalTextRemoved: strippedParts.length > 0 ? strippedParts.join(" | ") : null,
  };
}

async function main() {
  const correctionsData = await readJson(PATHS.corrections, { corrections: {} });
  const correctionsMap = correctionsData.corrections || {};
  const overridesData = await readJson(PATHS.overrides, { overrides: {} });
  const overridesMap = overridesData.overrides || {};

  // Read all wishlist-*.txt files in data/books/source
  const sourceFiles = (await fs.readdir(SOURCE_DIR)).filter((f) =>
    /^wishlist-.*\.txt$/i.test(f)
  );

  let rawEntries = [];
  for (const file of sourceFiles) {
    const content = await fs.readFile(path.join(SOURCE_DIR, file), "utf8");
    const parsed = parseRawWishlistText(content, file);
    rawEntries.push(...parsed);
  }

  // Also append any manual JSON additions from data/books/source/manual-additions.json
  const manualAdditions = await readJson(
    path.join(SOURCE_DIR, "manual-additions.json"),
    []
  );
  for (const item of manualAdditions) {
    if (item && item.title) {
      rawEntries.push({
        sourceFile: "manual-additions.json",
        originalListingTitle: item.title,
        originalListingAuthor: item.author ?? null,
        isbn: item.isbn ?? null,
        format: item.format ?? null,
        addedDate: item.addedDate ?? null,
      });
    }
  }

  const normalizedBooks = [];
  const seenByWorkKey = new Map();

  for (let i = 0; i < rawEntries.length; i++) {
    const entry = rawEntries[i];
    const id = `book-${String(i + 1).padStart(3, "0")}`;

    const autoCleaned = cleanMarketplaceTitle(
      entry.originalListingTitle,
      entry.originalListingAuthor
    );

    let title = autoCleaned.title;
    let subtitle = autoCleaned.subtitle;
    let series = autoCleaned.series;
    let author = entry.originalListingAuthor
      ? personNameCase(entry.originalListingAuthor)
      : autoCleaned.extractedAuthor;

    const reviewReasons = [];
    let correctionBasis = null;
    let correctionNote = null;

    if (autoCleaned.extractedAuthor && !entry.originalListingAuthor) {
      reviewReasons.push(
        `Author '${autoCleaned.extractedAuthor}' was embedded inside the listing title rather than a dedicated author field.`
      );
    }

    // Apply listing-level corrections from data/books/corrections.json
    const corr = correctionsMap[entry.originalListingTitle];
    if (corr) {
      if (corr.title !== undefined) title = corr.title;
      if (corr.subtitle !== undefined) subtitle = corr.subtitle;
      if (corr.author !== undefined) author = corr.author;
      if (corr.series !== undefined) series = corr.series;
      correctionBasis = corr.basis || "listing";
      correctionNote = corr.reason || null;
      if (corr.basis === "editorial") {
        reviewReasons.push(`Editorial normalization: ${corr.reason}`);
      }
    }

    // Apply user overrides from data/books/overrides.json
    const userOverride = overridesMap[id] || {};
    if (typeof userOverride.title === "string" && userOverride.title.trim()) {
      title = userOverride.title.trim();
    }
    if (typeof userOverride.author === "string" && userOverride.author.trim()) {
      author = userOverride.author.trim();
    }
    const overrideIsbn =
      typeof userOverride.isbn === "string" && userOverride.isbn.trim()
        ? userOverride.isbn.trim()
        : null;

    // Flag missing or suspicious authors
    if (!author) {
      reviewReasons.push(
        "Missing author in wishlist export (author was not guessed)."
      );
    } else if (
      normalizeText(title) === "ikigai" &&
      normalizeText(author).includes("keira miki")
    ) {
      reviewReasons.push(
        "Listed author 'Keira Miki' may be an alternate/summary edition rather than Hector Garcia & Francesc Miralles; verify intended edition."
      );
    }

    // Check for likely duplicates across the collection (without deleting either record!)
    const workSignature = `${matchKey(title)}::${normalizeText(author || "")}`;
    let duplicateOf = null;
    if (seenByWorkKey.has(workSignature)) {
      duplicateOf = seenByWorkKey.get(workSignature);
      reviewReasons.push(
        `Likely duplicate of ${duplicateOf} (both records preserved; set "hidden": true in data/books/overrides.json if you wish to hide one).`
      );
    } else {
      seenByWorkKey.set(workSignature, id);
    }

    const recordStatus = reviewReasons.length > 0 ? "needs-review" : "clean";

    normalizedBooks.push({
      id,
      streetOrder: i + 1,
      title,
      subtitle,
      author: author || null,
      series: series || null,
      isbn: overrideIsbn || entry.isbn || null,
      format: entry.format || null,
      addedDate: entry.addedDate || null,
      originalListingTitle: entry.originalListingTitle,
      originalListingAuthor: entry.originalListingAuthor,
      promotionalTextRemoved: autoCleaned.promotionalTextRemoved,
      correctionBasis,
      correctionNote,
      duplicateOf,
      recordStatus,
      reviewReasons,
      sourceFile: entry.sourceFile,
    });
  }

  await writeJson(PATHS.normalized, {
    generatedAt: new Date().toISOString(),
    totalRecords: normalizedBooks.length,
    cleanCount: normalizedBooks.filter((b) => b.recordStatus === "clean").length,
    needsReviewCount: normalizedBooks.filter((b) => b.recordStatus === "needs-review").length,
    duplicateCount: normalizedBooks.filter((b) => b.duplicateOf !== null).length,
    books: normalizedBooks,
  });

  console.log(
    `[import-books] Imported ${normalizedBooks.length} records -> ${relative(
      PATHS.normalized
    )} (${normalizedBooks.filter((b) => b.recordStatus === "clean").length} clean, ${
      normalizedBooks.filter((b) => b.recordStatus === "needs-review").length
    } needs-review)`
  );
}

main().catch((err) => {
  console.error("[import-books] Fatal error:", err);
  process.exit(1);
});
