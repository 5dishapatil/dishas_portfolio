import type { BookCatalogItem } from "./types";
import { ARCHETYPES, HouseArchetypeId } from "./archetypeStyles";

export interface MappedBookHouse extends BookCatalogItem {
  archetypeId: HouseArchetypeId;
  archetypeNumber: string;
  archetypeName: string;
}

/**
 * Classifies a book into one of the 10 distinct architectural archetypes
 * matching the reference images.
 */
export function classifyBookArchetype(book: BookCatalogItem): HouseArchetypeId {
  const g = (book.synopsis?.genre || "").toLowerCase();
  const t = (book.title || "").toLowerCase();
  const a = (book.author || "").toLowerCase();
  const s = (book.series || "").toLowerCase();
  const th = (book.synopsis?.themes || []).join(" ").toLowerCase();

  // 05 SELF HELP
  if (
    t.includes("atmamun") ||
    t.includes("ikigai") ||
    t.includes("5 am club") ||
    g.includes("spiritual") ||
    g.includes("self-help") ||
    g.includes("philosophy") ||
    a.includes("kapil gupta") ||
    a.includes("robin sharma")
  ) {
    return "self-help";
  }

  // 08 DARK ACADEMIA
  if (
    t.includes("atlas six") ||
    g.includes("dark academia") ||
    t.includes("inheritance games") ||
    t.includes("anatomy") ||
    t.includes("immortality") ||
    a.includes("olivie blake") ||
    a.includes("dana schwartz")
  ) {
    return "dark-academia";
  }

  // 09 ADVENTURE & EXPLORATION
  if (
    t.includes("throttled") ||
    t.includes("collided") ||
    t.includes("redeemed") ||
    s.includes("dirty air") ||
    th.includes("formula 1") ||
    th.includes("racing") ||
    th.includes("circuit") ||
    t.includes("adventure")
  ) {
    return "adventure-exploration";
  }

  // 06 FINANCE & BUSINESS
  if (
    t.includes("terms and conditions") ||
    t.includes("fine print") ||
    t.includes("final offer") ||
    s.includes("dreamland") ||
    t.includes("culpability") ||
    th.includes("billionaire") ||
    th.includes("corporate") ||
    th.includes("wealth")
  ) {
    return "finance-business";
  }

  // 07 SCIENCE FICTION
  if (
    t.includes("shatter me") ||
    t.includes("defy me") ||
    t.includes("unravel me") ||
    t.includes("ignite me") ||
    g.includes("sci-fi") ||
    g.includes("dystopian") ||
    g.includes("science fiction") ||
    a.includes("tahereh mafi")
  ) {
    return "sci-fi";
  }

  // 10 FAIRYTALE & WHIMSICAL
  if (
    t.includes("night circus") ||
    t.includes("caraval") ||
    t.includes("broken heart") ||
    t.includes("addie larue") ||
    t.includes("touch of darkness") ||
    g.includes("magical realism") ||
    g.includes("fairytale") ||
    a.includes("erin morgenstern") ||
    a.includes("stephanie garber") ||
    a.includes("v.e. schwab")
  ) {
    return "fairytale-whimsical";
  }

  // 03 MURDER MYSTERY
  if (
    g.includes("thriller") ||
    g.includes("mystery") ||
    g.includes("crime") ||
    g.includes("suspense") ||
    a.includes("freida mcfadden") ||
    a.includes("karin slaughter") ||
    a.includes("alex michaelides") ||
    a.includes("holly jackson") ||
    a.includes("megan lally")
  ) {
    return "mystery";
  }

  // 04 PEACEFUL READS
  if (
    t.includes("seagull") ||
    t.includes("if he had been") ||
    t.includes("reminders of him") ||
    t.includes("it ends with us") ||
    t.includes("evelyn hugo") ||
    g.includes("contemplative") ||
    g.includes("fable") ||
    g.includes("peaceful") ||
    a.includes("richard bach") ||
    a.includes("laura nowlin") ||
    a.includes("taylor jenkins reid")
  ) {
    return "peaceful-reads";
  }

  // 01 ROMANCE
  if (
    g.includes("romance") ||
    t.includes("love hypothesis") ||
    t.includes("beach read") ||
    t.includes("book lovers") ||
    t.includes("better than the movies") ||
    a.includes("emily henry") ||
    a.includes("ali hazelwood") ||
    a.includes("lynn painter") ||
    a.includes("tillie cole")
  ) {
    return "romance";
  }

  // 02 FANTASY
  if (
    g.includes("fantasy") ||
    g.includes("romantasy") ||
    g.includes("fae") ||
    a.includes("raven kennedy") ||
    a.includes("lauren roberts") ||
    a.includes("holly black") ||
    a.includes("victoria aveyard") ||
    a.includes("cassandra clare") ||
    a.includes("rachel gillig") ||
    a.includes("tricia levenseller")
  ) {
    return "fantasy";
  }

  return "fantasy";
}

