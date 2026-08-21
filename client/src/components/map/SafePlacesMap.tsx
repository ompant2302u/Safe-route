import { useEffect } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type {
  SafePlace,
} from "../../types/safePlace";

import type {
  UserLocation,
} from "../../types/location";

type Props = {
  location: UserLocation | null;
  safePlaces: SafePlace[];
  selectedPlaceId: number | null;

  onSelectPlace:
    (place: SafePlace) => void;
};

const DEFAULT_CENTER:
  [number, number] = [
    27.7172,
    85.324,
  ];

function MapController({
  location,
}: {
  location: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo(
      [
        location.latitude,
        location.longitude,
      ],
      13,
      {
        duration: 0.5,
      }
    );
  }, [
    location,
    map,
  ]);

  return null;
}

export default function SafePlacesMap({
  location,
  safePlaces,
  selectedPlaceId,
  onSelectPlace,
}: Props) {
  return (
    <MapContainer
      center={
        location
          ? [
              location.latitude,
              location.longitude,
            ]
          : DEFAULT_CENTER
      }
      zoom={13}
      className="safe-places-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        location={location}
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
            <strong>
              Your Location
            </strong>
          </Popup>
        </CircleMarker>
      )}

      {safePlaces.map(
        (place) => {
          const selected =
            place.id ===
            selectedPlaceId;

          return (
            <CircleMarker
              key={place.id}
              center={[
                place.latitude,
                place.longitude,
              ]}
              radius={
                selected
                  ? 12
                  : 9
              }
              pathOptions={{
                color:
                  selected
                    ? "#145c3c"
                    : "#ffffff",

                fillColor:
                  "#16a34a",

                fillOpacity:
                  1,

                weight:
                  selected
                    ? 4
                    : 3,
              }}
              eventHandlers={{
                click: () =>
                  onSelectPlace(
                    place
                  ),
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

                  <p>
                    Status:{" "}
                    <strong>
                      {place.status}
                    </strong>
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        }
      )}
    </MapContainer>
  );
}