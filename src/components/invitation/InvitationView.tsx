"use client";

import {
  CalendarDays,
  Clock,
  Gift,
  Globe,
  Heart,
  Images,
  MapPin,
  Timer,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { formatFullDate, formatTime, formatWeekday } from "@/lib/dates";
import { DICTIONARIES, I18nContext, LOCALES, localize, type Lang } from "@/lib/i18n";
import { eventsFor, mainEventFor, textOf, type Invitation } from "@/lib/invitation";
import { getTheme, themeStyle } from "@/lib/templates";
import { Countdown } from "./Countdown";
import { Crescent, FallingPetals, FloralSwag, Lantern, Skyline } from "./Decor";
import { IntroHero } from "./IntroHero";
import { SaveTheDate } from "./SaveTheDate";
import { ScratchCard } from "./ScratchCard";
import { Ornament, Section } from "./Section";
import { Slideshow } from "./Slideshow";
import { Timeline } from "./Timeline";
import { Venue } from "./Venue";

const LANG_PARAM = "lang";
const GROUP_PARAM = "for";

// A shared link can pick the language and the guest group: /?for=family&lang=ar
const noSubscribe = () => () => {};
function readLangParam(): Lang | null {
  const v = new URLSearchParams(window.location.search).get(LANG_PARAM);
  return v === "ar" || v === "en" ? v : null;
}
function readGroupParam(): string | null {
  return new URLSearchParams(window.location.search).get(GROUP_PARAM);
}

export function InvitationView({ invitation: base }: { invitation: Invitation }) {
  const theme = getTheme(base.template);
  const bilingual = Boolean(base.ar);
  // Language precedence: visitor's toggle, then ?lang= in the link, then the JSON default.
  const [chosen, setChosen] = useState<Lang | null>(null);
  const urlLang = useSyncExternalStore(noSubscribe, readLangParam, () => null);
  const group = useSyncExternalStore(noSubscribe, readGroupParam, () => null);
  const lang: Lang = bilingual ? (chosen ?? urlLang ?? base.defaultLanguage ?? "en") : "en";
  const i18n = useMemo(() => ({ lang, t: DICTIONARIES[lang], locale: LOCALES[lang] }), [lang]);
  const { t, locale } = i18n;
  const inv = useMemo(() => localize(base, lang), [base, lang]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const musicSrc = base.music?.enabled === false ? null : (inv.music?.src ?? theme.assets.music);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggleLang() {
    const next: Lang = lang === "en" ? "ar" : "en";
    setChosen(next);
    const url = new URL(window.location.href);
    url.searchParams.set(LANG_PARAM, next);
    history.replaceState(history.state, "", url);
  }

  // Keep the page pinned to the intro until the hero text appears.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const nodes = [document.documentElement, document.body];
    for (const node of nodes) node.style.overflow = revealed ? "" : "hidden";
    return () => {
      for (const node of nodes) node.style.overflow = "";
    };
  }, [revealed]);

  const startMusic = useCallback(() => {
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);
  const onReveal = useCallback(() => setRevealed(true), []);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) startMusic();
    else {
      audio.pause();
      setPlaying(false);
    }
  }

  const { groom, bride, brideFirst } = inv.couple;
  const [first, second] = brideFirst ? [bride, groom] : [groom, bride];
  const names = t.joinNames(first.name, second.name);
  const gifts = textOf(inv.gifts);
  // Guests only see the events their link's group is invited to, and the date follows them.
  const events = eventsFor(inv, group);
  const main = mainEventFor(inv, events);
  const calendar = {
    title: main.item ? t.eventOf(main.item.name, names) : (inv.event.title ?? t.weddingOf(names)),
    date: main.date,
    time: main.time,
    timezone: inv.event.timezone,
    durationHours: main.item ? 4 : (inv.event.durationHours ?? 4),
    location: inv.venue ? [inv.venue.name, inv.venue.address].filter(Boolean).join(", ") : undefined,
  };

  // Each entry is one arched card, in order.
  const sections: { key: string; icon: LucideIcon; title?: string; node: ReactNode }[] = [];
  const add = (key: string, icon: LucideIcon, title: string | undefined, node: ReactNode) =>
    sections.push({ key, icon, title, node });

  // The couple and their families come first, as on a printed card.
  if (first.details || second.details) {
    add(
      "couple",
      Heart,
      t.couple,
      <div className="flex flex-col items-center gap-6">
        {[first, second].map((person, i) => (
          <div key={person.name} className="contents">
            {i === 1 && <p className="font-names text-4xl text-gold rtl:text-3xl">{t.and}</p>}
            <div>
              <p className="font-names text-5xl leading-tight text-primary rtl:text-4xl rtl:leading-relaxed">
                {person.name}
              </p>
              {person.details && (
                <p className="mt-2 whitespace-pre-line leading-relaxed text-muted rtl:text-lg">{person.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>,
    );
  }

  if (inv.scratchCard !== false) {
    add(
      "date",
      CalendarDays,
      inv.scratchCard?.title ?? t.scratchTitle,
      <>
        <ScratchCard
          theme={theme}
          date={main.date}
          time={main.time}
          label={inv.scratchCard?.revealLabel ?? t.youreInvited}
        />
        <SaveTheDate {...calendar} />
      </>,
    );
  } else {
    add(
      "date",
      CalendarDays,
      t.saveTheDate,
      <>
        <p className="font-display text-2xl font-semibold text-foreground">{formatFullDate(main.date, locale)}</p>
        <p className="mt-1 font-calligraphic text-xl italic text-primary">
          {formatWeekday(main.date, locale)} · {formatTime(main.time, locale)}
        </p>
        <SaveTheDate {...calendar} />
      </>,
    );
  }
  if (inv.slideshow?.length) {
    const images = inv.slideshow;
    add("slides", Images, undefined, <Slideshow images={images} />);
  }
  if (inv.countdown !== false) {
    add(
      "countdown",
      Timer,
      inv.countdown?.title ?? t.countdownTitle,
      <Countdown date={main.date} time={main.time} timezone={inv.event.timezone} />,
    );
  }
  if (events.length) {
    add("program", Clock, inv.program?.title ?? t.program, <Timeline items={events} />);
  }
  if (inv.venue) {
    const venue = inv.venue;
    add(
      "venue",
      MapPin,
      t.venue,
      <>
        {/* The map always searches the original (English) name and address. */}
        <Venue
          venue={{
            ...venue,
            mapQuery: base.venue?.mapQuery ?? [base.venue?.name, base.venue?.address].filter(Boolean).join(", "),
            mapsUrl: base.venue?.mapsUrl,
          }}
        />
      </>,
    );
  }
  if (gifts) {
    add(
      "gifts",
      Gift,
      gifts.title ?? t.gifts,
      <p className="mx-auto max-w-xl whitespace-pre-line leading-relaxed text-muted">{gifts.text}</p>,
    );
  }

  return (
    <I18nContext value={i18n}>
      <div className="invite-stage">
        <div
          lang={lang}
          dir={lang === "ar" ? "rtl" : "ltr"}
          style={themeStyle(theme)}
          className="invite-frame bg-emerald font-body text-foreground"
        >
        {musicSrc && <audio ref={audioRef} src={musicSrc} loop preload="auto" />}

        {musicSrc && (
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={playing ? t.muteMusic : t.playMusic}
            className="invite-fab-right flex size-10 items-center justify-center rounded-full border border-gold/70 bg-emerald/85 text-gold-light shadow-lg backdrop-blur transition hover:bg-emerald"
          >
            {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}

        {bilingual && (
          <button
            type="button"
            onClick={toggleLang}
            lang={lang === "en" ? "ar" : "en"}
            className="invite-fab-left flex h-10 items-center gap-2 rounded-full border border-gold/70 bg-emerald/85 px-4 text-sm text-gold-light shadow-lg backdrop-blur transition hover:bg-emerald"
          >
            <Globe className="size-4" />
            {t.switchTo}
          </button>
        )}

        <IntroHero
          headline={inv.headline}
          first={first}
          second={second}
          bismillah={inv.bismillah !== false}
          onOpen={startMusic}
          onReveal={onReveal}
        />

        <FallingPetals />

        <main className="islamic-pattern relative isolate overflow-hidden bg-emerald">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b2f28] via-transparent to-[#0b2f28]"
          />

          <section className="relative px-8 pb-10 pt-20 text-center">
            <div className="mx-auto max-w-2xl">
              <Ornament wide className="mb-8" />
              {inv.verse && (
                <figure className="mb-10">
                  <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-[2.1] text-gold-light">
                    {inv.verse.arabic}
                  </p>
                  {lang === "en" && inv.verse.translation && (
                    <blockquote className="mt-4 font-calligraphic text-lg italic leading-relaxed text-cream/80">
                      &ldquo;{inv.verse.translation}&rdquo;
                    </blockquote>
                  )}
                  {inv.verse.reference && (
                    <figcaption className="mt-3 font-display text-xs uppercase tracking-[0.25em] text-gold rtl:text-sm">
                      {inv.verse.reference}
                    </figcaption>
                  )}
                </figure>
              )}
              {inv.welcomeMessage && (
                <p className="whitespace-pre-wrap break-words font-calligraphic text-2xl italic leading-relaxed text-cream">
                  {inv.welcomeMessage}
                </p>
              )}
              <Ornament wide className="mt-8" />
            </div>
          </section>

          {sections.map(({ key, icon, title, node }) => (
            <Section key={key} icon={icon} title={title}>
              {node}
            </Section>
          ))}

          <footer className="relative mt-10 overflow-hidden pt-36 text-center">
            <FloralSwag className="absolute inset-x-0 top-0 h-10 w-full" />
            <Lantern className="animate-lantern absolute left-[8%] top-0 w-10" chain={40} />
            <Lantern
              className="animate-lantern absolute right-[8%] top-0 w-10"
              chain={64}
              style={{ animationDelay: "-2s" }}
            />
            <div className="relative mx-auto max-w-2xl px-10 pb-36">
              <Crescent className="mx-auto mb-6 size-9 text-gold-light" />
              <p className="mb-5 whitespace-pre-line font-calligraphic text-3xl italic leading-relaxed text-cream">
                {inv.closing?.message ?? t.closing}
              </p>
              <Ornament wide className="mb-5" />
              <p className="whitespace-pre-line font-names text-4xl text-gold-light rtl:text-3xl">
                {inv.closing?.signature ?? names}
              </p>
            </div>
            <Skyline className="absolute inset-x-0 bottom-0 h-44 w-full" />
          </footer>
        </main>
        </div>
      </div>
    </I18nContext>
  );
}
