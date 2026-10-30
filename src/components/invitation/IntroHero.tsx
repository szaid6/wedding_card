"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Person } from "@/lib/invitation";
import { ArchFrame, Crescent, FloralSwag, Lantern, Medallion, Skyline } from "./Decor";
import { Ornament } from "./Section";

type Phase = "closed" | "opening" | "revealed";

const ease = [0.16, 1, 0.3, 1] as const;
const DOOR_SECONDS = 2;
/** The names start appearing while the doors are still swinging. */
const REVEAL_AFTER_MS = 1200;

export const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

export function IntroHero({
  headline,
  first,
  second,
  bismillah,
  onOpen,
  onReveal,
}: {
  headline?: string;
  first: Person;
  second: Person;
  bismillah: boolean;
  /** Fired on the user's tap, so audio can start inside the gesture. */
  onOpen: () => void;
  /** Fired when the hero text appears and the page may scroll. */
  onReveal: () => void;
}) {
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState<Phase>("closed");
  const revealed = phase === "revealed";

  useEffect(() => {
    if (phase !== "opening") return;
    const id = window.setTimeout(() => setPhase("revealed"), REVEAL_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (revealed) onReveal();
  }, [revealed, onReveal]);

  function open() {
    if (phase !== "closed") return;
    onOpen();
    setPhase("opening");
  }

  const initials: [string, string] = [[...first.name][0] ?? "", [...second.name][0] ?? ""];

  return (
    <section className="relative flex h-svh min-h-[620px] w-full flex-col items-center justify-center overflow-hidden bg-emerald [perspective:1600px]">
      {/* Night sky: pattern, glow, crescent, lanterns and a garland across the top. */}
      <div className="islamic-pattern absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(230,201,126,0.22),transparent_62%)]" />
      <Skyline className="absolute inset-x-0 bottom-0 h-[22%] w-full opacity-80" />
      <FloralSwag className="absolute inset-x-0 top-0 h-10 w-full" />
      <Lantern className="animate-lantern absolute left-[6%] top-0 w-10" chain={56} />
      <Lantern
        className="animate-lantern absolute right-[6%] top-0 w-10"
        chain={30}
        style={{ animationDelay: "-2.5s" }}
      />
      <Crescent className="absolute right-[22%] top-[9%] size-7 text-gold-light/80" />

      <motion.div
        className="pointer-events-none relative z-10 flex w-full flex-col items-center px-8 pt-8 text-center"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
        transition={{ duration: 1.4, ease }}
        aria-hidden={!revealed}
      >
        {bismillah && (
          <Reveal show={revealed} delay={0.1}>
            <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-loose text-gold-light">
              {BISMILLAH}
            </p>
            {lang === "en" && (
              <p className="-mt-1 mb-2 font-calligraphic text-sm italic text-cream/70">{t.bismillahMeaning}</p>
            )}
          </Reveal>
        )}

        {headline && (
          <Reveal show={revealed} delay={0.35}>
            <p className="mt-5 whitespace-pre-line font-calligraphic text-xl italic text-cream/90">
              {headline}
            </p>
          </Reveal>
        )}
        <Reveal show={revealed} delay={0.55}>
          <h1 className="mt-1 flex flex-wrap items-baseline justify-center gap-x-3 font-names text-5xl leading-tight text-gold-light rtl:text-5xl rtl:leading-[1.5]">
            <span>{first.name}</span>
            <span className="text-3xl text-cream/80 rtl:text-4xl">{t.and}</span>
            <span>{second.name}</span>
          </h1>
        </Reveal>
        <Reveal show={revealed} delay={0.75}>
          <Ornament wide className="mt-3" />
        </Reveal>
      </motion.div>

      {/* Carved palace doors until the medallion is tapped. */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`absolute inset-y-0 z-30 w-1/2 ${side === "left" ? "left-0" : "right-0"}`}
          style={{ transformOrigin: side === "left" ? "left center" : "right center" }}
          initial={false}
          animate={
            phase === "closed"
              ? { rotateY: 0, opacity: 1 }
              : { rotateY: side === "left" ? -105 : 105, opacity: [1, 1, 0] }
          }
          transition={{ duration: DOOR_SECONDS, ease: [0.55, 0, 0.3, 1] }}
          aria-hidden
        >
          <Door side={side} />
        </motion.div>
      ))}

      <AnimatePresence>
        {phase === "closed" && (
          <motion.button
            type="button"
            onClick={open}
            aria-label={t.openInvitation}
            className="absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-center gap-4"
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.45 }}
          >
            <motion.span
              className="block size-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Medallion initials={initials} className="size-full" />
            </motion.span>
            <span className="rounded-full border border-gold/70 bg-emerald/90 px-5 py-2 font-display text-[11px] uppercase tracking-[0.3em] text-gold-light shadow-lg rtl:text-sm">
              {t.tapToOpen}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <div className="animate-scroll-hint flex flex-col items-center gap-1 text-gold-light">
              <span className="text-[10px] uppercase tracking-widest rtl:text-xs">{t.scroll}</span>
              <ChevronDown className="size-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** One door leaf: jaali screen inside a gold-framed arch panel, with a ring knocker by the seam. */
function Door({ side }: { side: "left" | "right" }) {
  return (
    <div className="relative size-full bg-[#0b2f28] shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-[12px] overflow-hidden border border-gold/60">
        <div className="jaali absolute inset-0" />
        <ArchFrame className="absolute inset-x-[10%] top-[6%] h-[70%] w-[80%]" color="#e6c97e" />
        <div className="absolute inset-x-0 bottom-0 h-[18%] border-t border-gold/60 bg-[#0b2f28]/85" />
      </div>
      <span
        className={`absolute top-1/2 size-8 -translate-y-1/2 rounded-full border-[3px] border-gold-light/90 shadow-md ${
          side === "left" ? "right-5" : "left-5"
        }`}
      />
    </div>
  );
}

function Reveal({
  show,
  delay,
  className,
  children,
}: {
  show: boolean;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
      transition={{ delay: show ? delay : 0, duration: 1, ease }}
    >
      {children}
    </motion.div>
  );
}
