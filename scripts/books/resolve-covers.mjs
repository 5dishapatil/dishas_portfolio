// Step 2 of the Book Street content pipeline:
// Resolves book covers & bibliographic metadata using the FREE Open Library Search & Covers APIs
// (https://openlibrary.org/search.json and https://covers.openlibrary.org/b/id/<COVER_ID>-L.jpg).
// No Google Books API or paid/cloud-trial service is used.
//
// Outputs:
//   - data/books/cache/openlibrary.json      (persistent API response cache)
//   - data/books/covers.manifest.json        (cover resolution audit trail)
//   - data/books/catalog.generated.json      (complete scene + interior catalogue consumed by /books)
//   - data/books/REVIEW_REPORT.md            (human-readable report of clean vs needs-review records)

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ROOT,
  PATHS,
  readJson,
  writeJson,
  sleep,
  normalizeText,
  matchKey,
  similarity,
  authorScore,
  relative,
} from "./lib.mjs";

const USER_AGENT =
  "DishaBookStreetCatalogue/1.0 (https://openlibrary.org; personal book-street showcase)";

const ARCHITECTURAL_PALETTES = [
  {
    name: "burgundy-gilt",
    primary: "#5B1E2D",
    secondary: "#3A111B",
    trim: "#D8AE68",
    accent: "#F3D393",
    windowGlow: "#FFE29A",
    doorWood: "#2C1018",
    roofSlate: "#251624",
  },
  {
    name: "oxford-navy-brass",
    primary: "#1C2D4A",
    secondary: "#101B2E",
    trim: "#D6A85A",
    accent: "#F0CF8E",
    windowGlow: "#FFE6A3",
    doorWood: "#162035",
    roofSlate: "#141D2B",
  },
  {
    name: "emerald-apothecary",
    primary: "#1B3F36",
    secondary: "#102721",
    trim: "#C9A66B",
    accent: "#EBD09E",
    windowGlow: "#FFE49E",
    doorWood: "#152B24",
    roofSlate: "#162324",
  },
  {
    name: "plum-velvet-rose",
    primary: "#432245",
    secondary: "#28132B",
    trim: "#DEB27C",
    accent: "#F5D7AD",
    windowGlow: "#FFE099",
    doorWood: "#241126",
    roofSlate: "#1F1529",
  },
  {
    name: "terracotta-parchment",
    primary: "#6E2E26",
    secondary: "#471B16",
    trim: "#E0B979",
    accent: "#F7DEC0",
    windowGlow: "#FFE7A8",
    doorWood: "#381510",
    roofSlate: "#2B191D",
  },
  {
    name: "prussian-teal-copper",
    primary: "#1B3C4B",
    secondary: "#102530",
    trim: "#D99B66",
    accent: "#F2C69D",
    windowGlow: "#FFE5A0",
    doorWood: "#132833",
    roofSlate: "#16212C",
  },
  {
    name: "obsidian-gold-folio",
    primary: "#23222E",
    secondary: "#15141D",
    trim: "#D9B166",
    accent: "#F5DC9C",
    windowGlow: "#FFE49C",
    doorWood: "#1A1924",
    roofSlate: "#14141E",
  },
  {
    name: "warm-ochre-leather",
    primary: "#63411F",
    secondary: "#3D2610",
    trim: "#E5C17B",
    accent: "#F9E2B3",
    windowGlow: "#FFEAA8",
    doorWood: "#2E1C0C",
    roofSlate: "#241B17",
  },
];

