"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

/** One full-viewport scene in the snapping column. */
export function Chapter({
  id,
  kicker,
  cue = true,
  align = "center",
  bleed = false,
  className = "",
  children,
}: {
  id?: string;
  kicker?: string;
  cue?: boolean;
  align?: "center" | "start" | "end" | "fill";
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const pad = bleed ? "px-0 py-24" : "px-8 py-24";
  const placed =
    align === "fill"
      ? "items-stretch justify-start p-0 text-start"
      : align === "start"
        ? `items-stretch justify-center text-start ${pad}`
        : align === "end"
          ? `items-center justify-end text-center ${bleed ? "px-0 pt-24 pb-40" : "px-8 pt-24 pb-40"}`
          : `items-center justify-center text-center ${pad}`;

  return (
    <section id={id} className={`chapter flex w-full flex-col ${placed} ${className}`}>
      {kicker && (
        <p className="mb-8 w-full font-display text-[11px] uppercase tracking-[0.35em] text-gold rtl:text-sm">
          {kicker}
        </p>
      )}
      {children}
      {cue && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <div className="animate-scroll-hint flex flex-col items-center gap-1 text-gold-light/80">
            <span className="text-[10px] uppercase tracking-widest rtl:text-xs">{t.scroll}</span>
            <ChevronDown className="size-4" aria-hidden />
          </div>
        </div>
      )}
    </section>
  );
}
