"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Star8 } from "./Decor";

/** An ivory card with a Mughal arch top and a gold double border. */
export function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id?: string;
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative px-4 py-5 md:px-8 md:py-7">
      <motion.div
        className="arch-top relative mx-auto max-w-2xl border-2 border-gold/70 bg-cream px-6 pb-12 pt-20 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] md:px-12 md:pb-14 md:pt-24"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div aria-hidden className="islamic-pattern-ivory arch-top pointer-events-none absolute inset-0" />
        <div aria-hidden className="arch-top pointer-events-none absolute inset-2 border border-gold/45" />
        <Star8 className="absolute left-1/2 top-5 size-5 -translate-x-1/2 text-gold" />
        <div className="relative">
          {(Icon || title) && (
            <header className="mb-8">
              {Icon && <Icon className="mx-auto mb-3 size-6 text-gold" strokeWidth={1.5} aria-hidden />}
              {title && (
                <h2 className="mb-4 font-display text-2xl font-medium uppercase tracking-[0.14em] text-primary md:text-3xl rtl:text-4xl md:rtl:text-5xl">
                  {title}
                </h2>
              )}
              <Ornament />
            </header>
          )}
          {children}
        </div>
      </motion.div>
    </section>
  );
}

/** Gold line, star, gold line. */
export function Ornament({ className = "", wide = false }: { className?: string; wide?: boolean }) {
  const line = wide ? "w-20" : "w-14";
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className={`h-px ${line} bg-gradient-to-r from-transparent to-gold`} />
      <span className="size-1.5 rotate-45 bg-current" />
      <Star8 className="size-4" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className={`h-px ${line} bg-gradient-to-l from-transparent to-gold`} />
    </div>
  );
}
