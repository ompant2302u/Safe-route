import { useEffect } from "react";

import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import type {
  UserLocation,
} from "../../types/location";

type Props = {
  selectedLocation:
    UserLocation | null;

  onSelect:
    (location: UserLocation) => void;
};

const DEFAULT_CENTER:
  [number, number] = [
    27.7172,
    85.324,
  ];

function LocationClickHandler({
  onSelect,
}: {
  onSelect:
    (location: UserLocation) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude:
          event.latlng.lat,

        longitude:
          event.latlng.lng,
      });
    },
  });

  return null;
}

function MapRecenter({
  location,
}: {
  location:
    UserLocation | null;
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
      16,
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

export default function ReportLocationMap({
  selectedLocation,
  onSelect,
}: Props) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      className="report-location-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationClickHandler
        onSelect={onSelect}
      />

      <MapRecenter
        location={selectedLocation}
      />

      {selectedLocation && (
        <CircleMarker
          center={[
            selectedLocation.latitude,
            selectedLocation.longitude,
          ]}
          radius={10}
          pathOptions={{
            color: "#ffffff",

            fillColor:
              "#dc2626",

            fillOpacity: 1,

            weight: 3,
          }}
        />
      )}
    </MapContainer>
  );
}