const ROOF_STYLES = ["gable-steep", "mansard-dormer", "stepped-flemish", "arched-cornice", "turret-crest"];
const ORNAMENT_STYLES = ["celestial", "botanical", "gothic-tracery", "art-deco", "classical-filigree", "heraldic-crest"];
const DOOR_STYLES = ["arched-fanlight", "double-panelled", "gothic-oak", "atelier-glazed"];

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildArchitectureSpec(book, synopsisEntry) {
  const seed = hashString(`${book.id}::${book.title}::${book.author || ""}`);
  const genreText = normalizeText(`${synopsisEntry?.genre || ""} ${(synopsisEntry?.themes || []).join(" ")} ${book.series || ""}`);

  let paletteIdx = seed % ARCHITECTURAL_PALETTES.length;
  let ornament = ORNAMENT_STYLES[seed % ORNAMENT_STYLES.length];
  let roof = ROOF_STYLES[(seed >>> 3) % ROOF_STYLES.length];

  if (/gothic|dark|shadow|underworld|hades|vampire|night|curse/.test(genreText)) {
    paletteIdx = seed % 2 === 0 ? 6 : 3; // obsidian or plum
    ornament = "gothic-tracery";
  } else if (/fantasy|romantasy|fae|royal|crown|kingdom|empress/.test(genreText)) {
    paletteIdx = [0, 1, 2, 3][(seed >>> 2) % 4];
    ornament = seed % 2 === 0 ? "heraldic-crest" : "celestial";
  } else if (/thriller|crime|mystery|psycholog|puzzle/.test(genreText)) {
    paletteIdx = [1, 5, 6][(seed >>> 2) % 3];
    ornament = "art-deco";
  } else if (/romcom|romantic comedy|contemporary|summer|beach|flower/.test(genreText)) {
    paletteIdx = [4, 5, 7, 0][(seed >>> 2) % 4];
    ornament = "botanical";
  } else if (/spiritual|fable|philosophy/.test(genreText)) {
    paletteIdx = [2, 7][(seed >>> 2) % 2];
    ornament = "classical-filigree";
  }

  const palette = ARCHITECTURAL_PALETTES[paletteIdx];
  const doorStyle = DOOR_STYLES[(seed >>> 5) % DOOR_STYLES.length];
  const heightPx = 430 + (seed % 5) * 18; // 430px .. 502px
  const widthPx = 228 + ((seed >>> 4) % 3) * 12; // 228px .. 252px
  const floors = 3 + (seed % 2); // 3 or 4 stories
  const ribbonColor = ["#C93B3B", "#D9A441", "#3B7EA1", "#8C3B69", "#3D8B6E"][(seed >>> 7) % 5];

  return {
    paletteName: palette.name,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    trimColor: palette.trim,
    accentColor: palette.accent,
    windowGlowColor: palette.windowGlow,
    doorWoodColor: palette.doorWood,
    roofSlateColor: palette.roofSlate,
    ribbonColor,
    roofStyle: roof,
    ornamentStyle: ornament,
    doorStyle,
    heightPx,
    widthPx,
    floors,
    spineRibCount: 4 + (seed % 2),
  };
}

async function cacheCoverImageLocally(coverId, bookId) {
  if (!coverId) return { localLarge: null, localMedium: null };
  const coversDir = path.join(ROOT, "public", "books", "covers");
  await fs.mkdir(coversDir, { recursive: true });

  const largePath = path.join(coversDir, `${bookId}.jpg`);
  const mediumPath = path.join(coversDir, `${bookId}-m.jpg`);

  let hasLarge = false;
  let hasMedium = false;

  try {
    const stat = await fs.stat(largePath);
    if (stat.size > 500) hasLarge = true;
  } catch {}

  try {
    const stat = await fs.stat(mediumPath);
    if (stat.size > 500) hasMedium = true;
  } catch {}

  if (!hasLarge) {
    try {
      const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 500) {
          await fs.writeFile(largePath, buf);
          hasLarge = true;
        }
      }
    } catch (e) {
      console.warn(`[resolve-covers] Could not cache large cover for ${bookId}: ${e.message}`);
    }
  }

  if (!hasMedium) {
    try {
      const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 500) {
          await fs.writeFile(mediumPath, buf);
          hasMedium = true;
        }
      }
    } catch (e) {
      console.warn(`[resolve-covers] Could not cache medium cover for ${bookId}: ${e.message}`);
    }
  }

  return {
    localLarge: hasLarge ? `/books/covers/${bookId}.jpg` : null,
    localMedium: hasMedium ? `/books/covers/${bookId}-m.jpg` : (hasLarge ? `/books/covers/${bookId}.jpg` : null),
  };
}

