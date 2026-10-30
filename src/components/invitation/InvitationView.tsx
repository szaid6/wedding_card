"use client";

import { Globe, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DICTIONARIES, I18nContext, LOCALES, localize, type Lang } from "@/lib/i18n";
import { eventsFor, mainEventFor, textOf, type Invitation } from "@/lib/invitation";
import { getTheme, themeStyle } from "@/lib/templates";
import { Chapter } from "./Chapter";
import { DateScene } from "./DateScene";
import { Lantern, Skyline } from "./Decor";
import { IntroHero } from "./IntroHero";
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
  const { t } = i18n;
  const inv = useMemo(() => localize(base, lang), [base, lang]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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

  // Keep the column pinned to the cover until the doors open.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    stageRef.current?.scrollTo(0, 0);
  }, []);

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

  return (
    <I18nContext value={i18n}>
      <div ref={stageRef} className={`invite-stage${revealed ? "" : " invite-locked"}`}>
        <div
          lang={lang}
          dir={lang === "ar" ? "rtl" : "ltr"}
          style={themeStyle(theme)}
          className="invite-frame bg-emerald font-body text-cream"
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

          {inv.verse && (
            <Chapter className="chapter-verse">
              <figure className="flex w-full flex-1 flex-col">
                <p
                  lang="ar"
                  dir="rtl"
                  className="my-auto w-full text-center font-arabic text-[1.7rem] leading-[2] text-gold-light"
                >
                  {inv.verse.arabic}
                </p>
                <div>
                  {lang === "en" && inv.verse.translation && (
                    <blockquote className="font-calligraphic text-lg italic leading-relaxed text-cream/75">
                      &ldquo;{inv.verse.translation}&rdquo;
                    </blockquote>
                  )}
                  {inv.verse.reference && (
                    <figcaption className="mt-4 font-display text-[11px] uppercase tracking-[0.28em] text-gold rtl:text-sm">
                      {inv.verse.reference}
                    </figcaption>
                  )}
                </div>
              </figure>
            </Chapter>
          )}

          <Chapter align="start">
            <div className="w-full border-s border-gold/45 ps-6">
              {[first, second].map((person, i) => (
                <div key={person.name}>
                  {i === 1 && (
                    <p className="my-6 font-display text-xs uppercase tracking-[0.35em] text-gold rtl:text-base">
                      {t.and}
                    </p>
                  )}
                  <p className="font-names text-6xl leading-[0.95] text-gold-light rtl:text-5xl rtl:leading-snug">
                    {person.name}
                  </p>
                  {person.details && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/60">{person.details}</p>
                  )}
                </div>
              ))}
            </div>
            {inv.welcomeMessage && (
              <p className="mt-12 max-w-md whitespace-pre-wrap break-words font-calligraphic text-xl italic leading-relaxed text-cream/80">
                {inv.welcomeMessage}
              </p>
            )}
          </Chapter>

          {inv.slideshow?.length ? (
            <Chapter align="fill" className="h-svh">
              <Slideshow images={inv.slideshow} />
            </Chapter>
          ) : null}

          <DateScene
            theme={theme}
            scratch={inv.scratchCard}
            countdown={inv.countdown}
            date={main.date}
            time={main.time}
            timezone={inv.event.timezone}
            calendar={calendar}
          />

          {events.length > 0 && (
            <Chapter align="start" bleed>
              <Timeline items={events} />
            </Chapter>
          )}

          {inv.venue && (
            <Chapter align="fill" cue={false}>
              <Venue
                venue={{
                  ...inv.venue,
                  // The map always searches the original (English) name and address.
                  mapQuery:
                    base.venue?.mapQuery ?? [base.venue?.name, base.venue?.address].filter(Boolean).join(", "),
                  mapsUrl: base.venue?.mapsUrl,
                }}
              />
            </Chapter>
          )}

          <Chapter align="end" cue={false} className="overflow-hidden">
            <Lantern className="animate-lantern absolute left-[8%] top-0 w-10" chain={40} />
            <Lantern
              className="animate-lantern absolute right-[8%] top-0 w-10"
              chain={64}
              style={{ animationDelay: "-2s" }}
            />
            <div className="relative z-10 flex w-full flex-col items-center">
              {gifts && (
                <p className="mb-10 max-w-sm whitespace-pre-line font-calligraphic text-xl italic leading-relaxed text-cream/75">
                  {gifts.text}
                </p>
              )}
              <p className="whitespace-pre-line font-calligraphic text-3xl italic leading-relaxed text-cream">
                {inv.closing?.message ?? t.closing}
              </p>
              <p className="mt-8 font-names text-5xl text-gold-light rtl:text-4xl rtl:leading-snug">
                {inv.closing?.signature ?? names}
              </p>
            </div>
            <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full" />
          </Chapter>
        </div>
      </div>
    </I18nContext>
  );
}
