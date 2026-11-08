"use client";

import { Globe, Volume2, VolumeX } from "lucide-react";
import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { formatFullDate, formatTime, formatWeekday, zonedToEpoch } from "@/lib/dates";
import type { I18n } from "@/lib/i18n";
import { eventsFor, mainEventFor, textOf, type Invitation } from "@/lib/invitation";
import { getTheme } from "@/lib/templates";
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
    mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=${lang}&output=embed`,
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

/** Background music that starts on a tap (browsers block autoplay). */
export function useMusic(base: Invitation) {
  const src = base.music?.enabled === false ? null : (base.music?.src ?? getTheme(base.template).assets.music);
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const start = useCallback(() => {
    ref.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);
  const toggle = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) start();
    else {
      audio.pause();
      setPlaying(false);
    }
  }, [start]);
  const audio = src ? <audio ref={ref} src={src} loop preload="none" /> : null;
  return { audio, playing, start, toggle, enabled: Boolean(src) };
}

/** Language and music buttons, fixed to the lower corners. */
export function Controls({
  music,
  i18n,
  bilingual,
  onToggleLang,
  className,
}: {
  music: ReturnType<typeof useMusic>;
  i18n: I18n;
  bilingual: boolean;
  onToggleLang: () => void;
  className: string;
}) {
  const { t, lang } = i18n;
  const button = `fixed bottom-4 z-40 flex h-10 items-center gap-2 rounded-full px-4 text-sm transition active:scale-95 ${className}`;
  return (
    <>
      {music.audio}
      {music.enabled && (
        <button
          type="button"
          onClick={music.toggle}
          aria-label={music.playing ? t.muteMusic : t.playMusic}
          className={`${button} end-4 w-10 justify-center px-0`}
        >
          {music.playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
      )}
      {bilingual && (
        <button
          type="button"
          onClick={onToggleLang}
          lang={lang === "en" ? "ar" : "en"}
          className={`${button} start-4`}
        >
          <Globe className="size-4" />
          {t.switchTo}
        </button>
      )}
    </>
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
