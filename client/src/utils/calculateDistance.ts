type Coordinate = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

function degreesToRadians(
  degrees: number
): number {
  return degrees * (Math.PI / 180);
}

export default function calculateDistance(
  from: Coordinate,
  to: Coordinate
): number {
  const latitudeDifference =
    degreesToRadians(
      to.latitude - from.latitude
    );

  const longitudeDifference =
    degreesToRadians(
      to.longitude - from.longitude
    );

  const fromLatitude =
    degreesToRadians(
      from.latitude
    );

  const toLatitude =
    degreesToRadians(
      to.latitude
    );

  const a =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(
        longitudeDifference / 2
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS_KM * c;
}