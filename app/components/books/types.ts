export interface BookCoverInfo {
  matchStatus:
    | "verified"
    | "verified-no-cover"
    | "user-override"
    | "missing-author"
    | "ambiguous"
    | "ambiguous-author"
    | "unmatched";
  confidence: number;
  coverSource: "openlibrary" | "user-override" | "architectural-fallback";
  coverUrl: string | null;
  coverMediumUrl: string | null;
  spineImageUrl: string | null;
  openLibraryWorkKey: string | null;
  openLibraryEditionKey: string | null;
  openLibraryCoverId: number | null;
  matchedTitle: string | null;
  matchedAuthors: string[];
  firstPublishYear: number | null;
  attribution: string | null;
  notes: string | null;
}

export interface BookSynopsisSource {
  label: string;
  url: string;
}

export interface BookSynopsisInfo {
  status: "verified" | "user-override" | "pending-verification";
  genre: string;
  themes: string[];
  text: string;
  sources: BookSynopsisSource[];
}

export interface BookArchitectureSpec {
  paletteName: string;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  accentColor: string;
  windowGlowColor: string;
  doorWoodColor: string;
  roofSlateColor: string;
  ribbonColor: string;
  roofStyle:
    | "gable-steep"
    | "mansard-dormer"
    | "stepped-flemish"
    | "arched-cornice"
    | "turret-crest";
  ornamentStyle:
    | "celestial"
    | "botanical"
    | "gothic-tracery"
    | "art-deco"
    | "classical-filigree"
    | "heraldic-crest";
  doorStyle:
    | "arched-fanlight"
    | "double-panelled"
    | "gothic-oak"
    | "atelier-glazed";
  heightPx: number;
  widthPx: number;
  floors: number;
  spineRibCount: number;
}

export interface BookCatalogItem {
  id: string;
  streetOrder: number;
  title: string;
  subtitle: string | null;
  author: string | null;
  series: string | null;
  isbn: string | null;
  format: string | null;
  addedDate: string | null;
  originalListingTitle: string;
  originalListingAuthor: string | null;
  promotionalTextRemoved: string | null;
  correctionBasis: string | null;
  correctionNote: string | null;
  duplicateOf: string | null;
  hidden: boolean;
  recordStatus: "clean" | "needs-review";
  reviewReasons: string[];
  sourceFile: string;
  archetypeId?: string;
  archetypeNumber?: string;
  archetypeName?: string;
  cover: BookCoverInfo;
  synopsis: BookSynopsisInfo;
  architecture: BookArchitectureSpec;
}

export interface BookCatalogManifest {
  generatedAt: string;
  total: number;
  verifiedWithCover: number;
  verifiedNoCover: number;
  needsReview: number;
  missingAuthor: number;
  duplicates: number;
  provider: string;
  books: BookCatalogItem[];
}

