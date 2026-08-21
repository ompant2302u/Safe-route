export type SafePlaceType =
  | "hospital"
  | "police"
  | "shelter"
  | "open_ground"
  | "health_post"
  | "fire_station"
  | "other";

export type SafePlaceStatus =
  | "available"
  | "limited"
  | "unavailable"
  | "unknown";

export type SafePlace = {
  id: number;

  name: string;
  type: SafePlaceType;

  latitude: number;
  longitude: number;

  address: string;

  status: SafePlaceStatus;

  contactNumber?: string;
  description?: string;

  isDemo?: boolean;
};