import { describe, expect, it } from "vitest";
import {
  CAMPUSES,
  COVERAGE_RADIUS_METERS,
  haversineDistance,
  isWithinCoverage,
} from "./coverage";
import type { LatLng } from "../types/route";

const METERS_PER_DEG_LAT = 111_320;

describe("haversineDistance", () => {
  it("returns 0 for the same point", () => {
    const p: LatLng = { lat: 40.336, lng: -3.875 };
    expect(haversineDistance(p, p)).toBeCloseTo(0, 5);
  });

  it("computes ~500 m between two points 500 m apart (due north)", () => {
    const a: LatLng = { lat: 40.336, lng: -3.875 };
    const b: LatLng = { lat: a.lat + 500 / METERS_PER_DEG_LAT, lng: a.lng };
    const d = haversineDistance(a, b);
    expect(d).toBeGreaterThan(499);
    expect(d).toBeLessThan(501);
  });

  it("is symmetric", () => {
    const a: LatLng = { lat: 40.336, lng: -3.875 };
    const b: LatLng = { lat: 40.343, lng: -3.818 };
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 3);
  });
});

describe("isWithinCoverage", () => {
  it("accepts the Móstoles campus centre", () => {
    expect(isWithinCoverage(CAMPUSES[0].center)).toBe(true);
  });

  it("rejects Puerta del Sol, Madrid (clearly out of every campus)", () => {
    const sol: LatLng = { lat: 40.4168, lng: -3.7038 };
    expect(isWithinCoverage(sol)).toBe(false);
  });

  it("accepts a point 499 m north of a campus centre", () => {
    const center = CAMPUSES[0].center;
    const p: LatLng = {
      lat: center.lat + 499 / METERS_PER_DEG_LAT,
      lng: center.lng,
    };
    expect(isWithinCoverage(p)).toBe(true);
  });

  it("rejects a point 501 m north of the same campus centre", () => {
    const center = CAMPUSES[0].center;
    const p: LatLng = {
      lat: center.lat + 501 / METERS_PER_DEG_LAT,
      lng: center.lng,
    };
    expect(isWithinCoverage(p)).toBe(false);
  });

  it("uses 500 m as the coverage radius constant", () => {
    expect(COVERAGE_RADIUS_METERS).toBe(500);
  });
});
