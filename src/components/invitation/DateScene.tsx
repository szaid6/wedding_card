"use client";

import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { formatMonthYear, formatNumber, formatTime, formatWeekday } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import type { InvitationData } from "@/lib/invitation";
import type { TemplateTheme } from "@/lib/templates";
import { Chapter } from "./Chapter";
import { Countdown } from "./Countdown";
import { SaveTheDate } from "./SaveTheDate";
import { ScratchCard } from "./ScratchCard";

type Calendar = {
  title: string;
  date: string;
  time: string;
  timezone: string;
  durationHours: number;
  location?: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

/** The date, as a scratch foil or a large numeral, with the countdown after the reveal. */
export function DateScene({
  theme,
  scratch,
  countdown,
  date,
  time,
  timezone,
  calendar,
}: {
  theme: TemplateTheme;
  scratch: InvitationData["scratchCard"];
  countdown: InvitationData["countdown"];
  date: string;
  time: string;
  timezone: string;
  calendar: Calendar;
}) {
  const { t, locale } = useI18n();
  const foil = scratch !== false;
  const [shown, setShown] = useState(!foil);
  const reveal = useCallback(() => setShown(true), []);

  return (
    <Chapter className="chapter-date">
      {scratch !== false ? (
        <ScratchCard
          theme={theme}
          date={date}
          time={time}
          label={scratch?.revealLabel ?? t.youreInvited}
          onReveal={reveal}
        />
      ) : (
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.35em] text-gold rtl:text-sm">
            {formatWeekday(date, locale)}
          </p>
          <p className="mt-2 font-display text-8xl font-medium leading-none text-gold-light tabular-nums">
            {formatNumber(Number(date.slice(8, 10)), locale, 2)}
          </p>
          <p className="mt-3 font-display text-sm uppercase tracking-[0.28em] text-cream/80 rtl:normal-case rtl:text-base rtl:tracking-normal">
            {formatMonthYear(date, locale)}
          </p>
          <p className="mt-4 font-calligraphic text-2xl italic text-cream">{formatTime(time, locale)}</p>
        </div>
      )}

      {shown && (
        <motion.div
          initial={foil ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mt-10 flex flex-col items-center gap-8"
        >
          {countdown !== false && (
            <div>
              <p className="mb-4 font-calligraphic text-lg italic text-cream/70">
                {countdown?.title ?? t.countdownTitle}
              </p>
              <Countdown date={date} time={time} timezone={timezone} />
            </div>
          )}
          <SaveTheDate {...calendar} />
        </motion.div>
      )}
    </Chapter>
  );
}
