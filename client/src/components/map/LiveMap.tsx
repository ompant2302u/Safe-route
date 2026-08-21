import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import {
  useNavigate,
} from "react-router-dom";

import type {
  Hazard,
} from "../../types/hazard";

import type {
  SafePlace,
} from "../../types/safePlace";

import type {
  UserLocation,
} from "../../types/location";

type Props = {
  location:
    UserLocation | null;

  hazards:
    Hazard[];

  safePlaces:
    SafePlace[];
};

const DEFAULT_CENTER:
  [number, number] = [
    27.7172,
    85.324,
  ];

function getHazardColor(
  severity:
    Hazard["severity"]
) {
  switch (severity) {
    case "critical":
      return "#b91c1c";

    case "high":
      return "#dc2626";

    case "medium":
      return "#ea580c";

    case "low":
      return "#eab308";
  }
}

export default function LiveMap({
  location,
  hazards,
  safePlaces,
}: Props) {
  const navigate =
    useNavigate();

  const center:
    [number, number] =
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
            fillColor:
              "#2563eb",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <strong>
              Your Location
            </strong>
          </Popup>
        </CircleMarker>
      )}

      {hazards.map(
        (hazard) => (
          <CircleMarker
            key={hazard.id}
            center={[
              hazard.latitude,
              hazard.longitude,
            ]}
            radius={10}
            pathOptions={{
              color: "#ffffff",

              fillColor:
                getHazardColor(
                  hazard.severity
                ),

              fillOpacity: 1,
              weight: 3,
            }}
            eventHandlers={{
              click: () =>
                navigate(
                  `/incidents/${hazard.id}`
                ),
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>
                  {hazard.title}
                </strong>

                <p>
                  Severity:{" "}
                  <strong>
                    {
                      hazard.severity
                    }
                  </strong>
                </p>

                <p>
                  Confidence:{" "}
                  {
                    hazard.confidence
                  }
                  %
                </p>

                <p>
                  Verified hazard
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )
      )}

      {safePlaces.map(
        (place) => (
          <CircleMarker
            key={place.id}
            center={[
              place.latitude,
              place.longitude,
            ]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              fillColor:
                "#16a34a",
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

                <p>
                  {place.address}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )
      )}
    </MapContainer>
  );
}