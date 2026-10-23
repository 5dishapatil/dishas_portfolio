import React from "react";
import type { Metadata } from "next";
import catalogData from "@/data/books/catalog.generated.json";
import overridesData from "@/data/books/overrides.json";
import BookStreetScene from "@/app/components/books/BookStreetScene";
import type { BookCatalogManifest } from "@/app/components/books/types";

export const metadata: Metadata = {
  title: "The Book Street | DISHA",
  description:
    "Stroll along a blue-hour literary boulevard where every book in Disha's collection stands as an architectural book-spine townhouse.",
};

interface OverrideEntry {
  title?: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  spineImageUrl?: string;
  synopsis?: string;
  hidden?: boolean;
}

export default function BooksPage() {
  const rawCatalog = (catalogData as unknown) as BookCatalogManifest;
  const overridesMap = ((overridesData as unknown) as {
    overrides?: Record<string, OverrideEntry>;
  }).overrides ?? {};

  // Live-merge any manual edits from data/books/overrides.json so author/title/cover
  // updates appear immediately upon saving overrides.json
  const books = rawCatalog.books.map((book) => {
    const ov = overridesMap[book.id];
    if (!ov) return book;

    const mergedTitle =
      typeof ov.title === "string" && ov.title.trim()
        ? ov.title.trim()
        : book.title;
    const mergedAuthor =
      typeof ov.author === "string" && ov.author.trim()
        ? ov.author.trim()
        : book.author;
    const mergedIsbn =
      typeof ov.isbn === "string" && ov.isbn.trim()
        ? ov.isbn.trim()
        : book.isbn;
    const hasCustomCoverOverride =
      typeof ov.coverUrl === "string" && ov.coverUrl.trim().length > 0;
    const mergedCoverUrl = hasCustomCoverOverride
      ? ov.coverUrl!.trim()
      : book.cover.coverUrl;
    const mergedCoverMediumUrl = hasCustomCoverOverride
      ? ov.coverUrl!.trim()
      : book.cover.coverMediumUrl;

    const wasMissingAuthorResolved = !book.author && Boolean(mergedAuthor);

    return {
      ...book,
      title: mergedTitle,
      author: mergedAuthor,
      isbn: mergedIsbn,
      hidden: typeof ov.hidden === "boolean" ? ov.hidden : book.hidden,
      recordStatus: wasMissingAuthorResolved ? ("clean" as const) : book.recordStatus,
      cover: {
        ...book.cover,
        coverUrl: mergedCoverUrl,
        coverMediumUrl: mergedCoverMediumUrl,
      },
      synopsis:
        typeof ov.synopsis === "string" && ov.synopsis.trim()
          ? {
              ...book.synopsis,
              status: "user-override" as const,
              text: ov.synopsis.trim(),
            }
          : book.synopsis,
    };
  });

  const catalog: BookCatalogManifest = {
    ...rawCatalog,
    books,
    needsReview: books.filter((b) => b.recordStatus === "needs-review").length,
    missingAuthor: books.filter((b) => !b.author).length,
  };

  return <BookStreetScene catalog={catalog} />;
}
