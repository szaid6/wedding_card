"use client";

import { useEffect, useState } from "react";
import { formatNumber, zonedToEpoch } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";

const UNITS = [86_400_000, 3_600_000, 60_000, 1000];

export function Countdown({ date, time, timezone }: { date: string; time: string; timezone: string }) {
  const { t, locale } = useI18n();
  const target = zonedToEpoch(date, time, timezone);
  // Rendered empty on the server so the first client render matches it.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now !== null && now >= target) {
    return <p className="font-calligraphic text-2xl italic text-primary">{t.celebrationBegun}</p>;
  }

  const left = now === null ? 0 : target - now;
  const values = UNITS.map((ms, i) => {
    // Remainder after the larger unit, divided by this unit.
    const larger = i === 0 ? Infinity : UNITS[i - 1];
    const v = Math.floor((left % larger) / ms);
    return { label: t.units[i], value: now === null ? "--" : formatNumber(v, locale, 2) };
  });

  return (
    <div className="flex justify-center gap-2 sm:gap-4" role="timer" aria-live="off">
      {values.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className="flex min-w-16 items-center justify-center rounded-t-full rounded-b-lg border-2 border-gold/70 bg-emerald px-2 pb-3 pt-5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] sm:min-w-20 md:min-w-24"
          >
            <span className="font-display text-2xl font-medium tabular-nums text-gold-light sm:text-4xl md:text-5xl">
              {value}
            </span>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs rtl:text-xs sm:rtl:text-sm">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