/** Preferred showcase titles for the opening 10 houses */
const SHOWCASE_ORDER: { archetype: HouseArchetypeId; preferredTitlePart: string }[] = [
  { archetype: "romance", preferredTitlePart: "love hypothesis" },
  { archetype: "fantasy", preferredTitlePart: "cruel prince" },
  { archetype: "mystery", preferredTitlePart: "never lie" },
  { archetype: "peaceful-reads", preferredTitlePart: "seagull" },
  { archetype: "self-help", preferredTitlePart: "atmamun" },
  { archetype: "finance-business", preferredTitlePart: "the fine print" },
  { archetype: "sci-fi", preferredTitlePart: "shatter me" },
  { archetype: "dark-academia", preferredTitlePart: "atlas six" },
  { archetype: "adventure-exploration", preferredTitlePart: "throttled" },
  { archetype: "fairytale-whimsical", preferredTitlePart: "night circus" },
];

/**
 * Organizes the catalogue so that houses 01 to 10 showcase archetypes 01 to 10
 * in the exact sequence of the two reference images, followed by all remaining books.
 * Sets uniform spacious width (380px) and heights (560-600px).
 */
export function buildShowcaseBoulevard(rawBooks: BookCatalogItem[]): MappedBookHouse[] {
  const remaining = [...rawBooks];
  const showcase: MappedBookHouse[] = [];

  // 1. Pick the best representative book for each of the 10 showcase slots
  for (let i = 0; i < SHOWCASE_ORDER.length; i++) {
    const { archetype, preferredTitlePart } = SHOWCASE_ORDER[i];
    let matchIdx = remaining.findIndex(
      (b) =>
        classifyBookArchetype(b) === archetype &&
        b.title.toLowerCase().includes(preferredTitlePart)
    );
    if (matchIdx === -1) {
      matchIdx = remaining.findIndex((b) => classifyBookArchetype(b) === archetype);
    }
    if (matchIdx === -1 && remaining.length > 0) {
      matchIdx = 0;
    }

    if (matchIdx !== -1) {
      const [book] = remaining.splice(matchIdx, 1);
      const conf = ARCHETYPES[archetype];
      showcase.push({
        ...book,
        streetOrder: i + 1,
        archetypeId: archetype,
        archetypeNumber: conf.number,
        archetypeName: conf.name,
        architecture: {
          ...book.architecture,
          widthPx: 380,
          heightPx: 580,
          primaryColor: conf.primaryColor,
          secondaryColor: conf.secondaryColor,
          trimColor: conf.trimColor,
          accentColor: conf.accentColor,
          roofSlateColor: conf.roofSlateColor,
          doorWoodColor: conf.doorWoodColor,
          windowGlowColor: conf.windowGlowColor,
        },
      });
    }
  }

  // 2. Map all remaining books (11 to 86)
  const remainingMapped: MappedBookHouse[] = remaining.map((book, idx) => {
    const archetype = classifyBookArchetype(book);
    const conf = ARCHETYPES[archetype];
    const order = showcase.length + idx + 1;
    // Slight organic variation in height (560 - 610px) while preserving 380px width
    const heightVariations = [570, 590, 560, 600, 580];
    const heightPx = heightVariations[idx % heightVariations.length];

    return {
      ...book,
      streetOrder: order,
      archetypeId: archetype,
      archetypeNumber: conf.number,
      archetypeName: conf.name,
      architecture: {
        ...book.architecture,
        widthPx: 380,
        heightPx,
        primaryColor: conf.primaryColor,
        secondaryColor: conf.secondaryColor,
        trimColor: conf.trimColor,
        accentColor: conf.accentColor,
        roofSlateColor: conf.roofSlateColor,
        doorWoodColor: conf.doorWoodColor,
        windowGlowColor: conf.windowGlowColor,
      },
    };
  });

  return [...showcase, ...remainingMapped];
}
