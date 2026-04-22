import { describe, expect, it } from "vitest";
import { calculateRoutes, classifySafety } from "./routing";
import type { LatLng, Route } from "../types/route";

const ORIGIN: LatLng = { lat: 40.336, lng: -3.875 };
const DESTINATION: LatLng = { lat: 40.337, lng: -3.874 };

describe("calculateRoutes", () => {
  it("returns exactly 3 routes", () => {
    expect(calculateRoutes(ORIGIN, DESTINATION)).toHaveLength(3);
  });

  it("every route has at least 2 waypoints", () => {
    const routes = calculateRoutes(ORIGIN, DESTINATION);
    for (const route of routes) {
      expect(route.waypoints.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("labels include principal, alternative1 and alternative2", () => {
    const routes = calculateRoutes(ORIGIN, DESTINATION);
    const labels = new Set(routes.map((r: Route): string => r.label));
    expect(labels).toEqual(
      new Set(["principal", "alternative1", "alternative2"]),
    );
  });

  it("returns routes sorted by ISP descending", () => {
    const routes = calculateRoutes(ORIGIN, DESTINATION);
    for (let i = 1; i < routes.length; i += 1) {
      expect(routes[i - 1].isp).toBeGreaterThanOrEqual(routes[i].isp);
    }
  });
});

describe("classifySafety", () => {
  it("classifies 80 as high", () => expect(classifySafety(80)).toBe("high"));
  it("classifies 50 as medium", () =>
    expect(classifySafety(50)).toBe("medium"));
  it("classifies 20 as low", () => expect(classifySafety(20)).toBe("low"));

  it("is inclusive at the 70 boundary (high)", () => {
    expect(classifySafety(70)).toBe("high");
  });
  it("is exclusive just below 70 (medium)", () => {
    expect(classifySafety(69)).toBe("medium");
  });
  it("is inclusive at the 40 boundary (medium)", () => {
    expect(classifySafety(40)).toBe("medium");
  });
  it("is exclusive just below 40 (low)", () => {
    expect(classifySafety(39)).toBe("low");
  });
});
