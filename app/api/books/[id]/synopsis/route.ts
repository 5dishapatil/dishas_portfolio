import { NextResponse } from "next/server";
import catalogData from "@/data/books/catalog.generated.json";
import type { BookCatalogItem } from "@/app/components/books/types";

const USER_AGENT =
  "DishaBookStreetCatalogue/1.0 (https://openlibrary.org; personal book-street showcase)";

function extractOpenLibraryDescription(rawDesc: unknown): string | null {
  if (!rawDesc) return null;
  const text =
    typeof rawDesc === "string"
      ? rawDesc
      : typeof rawDesc === "object" &&
        rawDesc !== null &&
        "value" in rawDesc &&
        typeof (rawDesc as { value: unknown }).value === "string"
      ? (rawDesc as { value: string }).value
      : null;

  if (!text) return null;

  // Strip markdown links, source footers, and excessive whitespace
  const cleaned = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\(\[source\]\[[^\]]*\]\)/gi, "")
    .replace(/[-]{3,}[\s\S]*$/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 40) return null;
  return cleaned.length > 650 ? `${cleaned.slice(0, 647).trim()}...` : cleaned;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const books = (catalogData.books as unknown) as BookCatalogItem[];
  const book = books.find((b) => b.id === id);

  if (!book) {
    return NextResponse.json(
      { error: `Book '${id}' not found in catalogue.` },
      { status: 404 }
    );
  }

  // If the book already has a curated/verified synopsis in catalog.generated.json, return it immediately
  if (
    book.synopsis &&
    book.synopsis.status === "verified" &&
    !book.synopsis.text.includes("awaiting confirmation")
  ) {
    return NextResponse.json({
      id: book.id,
      title: book.title,
      author: book.author,
      synopsis: book.synopsis,
      openLibraryWorkKey: book.cover.openLibraryWorkKey,
    });
  }

  // Otherwise, if an Open Library Work key is available, lazily query Open Library's Work JSON
  if (book.cover.openLibraryWorkKey) {
    try {
      const workUrl = `https://openlibrary.org${book.cover.openLibraryWorkKey}.json`;
      const res = await fetch(workUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const workJson = (await res.json()) as {
          description?: unknown;
          subjects?: string[];
        };
        const olDescription = extractOpenLibraryDescription(
          workJson.description
        );
        const subjects = Array.isArray(workJson.subjects)
          ? workJson.subjects.slice(0, 4)
          : [];

        if (olDescription) {
          return NextResponse.json({
            id: book.id,
            title: book.title,
            author: book.author,
            synopsis: {
              status: "verified",
              genre: book.synopsis.genre || subjects[0] || "Literary Work",
              themes:
                book.synopsis.themes.length > 0
                  ? book.synopsis.themes
                  : subjects.slice(0, 3),
              text: olDescription,
              sources: [
                {
                  label: `Open Library Work (${book.cover.openLibraryWorkKey.replace(
                    "/works/",
                    ""
                  )})`,
                  url: `https://openlibrary.org${book.cover.openLibraryWorkKey}`,
                },
                ...book.synopsis.sources.filter(
                  (s) =>
                    s.url !==
                    `https://openlibrary.org${book.cover.openLibraryWorkKey}`
                ),
              ],
            },
            openLibraryWorkKey: book.cover.openLibraryWorkKey,
          });
        }
      }
    } catch {
      // Fall through to pre-generated synopsis record
    }
  }

  return NextResponse.json({
    id: book.id,
    title: book.title,
    author: book.author,
    synopsis: book.synopsis,
    openLibraryWorkKey: book.cover.openLibraryWorkKey,
  });
}

