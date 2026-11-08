export type MapType = "roadmap" | "satellite" | "hybrid";

export type MapCoords = { lat: number; lng: number };

export type MapEmbedOptions = {
  query: string;
  placeId?: string;
  coords?: MapCoords;
  lang?: string;
  zoom?: number;
  mapType?: MapType;
};

export type MapStaticOptions = {
  query: string;
  coords?: MapCoords;
  zoom?: number;
  mapType?: MapType;
  width?: number;
  height?: number;
};

const mapsKey = () =>
  process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim() || "";

/** Whether a map key is configured (static preview or embed). */
export function hasMapsKey(): boolean {
  return Boolean(mapsKey());
}

/** Muted greens that sit on the Sea venue panel instead of default map colors. */
const SEA_STATIC_STYLES = [
  "feature:poi|visibility:off",
  "feature:transit|visibility:off",
  "feature:water|color:0x1a4a42",
  "feature:landscape|color:0x1e3832",
  "feature:road|color:0x3a5a50",
];

/**
 * Direct Google Static Map URL (server-side fetch only). Custom styles are omitted for
 * satellite/hybrid because styled roadmap rules break those map types.
 */
export function googleMapsStaticFetchUrl({
  query,
  coords,
  zoom = 16,
  mapType = "roadmap",
  width = 640,
  height = 400,
}: MapStaticOptions): string | null {
  const key = mapsKey();
  if (!key) return null;

  const center = coords ? `${coords.lat},${coords.lng}` : query;
  const markerLocation = coords ? `${coords.lat},${coords.lng}` : query;
  const parts = [
    `center=${encodeURIComponent(center)}`,
    `zoom=${zoom}`,
    `size=${width}x${height}`,
    "scale=2",
    `maptype=${mapType === "hybrid" ? "hybrid" : mapType}`,
    `markers=${encodeURIComponent(`color:0xC9A24D|${markerLocation}`)}`,
    `key=${encodeURIComponent(key)}`,
  ];

  if (mapType === "roadmap") {
    for (const rule of SEA_STATIC_STYLES) parts.push(`style=${encodeURIComponent(rule)}`);
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${parts.join("&")}`;
}

/** Browser-safe URL: proxied so the key is not in the page and referrer limits do not block the image. */
export function staticMapProxyUrl(options: MapStaticOptions): string | null {
  if (!hasMapsKey() || process.env.NEXT_PUBLIC_MAPS_STATIC_PREVIEW !== "1") return null;

  const params = new URLSearchParams({
    q: options.query,
    zoom: String(options.zoom ?? 16),
    mapType: options.mapType ?? "roadmap",
  });
  if (options.coords) {
    params.set("lat", String(options.coords.lat));
    params.set("lng", String(options.coords.lng));
  }
  return `/api/static-map?${params}`;
}

/** View embed is map tiles only — no place card or in-frame “Open in Maps”. */
export function embedIsChromeless(opts: Pick<MapEmbedOptions, "coords" | "placeId"> & { hasKey: boolean }) {
  return opts.hasKey && Boolean(opts.coords) && !opts.placeId;
}

/**
 * Iframe fallback when the static preview is off. Prefers Embed API **view** at `coords`
 * (no info card); search/place/legacy embeds still show Google’s chrome.
 */
export function googleMapsEmbedUrl({
  query,
  placeId,
  coords,
  lang = "en",
  zoom = 16,
  mapType = "roadmap",
}: MapEmbedOptions): string {
  const key = mapsKey();

  if (key) {
    const params = new URLSearchParams({
      key,
      zoom: String(zoom),
      maptype: mapType,
    });
    if (lang) params.set("language", lang);

    if (coords) {
      params.set("center", `${coords.lat},${coords.lng}`);
      return `https://www.google.com/maps/embed/v1/view?${params}`;
    }
    if (placeId) {
      params.set("q", `place_id:${placeId}`);
      return `https://www.google.com/maps/embed/v1/place?${params}`;
    }
    params.set("q", query);
    return `https://www.google.com/maps/embed/v1/search?${params}`;
  }

  const legacy = new URLSearchParams({ q: query, z: String(zoom), hl: lang, output: "embed" });
  if (mapType === "satellite") legacy.set("t", "k");
  if (mapType === "hybrid") legacy.set("t", "h");
  return `https://maps.google.com/maps?${legacy}`;
}
