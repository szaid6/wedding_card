/**
 * Shape of one invitation JSON file in `data/invitations/<slug>.json`.
 * Every section except `couple` and `event` is optional: leave it out of the
 * JSON and the section is not rendered.
 */
export type InvitationData = {
  template: TemplateId;
  /** Language the page opens in. Visitors can switch when an `ar` block exists. */
  defaultLanguage?: "en" | "ar";
  /**
   * Arabic text, same shape as the rest of the file. Only text fields are read;
   * anything left out falls back to the English value (headings fall back to
   * built-in Arabic headings). List items are matched by position.
   */
  ar?: Translation;
  seo?: { title?: string; description?: string };
  couple: {
    groom: Person;
    bride: Person;
    /** Show the bride's name first in the hero. Defaults to groom first. */
    brideFirst?: boolean;
  };
  /** Bismillah in Arabic calligraphy above the names. Defaults to true. */
  bismillah?: boolean;
  /** A Quran verse shown with the welcome message. `arabic` is shown in both languages. */
  verse?: { arabic: string; translation?: string; reference?: string };
  /** Small line above the names, e.g. "We're getting married". */
  headline?: string;
  /** Who sends the invitation, e.g. "The Sayed Family". */
  hosts?: string;
  /** Duas shown near the end. `arabic` is shown in both languages. */
  duas?: { arabic: string; translation?: string }[];
  welcomeMessage?: string;
  event: {
    /** YYYY-MM-DD */
    date: string;
    /** HH:mm, 24h */
    time: string;
    /** IANA zone the date/time is written in, e.g. "Asia/Kolkata". */
    timezone: string;
    /** Used for "Save the date" calendar entries. */
    title?: string;
    durationHours?: number;
    /** The Hijri date as the family writes it, e.g. "20 Jumada al-Thani 1448". */
    hijri?: string;
  };
  scratchCard?: { title?: string; revealLabel?: string } | false;
  slideshow?: string[];
  countdown?: { title?: string } | false;
  program?: Schedule;
  /**
   * Who is invited to what. Keys are used in the link (`?for=family`), values are
   * `program.items[].id`s. Guests opening the link without `?for=` see every event.
   */
  guestGroups?: Record<string, string[]>;
  venue?: {
    name: string;
    address?: string;
    /** Full Google Maps link for the button. Built from name + address when omitted. */
    mapsUrl?: string;
    /** Text the embedded map searches for. Defaults to "name, address". */
    mapQuery?: string;
    /** Google Place ID for a cleaner Embed API pin (optional). */
    placeId?: string;
    /** Pin center for the static map preview. */
    coords?: { lat: number; lng: number };
    mapZoom?: number;
    mapType?: "roadmap" | "satellite" | "hybrid";
  };
  gifts?: TextSection;
  closing?: { message?: string; signature?: string };
  music?: { enabled?: boolean; src?: string };
};

export type TemplateId = "noor" | "sea";

type DeepPartial<T> = T extends string
  ? string
  : T extends (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export type Translation = DeepPartial<
  Pick<
    InvitationData,
    | "seo"
    | "couple"
    | "headline"
    | "hosts"
    | "duas"
    | "verse"
    | "welcomeMessage"
    | "scratchCard"
    | "countdown"
    | "program"
    | "venue"
    | "gifts"
    | "closing"
  >
> & { event?: { title?: string; hijri?: string } };

export type Person = {
  name: string;
  /** First name for monograms and short lines, e.g. "Zaid" for "Sayed Zaid". Defaults to `name`. */
  shortName?: string;
  details?: string;
};

export type ScheduleItem = {
  /** Referenced by `guestGroups`. Required once guest groups are used. */
  id?: string;
  name: string;
  /** YYYY-MM-DDTHH:mm in the event timezone */
  dateTime: string;
  description?: string;
};

export type Schedule = { title?: string; items: ScheduleItem[] };

/** Either a plain string or an object with a custom heading. */
export type TextSection = string | { title?: string; text: string };

export type Invitation = InvitationData & { slug: string };

export const TEMPLATE_IDS: TemplateId[] = ["noor", "sea"];

export function textOf(section: TextSection | undefined): { title?: string; text: string } | null {
  if (!section) return null;
  return typeof section === "string" ? { text: section } : section;
}

export function coupleNames(inv: InvitationData): string {
  const { groom, bride, brideFirst } = inv.couple;
  return brideFirst ? `${bride.name} & ${groom.name}` : `${groom.name} & ${bride.name}`;
}

/** The program items a guest group is invited to. Without a known group, every item. */
export function eventsFor(inv: InvitationData, group: string | null): ScheduleItem[] {
  const items = inv.program?.items ?? [];
  const ids = group ? inv.guestGroups?.[group] : undefined;
  return ids ? items.filter((item) => item.id && ids.includes(item.id)) : items;
}

/**
 * The date the scratch card, countdown and calendar point at. That's `event` unless
 * the guest isn't invited to anything on that day; then it's their first event.
 */
export function mainEventFor(
  inv: InvitationData,
  items: ScheduleItem[],
): { date: string; time: string; item?: ScheduleItem } {
  const { date, time } = inv.event;
  if (!items.length || items.some((item) => item.dateTime.startsWith(date))) return { date, time };
  const first = [...items].sort((a, b) => a.dateTime.localeCompare(b.dateTime))[0];
  return { date: first.dateTime.slice(0, 10), time: first.dateTime.slice(11, 16), item: first };
}
