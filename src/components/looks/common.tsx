"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { formatFullDate, formatTime, formatWeekday, zonedToEpoch } from "@/lib/dates";
import type { I18n } from "@/lib/i18n";
import { eventsFor, mainEventFor, textOf, type Invitation } from "@/lib/invitation";
import { embedIsChromeless, googleMapsEmbedUrl, hasMapsKey, staticMapProxyUrl } from "@/lib/maps";
import { calendarLinks } from "../invitation/SaveTheDate";

/** Everything the sea look prints, worked out once from the invitation. */
export function details(inv: Invitation, base: Invitation, { t, lang, locale }: I18n, group: string | null) {
  const { groom, bride, brideFirst } = inv.couple;
  const [first, second] = brideFirst ? [bride, groom] : [groom, bride];
  const short = (p: typeof first) => p.shortName ?? p.name;
  const events = eventsFor(inv, group);
  const main = mainEventFor(inv, events);
  // The map always searches the original (English) name and address.
  const query = base.venue?.mapQuery ?? [base.venue?.name, base.venue?.address].filter(Boolean).join(", ");
  const names = t.joinNames(first.name, second.name);
  return {
    first,
    second,
    monogram: t.joinNames(short(first), short(second)),
    names,
    events,
    main,
    weekday: formatWeekday(main.date, locale),
    fullDate: formatFullDate(main.date, locale),
    time: formatTime(main.time, locale),
    hijri: main.item ? undefined : inv.event.hijri,
    gifts: textOf(inv.gifts),
    calendarUrl: calendarLinks({
      title: main.item ? t.eventOf(main.item.name, names) : (inv.event.title ?? t.weddingOf(names)),
      date: main.date,
      time: main.time,
      timezone: inv.event.timezone,
      durationHours: inv.event.durationHours ?? 4,
      location: inv.venue ? [inv.venue.name, inv.venue.address].filter(Boolean).join(", ") : undefined,
    }).google,
    mapsUrl: base.venue?.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    mapStatic: staticMapProxyUrl({
      query,
      coords: base.venue?.coords,
      zoom: base.venue?.mapZoom ?? 16,
      mapType: base.venue?.mapType ?? "roadmap",
    }),
    mapEmbed: googleMapsEmbedUrl({
      query,
      placeId: base.venue?.placeId,
      coords: base.venue?.coords,
      lang,
      zoom: base.venue?.mapZoom ?? 16,
      mapType: base.venue?.mapType ?? "roadmap",
    }),
    mapEmbedChromeless: embedIsChromeless({
      coords: base.venue?.coords,
      placeId: base.venue?.placeId,
      hasKey: hasMapsKey(),
    }),
    timeOf: (dateTime: string) => formatTime(dateTime.slice(11, 16), locale),
  };
}

export type Details = ReturnType<typeof details>;

const noSubscribe = () => () => {};

/** Whole days from today until the event, or null while rendering on the server. */
export function useDaysToGo(date: string, time: string, timezone: string): number | null {
  return useSyncExternalStore(
    noSubscribe,
    () => Math.ceil((zonedToEpoch(date, time, timezone) - Date.now()) / 86_400_000),
    () => null,
  );
}

const SYNODIC = 29.530588;
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/** Days since the last new moon at instant `ms`. */
export function moonAge(ms: number): number {
  return (((ms - NEW_MOON) / 86_400_000) % SYNODIC + SYNODIC) % SYNODIC;
}

/** The moon at `age` days, lit part in currentColor, as seen from the northern hemisphere. */
export function Moon({ age, className, dark }: { age: number; className?: string; dark: string }) {
  const r = 48;
  const angle = (2 * Math.PI * age) / SYNODIC;
  const rx = Math.abs(Math.cos(angle)) * r;
  const waxing = age < SYNODIC / 2;
  const gibbous = Math.cos(angle) < 0;
  // Outer limb on the lit side, then the terminator back as a half-ellipse.
  const limb = waxing ? 1 : 0;
  const term = waxing === gibbous ? 1 : 0;
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden>
      <circle r={r} style={{ fill: dark }} />
      <path d={`M0 ${-r} A ${r} ${r} 0 0 ${limb} 0 ${r} A ${rx} ${r} 0 0 ${term} 0 ${-r} Z`} fill="currentColor" />
    </svg>
  );
}

/** Arabic that keeps its own direction and Naskh face inside English text. */
export function Arabic({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p lang="ar" dir="rtl" className={`font-arabic ${className}`}>
      {children}
    </p>
  );
}
