import { describe, expect, it } from "vitest";
import { buildTripTrack } from "./trip";
import type { LatLng, Route } from "../types/route";
import type { TripPositionSample } from "../types/trip";

const METERS_PER_DEG_LAT = 111_320;

function makeRoute(from: LatLng, to: LatLng, distanceKm: number): Route {
  return {
    id: "test-route",
    label: "principal",
    waypoints: [from, to],
    isp: 50,
    safetyLevel: "medium",
    distanceKm,
    durationMin: (distanceKm / 5) * 60,
  };
}

describe("buildTripTrack", () => {
  const ORIGIN: LatLng = { lat: 40.336, lng: -3.875 };
  const DESTINATION: LatLng = {
    lat: ORIGIN.lat + 500 / METERS_PER_DEG_LAT,
    lng: ORIGIN.lng,
  };
  const ROUTE = makeRoute(ORIGIN, DESTINATION, 0.5);

  it("returns samples with non-decreasing `atSec`, starting at 0", () => {
    const track = buildTripTrack(ROUTE, 5);
    expect(track.samples[0].atSec).toBe(0);
    for (let i = 1; i < track.samples.length; i += 1) {
      expect(track.samples[i].atSec).toBeGreaterThanOrEqual(
        track.samples[i - 1].atSec,
      );
    }
  });

  it("total duration matches distance / speed within ±2 s", () => {
    const track = buildTripTrack(ROUTE, 5);
    // 5 km/h = 5000/3600 m/s ≈ 1.389 m/s
    // 500 m at 1.389 m/s ≈ 360 s
    const expected = 500 / (5000 / 3600);
    expect(Math.abs(track.totalDurationSec - expected)).toBeLessThanOrEqual(2);
  });

  it("every sample has a numeric lat/lng point", () => {
    const track = buildTripTrack(ROUTE, 5);
    for (const sample of track.samples as TripPositionSample[]) {
      expect(typeof sample.point.lat).toBe("number");
      expect(typeof sample.point.lng).toBe("number");
      expect(Number.isFinite(sample.point.lat)).toBe(true);
      expect(Number.isFinite(sample.point.lng)).toBe(true);
    }
  });

  it("first sample lies at the origin and last sample at/near the destination", () => {
    const track = buildTripTrack(ROUTE, 5);
    const first = track.samples[0].point;
    const last = track.samples[track.samples.length - 1].point;
    expect(first.lat).toBeCloseTo(ORIGIN.lat, 5);
    expect(first.lng).toBeCloseTo(ORIGIN.lng, 5);
    expect(last.lat).toBeCloseTo(DESTINATION.lat, 3);
    expect(last.lng).toBeCloseTo(DESTINATION.lng, 3);
  });
});
