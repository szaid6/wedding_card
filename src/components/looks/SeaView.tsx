"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { zonedToEpoch } from "@/lib/dates";
import { I18nContext } from "@/lib/i18n";
import type { Invitation } from "@/lib/invitation";
import { useInvitation } from "../invitation/useInvitation";
import { Arabic, details, Moon, moonAge, useDaysToGo } from "./common";
import { VenueMap } from "./VenueMap";
import { PALETTES, STARS, type Palette, type PaletteId, type Tone } from "./palettes";
import s from "./sea.module.css";

type Panel = { key: string; label?: string; sky: Tone; body: ReactNode };

// Layers slide at different speeds against the words: sea in front, skyline behind.
const SEA_SPEED = 1.3;
const SKYLINE_SPEED = 0.55;

const noSubscribe = () => () => {};
// Today's moon depends on the visitor's clock, so it only appears after hydration.
const tonight = () => Math.round(moonAge(Date.now()) * 10) / 10;
// shortcut: ?palette= picks one of the palettes while the family chooses; drop it once one is chosen.
const readPalette = (): PaletteId => {
  const v = new URLSearchParams(window.location.search).get("palette");
  return v && v in PALETTES ? (v as PaletteId) : "pearl";
};

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The page's colours at one moment of the evening, as CSS variables: the sky is a blend
 * of two panels' skies, and the text takes whichever of the two panels' inks reads better
 * on that blend, so words never sit grey-on-grey halfway between.
 */
function lightVars(pal: Palette, a: Tone, b: Tone, u: number): Record<string, string> {
  const [ta, tb] = [pal.tones[a], pal.tones[b]];
  // Two skies to blend between, and how far along: sunset to twilight goes via the afterglow.
  let [from, to, f] = [ta.sky, tb.sky, u];
  if (a === "dusk" && b === "twilight" && pal.afterglow) {
    [from, to, f] = u < 0.5 ? [ta.sky, pal.afterglow, u * 2] : [pal.afterglow, tb.sky, u * 2 - 1];
  }
  const sky = luminance(from) + (luminance(to) - luminance(from)) * f;
  const contrast = (hex: string) => {
    const l = luminance(hex);
    return (Math.max(l, sky) + 0.05) / (Math.min(l, sky) + 0.05);
  };
  const pick = (x: string, y: string) => (contrast(x) >= contrast(y) ? x : y);
  return {
    "--sky": `color-mix(in oklab, ${from} ${((1 - f) * 100).toFixed(1)}%, ${to})`,
    "--ink": pick(ta.ink, tb.ink),
    "--hi": pick(ta.hi, tb.hi),
    "--stars": String(STARS[a] + (STARS[b] - STARS[a]) * u),
  };
}

