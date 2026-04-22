import type { GeocodeSuggestion, LatLng } from "../types/route";
import { CAMPUSES, COVERAGE_RADIUS_METERS } from "./coverage";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a descriptive User-Agent. Browsers treat
// `User-Agent` as a Forbidden Header per the Fetch spec and will silently
// drop it, so we additionally identify the requester via the `email` query
// parameter (explicitly supported by Nominatim). See the iteration notes.
const CONTACT_EMAIL = "senda-urjc-prototype@example.org";
const USER_AGENT = "Senda URJC (prototipo académico - URJC AIR 2025/26)";

const VIEWBOX = computeViewbox();

export interface SearchOptions {
  signal?: AbortSignal;
  limit?: number;
  language?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export async function searchAddress(
  query: string,
  options: SearchOptions = {},
): Promise<GeocodeSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

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

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    signal: options.signal,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": options.language ?? navigator.language ?? "es",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim responded with ${response.status}`);
  }

  const raw = (await response.json()) as NominatimResult[];
  return raw.map(toSuggestion);
}

function toSuggestion(r: NominatimResult): GeocodeSuggestion {
  const point: LatLng = {
    lat: Number.parseFloat(r.lat),
    lng: Number.parseFloat(r.lon),
  };
  return {
    id: String(r.place_id),
    displayName: r.display_name,
    point,
  };
}

function computeViewbox(): string {
  // Pad ~1 km around each campus centre and compute the enclosing bbox.
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
  // Viewbox format: west,north,east,south.
  return `${minLng},${maxLat},${maxLng},${minLat}`;
}