async function fetchOpenLibraryJson(url, cache) {
  if (cache.queries[url]) {
    return { data: cache.queries[url], fromCache: true };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    const json = await res.json();
    cache.queries[url] = json;
    return { data: json, fromCache: false };
  } finally {
    clearTimeout(timeout);
  }
}

function scoreOpenLibraryCandidate(book, doc) {
  const docTitle = doc.title || "";
  const intendedKey = matchKey(book.title);
  const candidateKey = matchKey(docTitle);

  let titleSim = similarity(intendedKey, candidateKey);

  // Handle cases where Open Library includes the subtitle or series in doc.title
  const docMainTitle = docTitle.split(":")[0].split("(")[0].trim();
  const mainKey = matchKey(docMainTitle);
  const mainSim = similarity(intendedKey, mainKey);
  titleSim = Math.max(titleSim, mainSim);

  if (candidateKey === intendedKey || mainKey === intendedKey) {
    titleSim = 1;
  } else if (
    candidateKey.startsWith(intendedKey + " ") ||
    intendedKey.startsWith(candidateKey + " ")
  ) {
    titleSim = Math.max(titleSim, 0.9);
  }

  const aScore = book.author ? authorScore(book.author, doc.author_name || []) : 0;
  const hasCover = Boolean(doc.cover_i);

  // Combined weighted confidence
  const totalScore = titleSim * 0.58 + aScore * 0.37 + (hasCover ? 0.05 : 0);

  return {
    titleSim: Number(titleSim.toFixed(3)),
    authorScore: Number(aScore.toFixed(3)),
    hasCover,
    totalScore: Number(totalScore.toFixed(3)),
  };
}

