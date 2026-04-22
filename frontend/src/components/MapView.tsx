import { MapContainer, TileLayer } from "react-leaflet";
import { useTranslation } from "react-i18next";

// Geographical defaults. Móstoles campus is the most populated URJC campus
// and it's the reference location for the prototype.
const MOSTOLES_CAMPUS: [number, number] = [40.336, -3.875];
const DEFAULT_ZOOM = 16;

export default function MapView() {
  const { t } = useTranslation();

  return (
    <MapContainer
      center={MOSTOLES_CAMPUS}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      aria-label={t("home.mapLabel")}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
    </MapContainer>
  );
}
