import type { GeocodeSuggestion, LatLng } from "../types/route";
import { CAMPUSES, COVERAGE_RADIUS_METERS } from "./coverage";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

// Nominatim's usage policy requires a descriptive identifier. User-Agent is a
// forbidden header in the browser Fetch spec, so we additionally pass `email`
// (officially supported by Nominatim for contact purposes).
const CONTACT_EMAIL = "senda-urjc-prototype@example.org";
const USER_AGENT = "Senda URJC (prototipo académico - URJC AIR 2025/26)";

const VIEWBOX = computeViewbox();

export interface SearchOptions {
  signal?: AbortSignal;
  limit?: number;
  language?: string;
}

export interface ReverseOptions {
  signal?: AbortSignal;
  language?: string;
}

interface NominatimSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name?: string;
  error?: string;
}

export async function searchAddress(
  query: string,
  options: SearchOptions = {},
): Promise<GeocodeSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: String(options.limit ?? 6),
    countrycodes: "es",
    viewbox: VIEWBOX,
    bounded: "0",
    email: CONTACT_EMAIL,
  });

  const response = await fetch(`${NOMINATIM_SEARCH}?${params.toString()}`, {
    signal: options.signal,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": options.language ?? navigator.language ?? "es",
    },
  });
  if (!response.ok) {
    throw new Error(`Nominatim search failed: ${response.status}`);
  }
  const raw = (await response.json()) as NominatimSearchResult[];
  return raw.map(
    (r: NominatimSearchResult): GeocodeSuggestion => ({
      id: String(r.place_id),
      displayName: r.display_name,
      point: { lat: Number.parseFloat(r.lat), lng: Number.parseFloat(r.lon) },
    }),
  );
}

/**
 * Convert a geographic coordinate to a human-readable address via Nominatim.
 * Rejects with an `Error` on HTTP failure or on explicit Nominatim errors.
 * Callers should gracefully fall back to a coordinate string on rejection.
 */
export async function reverseGeocode(
  point: LatLng,
  options: ReverseOptions = {},
): Promise<string> {
  const params = new URLSearchParams({
    lat: point.lat.toFixed(6),
    lon: point.lng.toFixed(6),
    format: "json",
    addressdetails: "1",
    zoom: "18",
    email: CONTACT_EMAIL,
  });

  const response = await fetch(`${NOMINATIM_REVERSE}?${params.toString()}`, {
    signal: options.signal,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": options.language ?? navigator.language ?? "es",
    },
  });
  if (!response.ok) {
    throw new Error(`Nominatim reverse failed: ${response.status}`);
  }
  const raw = (await response.json()) as NominatimReverseResult;
  if (raw.error || !raw.display_name) {
    throw new Error(
      `Nominatim reverse error: ${raw.error ?? "no display_name"}`,
    );
  }
  return raw.display_name;
}

function computeViewbox(): string {
  const pad = COVERAGE_RADIUS_METERS / 111_000 + 0.01;
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  for (const c of CAMPUSES) {
    minLat = Math.min(minLat, c.center.lat - pad);
    maxLat = Math.max(maxLat, c.center.lat + pad);
    minLng = Math.min(minLng, c.center.lng - pad);
    maxLng = Math.max(maxLng, c.center.lng + pad);
  }
  return `${minLng},${maxLat},${maxLng},${minLat}`;
}
