import { prisma }
  from "../config/database";

export async function getActiveHazards() {
  return prisma.hazard.findMany({
    where: {
      active: true,
      verified: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,

      type: true,
      severity: true,

      title: true,
      description: true,

      latitude: true,
      longitude: true,

      confidence: true,

      verified: true,
      active: true,

      source: true,
      reportId: true,

      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getHazardById(
  hazardId: number
) {
  return prisma.hazard.findFirst({
    where: {
      id: hazardId,
      active: true,
      verified: true,
    },

    select: {
      id: true,

      type: true,
      severity: true,

      title: true,
      description: true,

      latitude: true,
      longitude: true,

      confidence: true,

      verified: true,
      active: true,

      source: true,
      reportId: true,

      createdAt: true,
      updatedAt: true,
    },
  });
}