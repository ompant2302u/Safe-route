import {
  useEffect,
} from "react";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import {
  latLngBounds,
} from "leaflet";

import type {
  Hazard,
} from "../../types/hazard";

import type {
  UserLocation,
} from "../../types/location";

import type {
  RouteOption,
} from "../../types/route";

type Props = {
  start:
    UserLocation | null;

  destination:
    UserLocation | null;

  hazards:
    Hazard[];

  routes:
    RouteOption[];

  selectedRouteId:
    string | null;

  onDestinationChange:
    (
      destination:
        UserLocation
    ) => void;

  onSelectRoute:
    (
      routeId: string
    ) => void;
};

const DEFAULT_CENTER:
  [number, number] = [
    27.7172,
    85.324,
  ];

function DestinationPicker({
  onDestinationChange,
}: {
  onDestinationChange:
    (
      destination:
        UserLocation
    ) => void;
}) {
  useMapEvents({
    click(event) {
      onDestinationChange({
        latitude:
          event.latlng.lat,

        longitude:
          event.latlng.lng,
      });
    },
  });

  return null;
}

function MapController({
  start,
  destination,
  routes,
}: {
  start:
    UserLocation | null;

  destination:
    UserLocation | null;

  routes:
    RouteOption[];
}) {
  const map =
    useMap();

  useEffect(() => {
    const points:
      [number, number][] =
      [];

    if (start) {
      points.push([
        start.latitude,
        start.longitude,
      ]);
    }

    if (destination) {
      points.push([
        destination.latitude,
        destination.longitude,
      ]);
    }

    for (
      const route
      of routes
    ) {
      points.push(
        ...route.coordinates
      );
    }

    if (
      points.length >= 2
    ) {
      map.fitBounds(
        latLngBounds(
          points
        ),
        {
          padding: [
            35,
            35,
          ],
        }
      );

      return;
    }

    if (start) {
      map.flyTo(
        [
          start.latitude,
          start.longitude,
        ],
        14
      );
    }
  }, [
    start,
    destination,
    routes,
    map,
  ]);

  return null;
}

export default function RouteMap({
  start,
  destination,
  hazards,
  routes,
  selectedRouteId,
  onDestinationChange,
  onSelectRoute,
}: Props) {
  return (
    <MapContainer
      center={
        start
          ? [
              start.latitude,
              start.longitude,
            ]
          : DEFAULT_CENTER
      }
      zoom={13}
      className="route-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <DestinationPicker
        onDestinationChange={
          onDestinationChange
        }
      />

      <MapController
        start={start}
        destination={
          destination
        }
        routes={routes}
      />

      {start && (
        <CircleMarker
          center={[
            start.latitude,
            start.longitude,
          ]}
          radius={9}
          pathOptions={{
            color:
              "#ffffff",

            fillColor:
              "#2563eb",

            fillOpacity:
              1,

            weight: 3,
          }}
        >
          <Popup>
            Your current location
          </Popup>
        </CircleMarker>
      )}

      {destination && (
        <CircleMarker
          center={[
            destination.latitude,
            destination.longitude,
          ]}
          radius={10}
          pathOptions={{
            color:
              "#ffffff",

            fillColor:
              "#7c3aed",

            fillOpacity:
              1,

            weight: 3,
          }}
        >
          <Popup>
            Destination
          </Popup>
        </CircleMarker>
      )}

      {hazards.map(
        (hazard) => (
          <CircleMarker
            key={
              hazard.id
            }
            center={[
              hazard.latitude,
              hazard.longitude,
            ]}
            radius={8}
            pathOptions={{
              color:
                "#ffffff",

              fillColor:
                "#dc2626",

              fillOpacity:
                1,

              weight: 2,
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>
                  {
                    hazard.title
                  }
                </strong>

                {hazard.isDemo && (
                  <span className="demo-label">
                    Demo
                  </span>
                )}

                <p>
                  Severity:{" "}
                  {
                    hazard.severity
                  }
                </p>

                <p>
                  Confidence:{" "}
                  {
                    hazard.confidence
                  }
                  %
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )
      )}

      {routes.map(
        (route) => {
          const selected =
            route.id ===
            selectedRouteId;

          return (
            <Polyline
              key={
                route.id
              }
              positions={
                route.coordinates
              }
              pathOptions={{
                color:
                  route.isRecommended
                    ? "#168052"
                    : selected
                      ? "#2563eb"
                      : "#8b96a0",

                weight:
                  selected
                    ? 7
                    : route.isRecommended
                      ? 6
                      : 4,

                opacity:
                  selected ||
                  route.isRecommended
                    ? 0.95
                    : 0.65,
              }}
              eventHandlers={{
                click: () =>
                  onSelectRoute(
                    route.id
                  ),
              }}
            />
          );
        }
      )}
    </MapContainer>
  );
}