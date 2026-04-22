import { Circle } from "react-leaflet";
import { CAMPUSES, COVERAGE_RADIUS_METERS } from "../services/coverage";

const CIRCLE_STYLE = {
  color: "#C00000",
  weight: 2,
  dashArray: "6 6",
  fillColor: "#C00000",
  fillOpacity: 0.08,
} as const;

export default function CoverageCircles() {
  return (
    <>
      {CAMPUSES.map((campus) => (
        <Circle
          key={campus.id}
          center={[campus.center.lat, campus.center.lng]}
          radius={COVERAGE_RADIUS_METERS}
          pathOptions={CIRCLE_STYLE}
        />
      ))}
    </>
  );
}
