import {
  HazardType,
  Severity,
} from "../../generated/prisma/enums";

import { prisma } from "../config/database";

import type {
  CreateHazardReportInput,
} from "../validators/hazardReportValidator";

const hazardTypeMap = {
  landslide:
    HazardType.LANDSLIDE,

  flood:
    HazardType.FLOOD,

  fire:
    HazardType.FIRE,

  road_blockage:
    HazardType.ROAD_BLOCKAGE,

  earthquake_damage:
    HazardType.EARTHQUAKE_DAMAGE,

  other:
    HazardType.OTHER,
} as const;

const severityMap = {
  low:
    Severity.LOW,

  medium:
    Severity.MEDIUM,

  high:
    Severity.HIGH,

  critical:
    Severity.CRITICAL,
} as const;

export async function createHazardReport(
  input:
    CreateHazardReportInput
) {
  return prisma.hazardReport.create({
    data: {
      type:
        hazardTypeMap[
          input.type
        ],

      severity:
        severityMap[
          input.severity
        ],

      title:
        input.title,

      description:
        input.description,

      latitude:
        input.latitude,

      longitude:
        input.longitude,

      photoUrl:
        input.photoUrl ??
        null,

      status:
        "PENDING",

      confidence:
        0,
    },
  });
}