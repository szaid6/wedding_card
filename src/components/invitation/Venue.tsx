"use client";

import { useI18n } from "@/lib/i18n";
import type { InvitationData } from "@/lib/invitation";
import { embedIsChromeless, googleMapsEmbedUrl, hasMapsKey, staticMapProxyUrl } from "@/lib/maps";
import { VenueMap } from "@/components/looks/VenueMap";

export function Venue({ venue }: { venue: NonNullable<InvitationData["venue"]> }) {
  const { t, lang } = useI18n();
  const query = venue.mapQuery ?? [venue.name, venue.address].filter(Boolean).join(", ");
  const mapsUrl = venue.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const mapType = venue.mapType ?? "roadmap";
  const zoom = venue.mapZoom ?? 16;
  const staticSrc = staticMapProxyUrl({ query, coords: venue.coords, zoom, mapType });
  const embed = googleMapsEmbedUrl({ query, placeId: venue.placeId, coords: venue.coords, lang, zoom, mapType });
  const chromeless = embedIsChromeless({ coords: venue.coords, placeId: venue.placeId, hasKey: hasMapsKey() });

  return (
    <div>
      <p className="mb-2 font-calligraphic text-3xl font-medium text-primary">{venue.name}</p>
      {venue.address && <p className="whitespace-pre-line text-muted">{venue.address}</p>}
      <div className="mx-auto mt-8 md:max-w-xl">
        <VenueMap
          staticSrc={staticSrc}
          embedSrc={embed}
          title={t.mapOf(venue.name)}
          frameClassName="overflow-hidden rounded-xl border-2 border-gold/70 bg-field p-1 shadow-[0_16px_36px_-18px_rgba(0,0,0,0.5)]"
          surfaceClassName="relative"
          imgClassName="block h-64 w-full rounded-lg object-cover md:h-80"
          clipClassName="h-64 overflow-hidden rounded-lg md:h-80"
          mapClassName={
            chromeless
              ? "block h-64 w-full md:h-80"
              : "-mt-[88px] block h-[calc(100%+88px)] min-h-[calc(16rem+88px)] w-full md:min-h-[calc(20rem+88px)]"
          }
          pinClassName="pointer-events-none absolute left-1/2 top-1/2 z-[2] -ml-4 -mt-10 h-[42px] w-8 text-gold drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]"
        />
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-gold bg-emerald px-6 font-display text-xs uppercase tracking-[0.2em] text-gold-light shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 md:text-sm rtl:text-sm"
      >
        {t.viewOnMaps}
      </a>
    </div>
  );
}