/** The wedding evening as one horizontal panorama by the Arabian Sea, from daylight to moonrise. */
export function SeaView({ invitation: base }: { invitation: Invitation }) {
  const { inv, i18n, lang, group } = useInvitation(base);
  const { t } = i18n;
  const d = details(inv, base, i18n, group);
  const daysToGo = useDaysToGo(d.main.date, d.main.time, inv.event.timezone);
  const todayAge = useSyncExternalStore(noSubscribe, tonight, () => null);
  const eventAge = moonAge(zonedToEpoch(d.main.date, d.main.time, inv.event.timezone));
  const paletteId = useSyncExternalStore(noSubscribe, readPalette, () => "pearl" as PaletteId);
  const pal = PALETTES[paletteId];
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const sea = useRef<HTMLDivElement>(null);
  const skyline = useRef<SVGSVGElement>(null);
  const [travel, setTravel] = useState(0);
  const [stops, setStops] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const rtl = lang === "ar";

  const eventSkies: Tone[] = ["twilight", "night"];
  const panels: Panel[] = [
    {
      key: "intro",
      sky: "day",
      body: (
        <>
          <p lang="ar" dir="rtl" className={s.arNames}>
            {base.ar?.couple?.groom?.shortName ?? d.first.shortName} و{" "}
            {base.ar?.couple?.bride?.shortName ?? d.second.shortName}
          </p>
          <h1 className={s.hero}>{d.monogram}</h1>
          <p className={s.lead}>
            {inv.hosts} {t.invitesYou}.
          </p>
          <p className={s.text}>
            {d.weekday} {d.fullDate}
            <br />
            {inv.venue?.name}, {inv.venue?.address}
          </p>
          <p className={s.hint}>{t.scrollEvening}</p>
        </>
      ),
    },
    {
      key: "sunset",
      label: lang === "ar" ? "المغرب" : "Maghrib",
      sky: "dusk",
      body: (
        <>
          <p className={s.time}>{t.aboutSix}</p>
          <h2 className={s.title}>{t.sunset}</h2>
          {inv.verse && (
            <figure className={s.figure}>
              <Arabic className={s.verse}>{inv.verse.arabic}</Arabic>
              {lang === "en" && inv.verse.translation && <p className={s.text}>{inv.verse.translation}</p>}
              <figcaption className={s.small}>{inv.verse.reference}</figcaption>
            </figure>
          )}
          <div className={s.horizon} aria-hidden>
            <div className={s.sun} data-motion="set" />
          </div>
        </>
      ),
    },
    ...d.events.map(
      (item, i): Panel => ({
        key: item.dateTime + item.name,
        label: item.name,
        sky: eventSkies[i % 2],
        body: (
          <>
            <p className={s.time}>{item.description ?? d.timeOf(item.dateTime)}</p>
            <h2 className={s.title}>{item.name}</h2>
            {i === 0 ? (
              <div className={s.families}>
                <p className={s.person}>{d.first.name}</p>
                <p className={s.small}>{d.first.details}</p>
                <p className={s.with}>{t.daughterWith}</p>
                <p className={s.person}>{d.second.name}</p>
                <p className={s.small}>{d.second.details}</p>
              </div>
            ) : (
              <div className={s.families}>
                {d.gifts && <p className={s.lead}>{d.gifts.text}</p>}
                <a className={s.button} href={d.calendarUrl} target="_blank" rel="noreferrer">
                  {t.addToCalendar}
                </a>
              </div>
            )}
          </>
        ),
      }),
    ),
    {
      key: "moon",
      label: lang === "ar" ? "القمر" : "The moon",
      sky: "deep",
      body: (
        <>
          <h2 className={s.title}>{t.moonThatNight}</h2>
          <p className={s.text}>{d.hijri ?? d.fullDate}</p>
          <div className={s.moonRise} data-motion="rise" aria-hidden>
            <Moon age={eventAge} dark="var(--moon-dark)" className={s.moon} />
          </div>
          {todayAge !== null && daysToGo !== null && daysToGo > 0 && (
            <div className={s.tonight}>
              <Moon age={todayAge} dark="var(--moon-dark)" className={s.moonSmall} />
              <p className={s.small}>
                {t.moonTonight}
                <br />
                {t.daysToGo(daysToGo)}
              </p>
            </div>
          )}
        </>
      ),
    },
    {
      key: "venue",
      label: t.venue,
      sky: "deep",
      body: (
        <>
          <h2 className={s.title}>{inv.venue?.name}</h2>
          <p className={s.text}>{inv.venue?.address}</p>
          <VenueMap
            staticSrc={d.mapStatic}
            embedSrc={d.mapEmbed}
            title={t.mapOf(inv.venue?.name ?? "")}
            frameClassName={s.mapFrame}
            surfaceClassName={s.mapSurface}
            imgClassName={s.mapImg}
            clipClassName={s.mapClip}
            mapClassName={d.mapEmbedChromeless ? s.map : s.mapCropped}
            pinClassName={s.mapPin}
          />
          <a className={s.button} href={d.mapsUrl} target="_blank" rel="noreferrer">
            {t.openInMaps}
          </a>
        </>
      ),
    },
    {
      key: "duas",
      label: t.duas,
      sky: "deep",
      body: (
        <>
          {inv.duas?.map((dua) => (
            <div key={dua.arabic}>
              <Arabic className={s.dua}>{dua.arabic}</Arabic>
              {lang === "en" && dua.translation && <p className={s.text}>{dua.translation}</p>}
            </div>
          ))}
          <p className={s.signature}>{inv.closing?.signature ?? d.monogram}</p>
        </>
      ),
    },
  ];

  // How far the strip slides: its width minus one screen. The track is that much taller than a screen.
  // Each panel is also a resting place: scrolling settles with a panel at the left edge.
  useEffect(() => {
    const measure = () => {
      const row = strip.current;
      if (!row) return;
      const max = Math.max(0, row.scrollWidth - window.innerWidth);
      setTravel(max);
      setStops([...row.children].map((p) => Math.min(max, (p as HTMLElement).offsetLeft)));
    };
    measure();
    window.addEventListener("resize", measure);
    const root = document.documentElement;
    root.style.scrollSnapType = "y proximity";
    return () => {
      window.removeEventListener("resize", measure);
      root.style.scrollSnapType = "";
    };
  }, [lang]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const dir = rtl ? 1 : -1;
    const update = () => {
      raf = 0;
      const el = track.current;
      const row = strip.current;
      if (!el || !row) return;
      const vw = window.innerWidth;
      const x = Math.min(travel, Math.max(0, window.scrollY - el.offsetTop));
      row.style.transform = `translate3d(${dir * x}px, 0, 0)`;
      if (sea.current) sea.current.style.transform = `translate3d(${dir * x * SEA_SPEED}px, 0, 0)`;
      if (skyline.current) skyline.current.style.transform = `translate3d(${dir * x * SKYLINE_SPEED}px, 0, 0)`;

      const els = [...row.children] as HTMLElement[];
      const leftOf = (p: HTMLElement) => (rtl ? row.scrollWidth - p.offsetLeft - p.offsetWidth : p.offsetLeft);
      const at = els.findIndex((p) => x + vw / 2 >= leftOf(p) && x + vw / 2 < leftOf(p) + p.offsetWidth);
      if (at >= 0) setCurrent(at);

      // One sky for the whole screen, no colour bands between panels. The point that sets the
      // colour sweeps from the screen's left edge at the start to its right edge at the end,
      // so the first screen is the first panel's sky and the last is the last panel's.
      const mids = els.map((p) => leftOf(p) + p.offsetWidth / 2);
      const centre = x + vw * (travel ? x / travel : 0);
      const i = Math.max(0, mids.findLastIndex((m) => m <= centre));
      const j = Math.min(els.length - 1, i + 1);
      const u = i === j ? 0 : Math.min(1, Math.max(0, (centre - mids[i]) / (mids[j] - mids[i])));
      const vars = lightVars(pal, els[i].dataset.tone as Tone, els[j].dataset.tone as Tone, u);
      for (const [k, v] of Object.entries(vars)) root.current?.style.setProperty(k, v);

      // The sun sinks and the moon climbs while their panel crosses the screen (0 entering, 1 leaving).
      for (const node of row.querySelectorAll<HTMLElement>("[data-motion]")) {
        const panel = node.closest("section") as HTMLElement;
        const along = Math.min(1, Math.max(0, (x + vw - leftOf(panel)) / (vw + panel.offsetWidth)));
        const rise = node.dataset.motion === "rise";
        const ty = (node.dataset.motion === "set" ? (along - 0.25) * 160 : (1 - along) * 70) + (rise ? -8 : 0);
        const tx = rise ? 5 : 0;
        node.style.transform = `translate3d(${tx}%, ${ty}%, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [travel, rtl, pal]);

  function goTo(k: number) {
    const el = track.current;
    const row = strip.current;
    const p = row?.children[k] as HTMLElement | undefined;
    if (!el || !p || !row) return;
    const left = rtl ? row.scrollWidth - p.offsetLeft - p.offsetWidth : p.offsetLeft;
    window.scrollTo({ top: el.offsetTop + Math.min(travel, left), behavior: "smooth" });
  }

  return (
    <I18nContext value={i18n}>
      <div
        ref={root}
        lang={lang}
        dir={rtl ? "rtl" : "ltr"}
        className={s.root}
        style={
          {
            ...lightVars(pal, "day", "day", 0),
            "--accent": pal.accent,
            "--on-accent": pal.onAccent,
            "--sun": pal.sun,
            "--moon": pal.moon,
            "--moon-dark": pal.moonDark,
          } as CSSProperties
        }
      >
        <header className={s.bar}>
          <p className={s.wordmark}>{d.monogram}</p>
          <nav aria-label={t.program}>
            <ul>
              {panels.map((p, k) =>
                p.label ? (
                  <li key={p.key}>
                    <button type="button" onClick={() => goTo(k)} aria-current={current === k ? "step" : undefined}>
                      {p.label}
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>
        </header>

        <div ref={track} className={s.track} style={{ height: `calc(100svh + ${travel}px)` }}>
          <div className={s.stage}>
            <div ref={strip} className={s.strip}>
              {panels.map((p) => (
                <section
                  key={p.key}
                  className={s.panel}
                  aria-label={p.label}
                  data-tone={p.sky}
                  // Used only without motion, when every panel shows its own sky.
                  style={
                    {
                      "--p-sky": pal.tones[p.sky].sky,
                      "--p-ink": pal.tones[p.sky].ink,
                      "--p-hi": pal.tones[p.sky].hi,
                    } as CSSProperties
                  }
                >
                  {p.body}
                </section>
              ))}
            </div>
            <svg
              ref={skyline}
              className={s.skyline}
              style={{ width: `calc(100vw + ${Math.ceil(travel * SKYLINE_SPEED)}px)` }}
              viewBox="0 0 2400 120"
              preserveAspectRatio="none"
              aria-hidden
            >
              <Skyline />
            </svg>
            <div
              ref={sea}
              className={s.sea}
              style={{ width: `calc(100vw + ${Math.ceil(travel * SEA_SPEED)}px)` }}
              aria-hidden
            />
          </div>
          <div className={s.snaps} aria-hidden>
            {stops.map((top, k) => (
              <div key={k} className={s.snap} style={{ top }} />
            ))}
          </div>
        </div>

      </div>
    </I18nContext>
  );
}

/**
 * Mumbai's shore in one gold line: low city blocks, the Bandra–Worli Sea Link, and
 * Haji Ali Dargah on its causeway, a short way up the coast from Mumbai Central.
 */
function Skyline() {
  const blocks = [
    [40, 70], [90, 52], [130, 78], [175, 60], [230, 84], [290, 66], [340, 92], [1500, 74], [1550, 58], [1600, 88],
    [1660, 64], [1720, 96], [1790, 70], [1850, 82], [2180, 68], [2230, 90], [2290, 60], [2340, 76],
  ];
  const cables = [0, 1, 2, 3, 4, 5];
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke">
      <path d="M0 118 H2400" />
      {blocks.map(([x, top]) => (
        <path key={x} d={`M${x} 118 V${top} H${x + 34} V118`} />
      ))}
      {/* Sea Link: deck and two pylons with fanned cables */}
      <path d="M520 104 H1180" />
      {[700, 960].map((px) => (
        <g key={px}>
          <path d={`M${px} 118 V16`} />
          {cables.map((i) => (
            <path key={i} d={`M${px} ${22 + i * 10} L${px - 40 - i * 28} 104 M${px} ${22 + i * 10} L${px + 40 + i * 28} 104`} />
          ))}
        </g>
      ))}
      {/* Haji Ali Dargah: causeway, hall, dome with finial, minaret */}
      <path d="M1880 112 H2020" />
      <path d="M2020 118 V84 H2120 V118" />
      <path d="M2046 84 C2046 58, 2070 46, 2070 36 C2070 46, 2094 58, 2094 84" />
      <path d="M2070 36 V26" />
      <path d="M2132 118 V30 M2124 30 H2140 M2128 30 C2128 22, 2136 22, 2136 30 M2132 22 V16" />
    </g>
  );
}