async function resolveSingleBook(book, overridesMap, cache) {
  const userOverride = overridesMap[book.id] || {};

  // 1. Check if the user provided an explicit cover override in data/books/overrides.json
  if (userOverride.coverUrl) {
    return {
      matchStatus: "user-override",
      confidence: 1,
      coverSource: "user-override",
      coverUrl: userOverride.coverUrl,
      coverMediumUrl: userOverride.coverUrl,
      spineImageUrl: userOverride.spineImageUrl || null,
      openLibraryWorkKey: userOverride.openLibraryWorkKey || null,
      openLibraryEditionKey: userOverride.openLibraryEditionKey || null,
      openLibraryCoverId: null,
      matchedTitle: book.title,
      matchedAuthors: book.author ? [book.author] : [],
      firstPublishYear: userOverride.firstPublishYear || null,
      attribution: userOverride.attribution || "User-supplied cover image",
      notes: "Explicit override from data/books/overrides.json",
    };
  }

  // 2. If the author is missing from the listing and not overridden, do NOT guess or fabricate
  if (!book.author) {
    return {
      matchStatus: "missing-author",
      confidence: 0,
      coverSource: "architectural-fallback",
      coverUrl: null,
      coverMediumUrl: null,
      spineImageUrl: userOverride.spineImageUrl || null,
      openLibraryWorkKey: null,
      openLibraryEditionKey: null,
      openLibraryCoverId: null,
      matchedTitle: null,
      matchedAuthors: [],
      firstPublishYear: null,
      attribution: null,
      notes:
        "Author missing in raw wishlist export; skipped automated cover matching to avoid guessing an unverified book edition.",
    };
  }

  // 3. Special check for suspicious listing author ('Ikigai' by 'Keira Miki') unless overridden
  if (
    normalizeText(book.title) === "ikigai" &&
    normalizeText(book.author).includes("keira miki") &&
    !userOverride.author
  ) {
    return {
      matchStatus: "ambiguous-author",
      confidence: 0,
      coverSource: "architectural-fallback",
      coverUrl: null,
      coverMediumUrl: null,
      spineImageUrl: userOverride.spineImageUrl || null,
      openLibraryWorkKey: null,
      openLibraryEditionKey: null,
      openLibraryCoverId: null,
      matchedTitle: null,
      matchedAuthors: [],
      firstPublishYear: null,
      attribution: null,
      notes:
        "Listed author 'Keira Miki' does not match Open Library's verified 'Ikigai' editions (Héctor García & Francesc Miralles). Held for manual confirmation.",
    };
  }

  // 4. Query Open Library Search API
  const authorParts = book.author.trim().split(/\s+/);
  const authorSurname = authorParts[authorParts.length - 1];
  const fields =
    "key,title,author_name,cover_i,cover_edition_key,edition_key,first_publish_year,isbn,edition_count";

  const cleanIsbn = book.isbn ? String(book.isbn).trim() : null;
  const urlsToTry = [];

  // Special cases for Open Library work cataloguing
  if (book.id === "book-019") {
    urlsToTry.push(
      `https://openlibrary.org/search.json?isbn=9780006490340&fields=${fields}&limit=5`
    );
  }
  if (book.id === "book-006") {
    urlsToTry.push(
      `https://openlibrary.org/search.json?q=Sneak+Peek+for+the+Poet+Empress+Shen+Tao&fields=${fields}&limit=5`
    );
  }

  if (cleanIsbn) {
    urlsToTry.push(
      `https://openlibrary.org/search.json?isbn=${encodeURIComponent(
        cleanIsbn
      )}&fields=${fields}&limit=5`
    );
  }
  urlsToTry.push(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(
      book.title
    )}&author=${encodeURIComponent(authorSurname)}&fields=${fields}&limit=8`
  );
  if (!/^the\s+/i.test(book.title)) {
    urlsToTry.push(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        "The " + book.title
      )}&author=${encodeURIComponent(authorSurname)}&fields=${fields}&limit=8`
    );
  } else {
    urlsToTry.push(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        book.title.replace(/^the\s+/i, "")
      )}&author=${encodeURIComponent(authorSurname)}&fields=${fields}&limit=8`
    );
  }
  urlsToTry.push(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(
      `${book.title} ${book.author}`
    )}&fields=${fields}&limit=8`
  );

  let docs = [];
  let madeNetworkCall = false;

  for (const url of urlsToTry) {
    try {
      const { data, fromCache } = await fetchOpenLibraryJson(url, cache);
      if (!fromCache) madeNetworkCall = true;
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        docs.push(...data.docs);
        // Check if we already have a strong verified match with cover; if so, stop querying
        const hasStrongWithCover = data.docs.some((d) => {
          const s = scoreOpenLibraryCandidate(book, d);
          return s.titleSim >= 0.85 && s.authorScore >= 0.8 && s.hasCover;
        });
        if (hasStrongWithCover) break;
      }
    } catch (err) {
      console.warn(`[resolve-covers] Warning querying Open Library for ${book.id}: ${err.message}`);
    }
  }

  if (madeNetworkCall) {
    await sleep(140);
  }

  if (docs.length === 0) {
    return {
      matchStatus: "unmatched",
      confidence: 0,
      coverSource: "architectural-fallback",
      coverUrl: null,
      coverMediumUrl: null,
      spineImageUrl: userOverride.spineImageUrl || null,
      openLibraryWorkKey: null,
      openLibraryEditionKey: null,
      openLibraryCoverId: null,
      matchedTitle: null,
      matchedAuthors: [],
      firstPublishYear: null,
      attribution: null,
      notes: "No matching records returned by Open Library Search API.",
    };
  }

  // Score all candidates and pick the best verified match (preferring a doc with cover_i if tied)
  const scored = docs
    .map((doc) => ({
      doc,
      score: scoreOpenLibraryCandidate(book, doc),
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);

  // If the top candidate has no cover_i, check if another strongly matching candidate has cover_i
  let best = scored[0];
  if (!best.score.hasCover) {
    const withCover = scored.find(
      (cand) =>
        cand.score.hasCover &&
        cand.score.titleSim >= 0.84 &&
        cand.score.authorScore >= 0.8
    );
    if (withCover) {
      best = withCover;
    }
  }

  const { doc, score } = best;
  const isSpecialWorkMatch =
    (book.id === "book-019" && doc.key === "/works/OL62073W") ||
    (book.id === "book-006" && doc.key === "/works/OL44600471W");
  const isStrongMatch =
    isSpecialWorkMatch || (score.titleSim >= 0.82 && score.authorScore >= 0.8);

  if (!isStrongMatch) {
    return {
      matchStatus: "ambiguous",
      confidence: score.totalScore,
      coverSource: "architectural-fallback",
      coverUrl: null,
      coverMediumUrl: null,
      spineImageUrl: userOverride.spineImageUrl || null,
      openLibraryWorkKey: doc.key || null,
      openLibraryEditionKey: doc.cover_edition_key || (doc.edition_key && doc.edition_key[0]) || null,
      openLibraryCoverId: doc.cover_i || null,
      matchedTitle: doc.title || null,
      matchedAuthors: doc.author_name || [],
      firstPublishYear: doc.first_publish_year || null,
      attribution: null,
      notes: `Closest Open Library result '${doc.title}' by ${(doc.author_name || []).join(
        ", "
      )} scored below verification threshold (titleSim=${score.titleSim}, authorScore=${score.authorScore}).`,
    };
  }

  const coverId = doc.cover_i || null;
  const remoteCoverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : null;
  const remoteCoverMediumUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;

  // Cache cover locally into public/books/covers/ so retrieval is instantaneous
  const localCache = await cacheCoverImageLocally(coverId, book.id);
  const coverUrl = localCache.localLarge || remoteCoverUrl;
  const coverMediumUrl = localCache.localMedium || remoteCoverMediumUrl;

  return {
    matchStatus: coverId ? "verified" : "verified-no-cover",
    confidence: isSpecialWorkMatch ? 1 : score.totalScore,
    coverSource: coverId ? "openlibrary" : "architectural-fallback",
    coverUrl,
    coverMediumUrl,
    remoteCoverUrl,
    spineImageUrl: userOverride.spineImageUrl || null,
    openLibraryWorkKey: doc.key || null,
    openLibraryEditionKey:
      doc.cover_edition_key || (doc.edition_key && doc.edition_key[0]) || null,
    openLibraryCoverId: coverId,
    matchedTitle: isSpecialWorkMatch ? book.title : (doc.title || book.title),
    matchedAuthors: doc.author_name || [book.author],
    firstPublishYear: doc.first_publish_year || null,
    attribution: coverId
      ? "Cover art & bibliographic metadata courtesy of Open Library (openlibrary.org)"
      : "Bibliographic metadata verified via Open Library (openlibrary.org)",
    notes: coverId
      ? `Verified match on Open Library (titleSim=${score.titleSim}, authorScore=${score.authorScore}). Cached locally for high-speed retrieval.`
      : `Work verified on Open Library (${doc.key}), but no cover_i image is indexed yet; using architectural spine design.`,
  };
}

function generateReviewReportMarkdown(catalogBooks, stats) {
  const lines = [];
  lines.push("# Book Street — Catalogue Import & Open Library Verification Report");
  lines.push("");
  lines.push(`- **Generated At**: \`${stats.generatedAt}\``);
  lines.push(`- **Total Wishlist Records Imported**: **${stats.total}** (no records deleted)`);
  lines.push(`- **Verified Open Library Matches**: **${stats.verifiedWithCover + stats.verifiedNoCover}** (**${stats.verifiedWithCover}** with Open Library front-cover art, **${stats.verifiedNoCover}** verified metadata using architectural spine fallback)`);
  lines.push(`- **Records Flagged \`needs-review\`**: **${stats.needsReview}**`);
  lines.push(`- **Missing Author in Raw Listing (Not Guessed)**: **${stats.missingAuthor}**`);
  lines.push(`- **Preserved Duplicates Detected**: **${stats.duplicates}**`);
  lines.push("");
  lines.push("## 1. Entries Requiring Manual Review (`needs-review`)");
  lines.push("");
  lines.push("| ID | Street # | Normalized Title | Normalized Author | Original Listing Title | Original Listing Author | Cover Status | Review Reason(s) |");
  lines.push("| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- |");

  const reviewBooks = catalogBooks.filter((b) => b.recordStatus === "needs-review");
  for (const b of reviewBooks) {
    const reasons = [...b.reviewReasons];
    if (b.cover.notes && !reasons.includes(b.cover.notes)) {
      reasons.push(b.cover.notes);
    }
    lines.push(
      `| \`${b.id}\` | #${b.streetOrder} | **${b.title}** | ${
        b.author ? b.author : "_Missing_"
      } | ${b.originalListingTitle.replace(/\|/g, "\\|")} | ${
        b.originalListingAuthor || "_None_"
      } | \`${b.cover.matchStatus}\` | ${reasons.join(" — ").replace(/\|/g, "\\|")} |`
    );
  }

  lines.push("");
  lines.push("## 2. Promotional & Marketplace Text Stripped Automatically");
  lines.push("");
  lines.push("| ID | Clean Title | Author | Promotional / Marketplace Text Removed |");
  lines.push("| :--- | :--- | :--- | :--- |");

  for (const b of catalogBooks.filter((x) => x.promotionalTextRemoved)) {
    lines.push(
      `| \`${b.id}\` | **${b.title}** | ${b.author || "_Missing_"} | \`${b.promotionalTextRemoved.replace(
        /\|/g,
        "\\|"
      )}\` |`
    );
  }

  lines.push("");
  lines.push("## 3. How to Supply Missing Authors, Covers, or New Books");
  lines.push("");
  lines.push("1. **Override or confirm an existing book**: Edit `data/books/overrides.json` keyed by book ID (e.g. `\"book-003\"`, `\"book-005\"`, `\"book-011\"`, `\"book-048\"`, `\"book-058\"`) and provide `\"author\"`, `\"isbn\"`, `\"coverUrl\"`, or `\"spineImageUrl\"`.");
  lines.push("2. **Append new books**: Drop a new wishlist export into `data/books/source/wishlist-*.txt` or add JSON objects to `data/books/source/manual-additions.json`.");
  lines.push("3. **Rebuild the catalogue**: Run `npm run books:build` (which runs `import-books.mjs` followed by `resolve-covers.mjs`). The 3D street scene automatically adapts to any collection size.");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const normalizedData = await readJson(PATHS.normalized, null);
  if (!normalizedData || !Array.isArray(normalizedData.books)) {
    throw new Error(
      "data/books/books.normalized.json not found. Run `node scripts/books/import-books.mjs` first."
    );
  }

  const overridesData = await readJson(PATHS.overrides, { overrides: {} });
  const overridesMap = overridesData.overrides || {};
  const synopsesData = await readJson(PATHS.synopses, { synopses: {} });
  const synopsesMap = synopsesData.synopses || {};
  const cache = await readJson(PATHS.openLibraryCache, {
    updatedAt: null,
    queries: {},
  });

  const books = normalizedData.books;
  const manifestEntries = [];
  const catalogBooks = [];

  console.log(`[resolve-covers] Resolving ${books.length} books via Open Library...`);

  // Process in polite batches of 4
  const BATCH_SIZE = 4;
  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((book) => resolveSingleBook(book, overridesMap, cache))
    );

    for (let j = 0; j < batch.length; j++) {
      const book = batch[j];
      const coverResult = results[j];
      const synopsisEntry = synopsesMap[book.id] || null;
      const userOverride = overridesMap[book.id] || {};

      // Merge Open Library Work URL into synopsis sources if matched
      const sources = [...(synopsisEntry?.sources || [])];
      if (coverResult.openLibraryWorkKey) {
        const workUrl = `https://openlibrary.org${coverResult.openLibraryWorkKey}`;
        if (!sources.some((s) => s.url === workUrl)) {
          sources.unshift({
            label: `Open Library Work (${coverResult.openLibraryWorkKey.replace("/works/", "")})`,
            url: workUrl,
          });
        }
      }

      // If an editorial correction was confirmed by a high-confidence Open Library match, note it
      const reviewReasons = [...book.reviewReasons];
      let recordStatus = book.recordStatus;

      if (
        coverResult.matchStatus === "missing-author" ||
        coverResult.matchStatus === "ambiguous" ||
        coverResult.matchStatus === "ambiguous-author" ||
        coverResult.matchStatus === "unmatched"
      ) {
        recordStatus = "needs-review";
        if (
          coverResult.notes &&
          !reviewReasons.some((r) => r.includes(coverResult.notes))
        ) {
          reviewReasons.push(coverResult.notes);
        }
      }

      const architecture = buildArchitectureSpec(book, synopsisEntry);

      manifestEntries.push({
        id: book.id,
        title: book.title,
        author: book.author,
        ...coverResult,
      });

      catalogBooks.push({
        ...book,
        hidden: Boolean(userOverride.hidden),
        recordStatus,
        reviewReasons,
        cover: coverResult,
        synopsis: {
          status:
            userOverride.synopsis
              ? "user-override"
              : synopsisEntry?.status ||
                (coverResult.openLibraryWorkKey ? "verified" : "pending-verification"),
          genre: synopsisEntry?.genre || "Literary Fiction",
          themes: synopsisEntry?.themes || [],
          text:
            userOverride.synopsis ||
            synopsisEntry?.synopsis ||
            "A verified spoiler-free overview for this edition is awaiting confirmation in data/books/synopses.json.",
          sources,
        },
        architecture,
      });
    }
  }

  cache.updatedAt = new Date().toISOString();
  await writeJson(PATHS.openLibraryCache, cache);

  const generatedAt = new Date().toISOString();
  const stats = {
    generatedAt,
    total: catalogBooks.length,
    verifiedWithCover: catalogBooks.filter((b) => b.cover.matchStatus === "verified").length,
    verifiedNoCover: catalogBooks.filter((b) => b.cover.matchStatus === "verified-no-cover").length,
    needsReview: catalogBooks.filter((b) => b.recordStatus === "needs-review").length,
    missingAuthor: catalogBooks.filter((b) => !b.author).length,
    duplicates: catalogBooks.filter((b) => b.duplicateOf !== null).length,
  };

  await writeJson(PATHS.coversManifest, {
    ...stats,
    provider: "Open Library (https://openlibrary.org)",
    entries: manifestEntries,
  });

  await writeJson(PATHS.catalog, {
    ...stats,
    provider: "Open Library (https://openlibrary.org)",
    books: catalogBooks,
  });

  const reportMd = generateReviewReportMarkdown(catalogBooks, stats);
  await fs.writeFile(PATHS.report, reportMd, "utf8");

  console.log(
    `[resolve-covers] Done! Verified covers: ${stats.verifiedWithCover}/${stats.total} (plus ${stats.verifiedNoCover} verified metadata without cover_i; ${stats.missingAuthor} missing author; ${stats.needsReview} total needs-review).`
  );
  console.log(`[resolve-covers] Wrote ${relative(PATHS.catalog)} and ${relative(PATHS.report)}`);
}

main().catch((err) => {
  console.error("[resolve-covers] Fatal error:", err);
  process.exit(1);
});
