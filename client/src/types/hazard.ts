export type HazardSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type HazardType =
  | "landslide"
  | "flood"
  | "fire"
  | "road_blockage"
  | "earthquake_damage"
  | "other";

export type Hazard = {
  id: number;

  title: string;

  type: HazardType;

  severity:
    HazardSeverity;

  latitude: number;
  longitude: number;

  description: string;

  verified: boolean;

  confidence: number;

  source?: string;

  isDemo?: boolean;
};

export type HazardReportStatus =
  | "pending"
  | "verified"
  | "rejected";

export type HazardReport = {
  id: string;

  type: HazardType;

  severity:
    HazardSeverity;

  title: string;
  description: string;

  latitude: number;
  longitude: number;

  status:
    HazardReportStatus;

  verified: boolean;

  confidence: number;

  createdAt: string;

  evidenceName?: string;
};