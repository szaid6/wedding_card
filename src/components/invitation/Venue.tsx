"use client";

import { useI18n } from "@/lib/i18n";
import type { InvitationData } from "@/lib/invitation";

export function Venue({ venue }: { venue: NonNullable<InvitationData["venue"]> }) {
  const { t, lang } = useI18n();
  const query = venue.mapQuery ?? [venue.name, venue.address].filter(Boolean).join(", ");
  const mapsUrl = venue.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=${lang}&output=embed`;

  return (
    <div>
      <p className="mb-2 font-calligraphic text-3xl font-medium text-primary">{venue.name}</p>
      {venue.address && <p className="whitespace-pre-line text-muted">{venue.address}</p>}
      <div className="mx-auto mt-8 overflow-hidden rounded-xl border-2 border-gold/70 bg-field p-1 shadow-[0_16px_36px_-18px_rgba(0,0,0,0.5)]">
        <iframe
          title={t.mapOf(venue.name)}
          src={embed}
          className="block h-64 w-full rounded-lg"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-gold bg-emerald px-6 font-display text-xs uppercase tracking-[0.2em] text-gold-light shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 rtl:text-sm"
      >
        {t.viewOnMaps}
      </a>
    </div>
  );
}
