// Shared helpers for the Book Street content pipeline (Node >= 18, no dependencies).
import { promises as fs } from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data", "books");
export const SOURCE_DIR = path.join(DATA_DIR, "source");
export const CACHE_DIR = path.join(DATA_DIR, "cache");
export const PATHS = {
  normalized: path.join(DATA_DIR, "books.normalized.json"),
  corrections: path.join(DATA_DIR, "corrections.json"),
  overrides: path.join(DATA_DIR, "overrides.json"),
  coversManifest: path.join(DATA_DIR, "covers.manifest.json"),
  openLibraryCache: path.join(CACHE_DIR, "openlibrary.json"),
  synopses: path.join(DATA_DIR, "synopses.json"),
  catalog: path.join(DATA_DIR, "catalog.generated.json"),
  report: path.join(DATA_DIR, "REVIEW_REPORT.md"),
};

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (err) {
    if (err && err.code === "ENOENT") return fallback;
    throw new Error(`Could not parse ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

export async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Lower-case, strip accents/punctuation, collapse whitespace. */
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalized title without a leading article, used for matching. */
export function matchKey(title) {
  return normalizeText(title).replace(/^(the|a|an) /, "");
}

export function slugify(value) {
  return normalizeText(value).replace(/ /g, "-").replace(/-+/g, "-").slice(0, 60) || "untitled";
}

const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "of", "in", "with", "as", "vs",
]);

function capitalizeWord(word) {
  return word.replace(/^([^a-zA-Z]*)([a-zA-Z])/, (_, pre, ch) => pre + ch.toUpperCase());
}

/** Title-case: fixes ALL-CAPS listings and lower-cases minor words (except first/last). */
export function titleCase(value) {
  const text = String(value ?? "").trim();
  if (!text) return text;
  const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
  const words = text.split(/\s+/);
  return words
    .map((raw, index) => {
      let word = isAllCaps ? raw.toLowerCase() : raw;
      const bare = word.toLowerCase().replace(/[^a-z]/g, "");
      const isEdge = index === 0 || index === words.length - 1;
      if (!isEdge && MINOR_WORDS.has(bare) && !/[:]$/.test(words[index - 1] ?? "")) {
        return word.toLowerCase();
      }
      return isAllCaps || /^[a-z]/.test(word) ? capitalizeWord(word) : word;
    })
    .join(" ");
}

export function personNameCase(value) {
  const text = String(value ?? "").trim();
  if (!text) return text;
  if (text === text.toUpperCase() || text === text.toLowerCase()) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/(^|[.\-'])([a-z])/g, (_, p, c) => p + c.toUpperCase()))
      .join(" ");
  }
  return text;
}

/** Classic Levenshtein ratio in [0, 1]. */
export function similarity(a, b) {
  const s = normalizeText(a);
  const t = normalizeText(b);
  if (!s.length && !t.length) return 1;
  const dp = Array.from({ length: t.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= t.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (s[i - 1] === t[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return 1 - dp[t.length] / Math.max(s.length, t.length);
}

/** Author comparison: 1 = same surname + compatible first initial, 0.8 = surname only, 0 = no match. */
export function authorScore(intended, candidates) {
  if (!intended || !Array.isArray(candidates) || candidates.length === 0) return 0;
  const parts = normalizeText(intended).split(" ").filter(Boolean);
  if (!parts.length) return 0;
  const surname = parts[parts.length - 1];
  const initial = parts[0][0];
  let best = 0;
  for (const name of candidates) {
    const cp = normalizeText(name).split(" ").filter(Boolean);
    if (!cp.length) continue;
    const cSurname = cp[cp.length - 1];
    if (cSurname !== surname && !normalizeText(name).includes(surname)) continue;
    const score = cp[0][0] === initial ? 1 : 0.8;
    best = Math.max(best, score);
  }
  return best;
}

export function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

