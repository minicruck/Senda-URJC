import { describe, expect, it } from "vitest";
import { detectAnomaly } from "./monitoring";
import type { LatLng } from "../types/route";
import type { Thresholds } from "../types/trip";

const ROUTE: LatLng[] = [
  { lat: 40.336, lng: -3.875 },
  { lat: 40.338, lng: -3.873 },
];
const THRESHOLDS: Thresholds = {
  pauseThresholdSec: 60,
  deviationThresholdMeters: 50,
};

describe("detectAnomaly", () => {
  it("returns null when on route and pause is below the threshold", () => {
    expect(
      detectAnomaly({
        position: ROUTE[0],
        routeWaypoints: ROUTE,
        pauseDurationSec: 10,
        thresholds: THRESHOLDS,
      }),
    ).toBeNull();
  });

  it("returns 'pause' when pauseDurationSec meets the threshold", () => {
    expect(
      detectAnomaly({
        position: ROUTE[0],
        routeWaypoints: ROUTE,
        pauseDurationSec: 60,
        thresholds: THRESHOLDS,
      }),
    ).toBe("pause");
  });

  it("returns 'pause' when pauseDurationSec exceeds the threshold", () => {
    expect(
      detectAnomaly({
        position: ROUTE[0],
        routeWaypoints: ROUTE,
        pauseDurationSec: 120,
        thresholds: THRESHOLDS,
      }),
    ).toBe("pause");
  });

  it("returns 'deviation' when the position is well beyond the route", () => {
    // ~200 m north of the origin, clearly beyond the 50 m threshold
    const off: LatLng = {
      lat: ROUTE[0].lat + 200 / 111_320,
      lng: ROUTE[0].lng,
    };
    expect(
      detectAnomaly({
        position: off,
        routeWaypoints: ROUTE,
        pauseDurationSec: 0,
        thresholds: THRESHOLDS,
      }),
    ).toBe("deviation");
  });

  it("prioritises 'deviation' over 'pause' when both conditions hold", () => {
    const off: LatLng = {
      lat: ROUTE[0].lat + 200 / 111_320,
      lng: ROUTE[0].lng,
    };
    expect(
      detectAnomaly({
        position: off,
        routeWaypoints: ROUTE,
        pauseDurationSec: 120,
        thresholds: THRESHOLDS,
      }),
    ).toBe("deviation");
  });
});
