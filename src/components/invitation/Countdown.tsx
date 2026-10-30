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
    return <p className="font-calligraphic text-2xl italic text-cream">{t.celebrationBegun}</p>;
  }

  const left = now === null ? 0 : target - now;
  const values = UNITS.map((ms, i) => {
    // Remainder after the larger unit, divided by this unit.
    const larger = i === 0 ? Infinity : UNITS[i - 1];
    const v = Math.floor((left % larger) / ms);
    return { label: t.units[i], value: now === null ? "--" : formatNumber(v, locale, 2) };
  });

  return (
    <div className="flex justify-center gap-6" role="timer" aria-live="off">
      {values.map(({ label, value }) => (
        <div key={label} className="flex min-w-12 flex-col items-center">
          <span className="font-display text-3xl font-medium tabular-nums text-gold-light">{value}</span>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-cream/55 rtl:text-xs">{label}</p>
        </div>
      ))}
    </div>
  );
}
