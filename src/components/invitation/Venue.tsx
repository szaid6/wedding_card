"use client";

import { useI18n } from "@/lib/i18n";
import type { InvitationData } from "@/lib/invitation";

export function Venue({ venue }: { venue: NonNullable<InvitationData["venue"]> }) {
  const { t, lang } = useI18n();
  const query = venue.mapQuery ?? [venue.name, venue.address].filter(Boolean).join(", ");
  const mapsUrl = venue.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=${lang}&output=embed`;

  return (
    <div className="flex min-h-svh w-full flex-col">
      <div className="px-8 pb-6 pt-20">
        <p className="font-display text-[11px] uppercase tracking-[0.35em] text-gold rtl:text-sm">{t.venue}</p>
        <p className="mt-4 font-names text-5xl leading-tight text-gold-light rtl:text-4xl rtl:leading-snug">
          {venue.name}
        </p>
        {venue.address && (
          <p className="mt-3 whitespace-pre-line text-cream/70">{venue.address}</p>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center border border-gold/70 px-6 font-display text-xs uppercase tracking-[0.2em] text-gold-light transition hover:bg-gold/10 rtl:text-sm"
        >
          {t.viewOnMaps}
        </a>
      </div>
      <div className="relative mt-auto min-h-[42svh] flex-1">
        <iframe
          title={t.mapOf(venue.name)}
          src={embed}
          className="pointer-events-none absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
