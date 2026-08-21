import type {
  UserLocation,
} from "../types/location";

import type {
  BaseRouteOption,
  RoutePoint,
} from "../types/route";

type OsrmRoute = {
  distance: number;

  duration: number;

  geometry: {
    coordinates:
      [number, number][];
  };
};

type OsrmResponse = {
  code: string;

  message?: string;

  routes?: OsrmRoute[];
};

const OSRM_BASE_URL =
  "https://router.project-osrm.org";

export async function getRouteAlternatives(
  start: UserLocation,
  destination: UserLocation
): Promise<BaseRouteOption[]> {
  const coordinates =
    `${start.longitude},${start.latitude};` +
    `${destination.longitude},${destination.latitude}`;

  const url =
    `${OSRM_BASE_URL}` +
    `/route/v1/driving/` +
    `${coordinates}` +
    `?alternatives=true` +
    `&overview=full` +
    `&geometries=geojson` +
    `&steps=false`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Routing service is currently unavailable."
    );
  }

  const data =
    (await response.json()) as
      OsrmResponse;

  if (
    data.code !== "Ok" ||
    !data.routes ||
    data.routes.length === 0
  ) {
    throw new Error(
      data.message ??
        "No drivable route could be found."
    );
  }

  return data.routes
    .slice(0, 3)
    .map(
      (
        route,
        index
      ): BaseRouteOption => {
        const routePoints:
          RoutePoint[] =
          route.geometry.coordinates.map(
            (
              coordinate
            ): RoutePoint => [
              coordinate[1],
              coordinate[0],
            ]
          );

        return {
          id:
            `route-${index + 1}`,

          distanceMeters:
            route.distance,

          durationSeconds:
            route.duration,

          coordinates:
            routePoints,
        };
      }
    );
}