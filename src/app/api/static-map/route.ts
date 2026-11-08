import { googleMapsStaticFetchUrl, type MapType } from "@/lib/maps";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query) {
    return new Response("Missing venue query", { status: 400 });
  }

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const coords =
    lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : undefined;

  const zoom = Number(searchParams.get("zoom") ?? 16);
  const mapType = (searchParams.get("mapType") ?? "roadmap") as MapType;

  const googleUrl = googleMapsStaticFetchUrl({
    query,
    coords,
    zoom: Number.isFinite(zoom) ? zoom : 16,
    mapType,
  });

  if (!googleUrl) {
    return new Response("Maps API key is not configured", { status: 503 });
  }

  const upstream = await fetch(googleUrl);
  if (!upstream.ok) {
    const detail = await upstream.text();
    return new Response(detail || "Google Static Maps request failed", {
      status: upstream.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
