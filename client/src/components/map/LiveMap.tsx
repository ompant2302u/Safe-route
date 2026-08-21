import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import type { Hazard } from "../../types/hazard";
import type { SafePlace } from "../../types/safePlace";
import type { UserLocation } from "../../types/location";

type Props = {
  location: UserLocation | null;

  hazards: Hazard[];

  safePlaces: SafePlace[];
};

const DEFAULT_CENTER: [number, number] = [
  27.7172,
  85.324,
];

export default function LiveMap({
  location,
  hazards,
  safePlaces,
}: Props) {
  const center: [number, number] =
    location
      ? [
          location.latitude,
          location.longitude,
        ]
      : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="live-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {location && (
        <CircleMarker
          center={[
            location.latitude,
            location.longitude,
          ]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#2563eb",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <strong>Your Location</strong>
          </Popup>
        </CircleMarker>
      )}

      {hazards.map((hazard) => (
        <CircleMarker
          key={hazard.id}
          center={[
            hazard.latitude,
            hazard.longitude,
          ]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#dc2626",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <div className="map-popup">
              <strong>
                {hazard.title}
              </strong>

              {hazard.isDemo && (
                <span className="demo-label">
                  Demo
                </span>
              )}

              <p>
                Severity:{" "}
                <strong>
                  {hazard.severity}
                </strong>
              </p>

              <p>
                Confidence:{" "}
                {hazard.confidence}%
              </p>

              <p>
                {hazard.description}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {safePlaces.map((place) => (
        <CircleMarker
          key={place.id}
          center={[
            place.latitude,
            place.longitude,
          ]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#16a34a",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <div className="map-popup">
              <strong>
                {place.name}
              </strong>

              {place.isDemo && (
                <span className="demo-label">
                  Demo
                </span>
              )}

              <p>{place.address}</p>

              <p>
                Status:{" "}
                <strong>
                  {place.status}
                </strong>
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}