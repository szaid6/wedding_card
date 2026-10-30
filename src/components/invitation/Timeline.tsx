"use client";

import { formatLongDate, formatTime, groupByDate } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import type { ScheduleItem } from "@/lib/invitation";

export function Timeline({ items }: { items: ScheduleItem[] }) {
  const { locale } = useI18n();
  return (
    <div className="w-full">
      {groupByDate(items).map((group) => (
        <div key={group.date}>
          <p className="border-t border-gold/30 px-8 pt-8 font-display text-[11px] uppercase tracking-[0.28em] text-gold rtl:text-sm">
            {formatLongDate(group.date, locale)}
          </p>
          <ol>
            {group.items.map((item) => (
              <li key={item.dateTime + item.name} className="border-b border-gold/20 px-8 py-7">
                <p className="font-display text-xs tracking-[0.22em] text-gold-light/75 tabular-nums rtl:text-sm">
                  {formatTime(item.dateTime.slice(11, 16), locale)}
                </p>
                <p className="mt-2 font-calligraphic text-4xl leading-tight text-cream rtl:leading-relaxed">
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-2 max-w-md whitespace-pre-wrap break-words text-sm leading-relaxed text-cream/65">
                    {item.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
