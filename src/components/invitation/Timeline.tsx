"use client";

import { formatLongDate, formatTime, groupByDate } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import type { ScheduleItem } from "@/lib/invitation";

export function Timeline({ items }: { items: ScheduleItem[] }) {
  const { locale } = useI18n();
  return (
    <div className="mx-auto max-w-md space-y-8 text-start">
      {groupByDate(items).map((group) => (
        <div key={group.date}>
          <p className="mb-5 flex justify-center">
            <span className="rounded-full border border-gold/70 bg-emerald px-4 py-1.5 text-center font-display text-xs font-medium uppercase tracking-[0.2em] text-gold-light shadow-sm rtl:text-sm">
              {formatLongDate(group.date, locale)}
            </span>
          </p>
          <ol className="ms-3 space-y-4 border-s border-gold/60 ps-6">
            {group.items.map((item) => (
              <li key={item.dateTime + item.name} className="relative">
                <span className="absolute -start-[31px] top-5 size-3 rotate-45 bg-gold ring-4 ring-cream" />
                <div className="rounded-xl border border-field-border bg-field/80 px-5 py-4 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.5)]">
                  <p className="font-display text-xs font-medium tracking-[0.2em] text-accent tabular-nums rtl:text-sm">
                    {formatTime(item.dateTime.slice(11, 16), locale)}
                  </p>
                  <p className="mt-1 break-words font-calligraphic text-2xl font-medium leading-snug text-primary">{item.name}</p>
                  {item.description && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
