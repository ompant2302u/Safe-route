import { API_BASE_URL } from "./api";

import type {
  Hazard,
  HazardSeverity,
  HazardType,
} from "../types/hazard";

type ApiHazard = {
  id: number;

  type: string;
  severity: string;

  title: string;
  description: string;

  latitude: number;
  longitude: number;

  confidence: number;

  verified: boolean;
  active: boolean;

  source: string;

  reportId: number | null;

  createdAt: string;
  updatedAt: string;
};

type HazardsResponse = {
  success: boolean;
  data?: ApiHazard[];
  message?: string;
};

type HazardResponse = {
  success: boolean;
  data?: ApiHazard;
  message?: string;
};

function normalizeType(
  type: string
): HazardType {
  return type.toLowerCase() as HazardType;
}

function normalizeSeverity(
  severity: string
): HazardSeverity {
  return severity.toLowerCase() as HazardSeverity;
}

function normalizeHazard(
  hazard: ApiHazard
): Hazard {
  return {
    id: hazard.id,

    type: normalizeType(
      hazard.type
    ),

    severity:
      normalizeSeverity(
        hazard.severity
      ),

    title: hazard.title,
    description:
      hazard.description,

    latitude:
      hazard.latitude,

    longitude:
      hazard.longitude,

    confidence:
      hazard.confidence,

    verified:
      hazard.verified,

    source:
      hazard.source,
  };
}

export async function getActiveHazards():
  Promise<Hazard[]> {
  const response =
    await fetch(
      `${API_BASE_URL}/hazards`
    );

  const result =
    (await response.json()) as
      HazardsResponse;

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ??
        "Unable to load hazards."
    );
  }

  return (
    result.data ?? []
  ).map(normalizeHazard);
}

export async function getHazardById(
  id: number
): Promise<Hazard> {
  const response =
    await fetch(
      `${API_BASE_URL}/hazards/${id}`
    );

  const result =
    (await response.json()) as
      HazardResponse;

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.message ??
        "Hazard not found."
    );
  }

  return normalizeHazard(
    result.data
  );
}