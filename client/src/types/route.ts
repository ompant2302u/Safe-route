import type {
  HazardSeverity,
} from "./hazard";

export type RoutePoint = [
  latitude: number,
  longitude: number
];

export type BaseRouteOption = {
  id: string;

  distanceMeters: number;
  durationSeconds: number;

  coordinates: RoutePoint[];
};

export type RouteRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type RouteHazardImpact = {
  hazardId: number;

  title: string;

  severity: HazardSeverity;

  confidence: number;

  verified: boolean;

  distanceMeters: number;

  contribution: number;
};

export type RouteOption =
  BaseRouteOption & {
    riskScore: number;

    riskLevel: RouteRiskLevel;

    hazardImpacts:
      RouteHazardImpact[];

    isRecommended: boolean;

    reasons: string[];
  };