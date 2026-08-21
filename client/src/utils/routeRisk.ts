import type {
  Hazard,
  HazardSeverity,
} from "../types/hazard";

import type {
  BaseRouteOption,
  RouteHazardImpact,
  RouteOption,
  RouteRiskLevel,
} from "../types/route";

import calculateDistance
  from "./calculateDistance";

const SEVERITY_WEIGHT:
  Record<
    HazardSeverity,
    number
  > = {
    low: 20,
    medium: 35,
    high: 60,
    critical: 90,
  };

const RISK_BUFFER_METERS:
  Record<
    HazardSeverity,
    number
  > = {
    low: 300,
    medium: 450,
    high: 650,
    critical: 900,
  };

function findClosestDistance(
  route: BaseRouteOption,
  hazard: Hazard
): number {
  let minimumDistance =
    Number.POSITIVE_INFINITY;

  for (
    const [
      latitude,
      longitude,
    ] of route.coordinates
  ) {
    const distanceKm =
      calculateDistance(
        {
          latitude,
          longitude,
        },
        {
          latitude:
            hazard.latitude,

          longitude:
            hazard.longitude,
        }
      );

    const distanceMeters =
      distanceKm * 1000;

    if (
      distanceMeters <
      minimumDistance
    ) {
      minimumDistance =
        distanceMeters;
    }
  }

  return minimumDistance;
}

function calculateHazardImpact(
  route: BaseRouteOption,
  hazard: Hazard
): RouteHazardImpact | null {
  const distanceMeters =
    findClosestDistance(
      route,
      hazard
    );

  const riskBuffer =
    RISK_BUFFER_METERS[
      hazard.severity
    ];

  if (
    distanceMeters >
    riskBuffer
  ) {
    return null;
  }

  const proximityFactor =
    Math.max(
      0,
      1 -
        distanceMeters /
          riskBuffer
    );

  const confidenceFactor =
    Math.min(
      1,
      Math.max(
        0,
        hazard.confidence /
          100
      )
    );

  /*
   * Unverified information can
   * influence routing, but less
   * strongly than verified data.
   */
  const verificationFactor =
    hazard.verified
      ? 1
      : 0.65;

  const contribution =
    SEVERITY_WEIGHT[
      hazard.severity
    ] *
    proximityFactor *
    confidenceFactor *
    verificationFactor;

  return {
    hazardId:
      hazard.id,

    title:
      hazard.title,

    severity:
      hazard.severity,

    confidence:
      hazard.confidence,

    verified:
      hazard.verified,

    distanceMeters:
      Math.round(
        distanceMeters
      ),

    contribution:
      Number(
        contribution.toFixed(
          1
        )
      ),
  };
}

function getRiskLevel(
  score: number
): RouteRiskLevel {
  if (score < 20) {
    return "low";
  }

  if (score < 45) {
    return "medium";
  }

  if (score < 70) {
    return "high";
  }

  return "critical";
}

function buildReasons(
  impacts:
    RouteHazardImpact[],
  recommended: boolean,
  totalRoutes: number
): string[] {
  const reasons:
    string[] = [];

  if (
    impacts.length === 0
  ) {
    reasons.push(
      "No known hazards were detected inside the configured risk buffers."
    );
  } else {
    reasons.push(
      `${impacts.length} known ${
        impacts.length === 1
          ? "hazard is"
          : "hazards are"
      } close enough to influence this route.`
    );

    const closest =
      [...impacts].sort(
        (a, b) =>
          a.distanceMeters -
          b.distanceMeters
      )[0];

    reasons.push(
      `Closest known hazard is approximately ${closest.distanceMeters} m from the route.`
    );
  }

  if (recommended) {
    if (
      totalRoutes > 1
    ) {
      reasons.unshift(
        "Lowest calculated hazard exposure among the returned route alternatives."
      );
    } else {
      reasons.unshift(
        "Only one road route was returned by the routing service."
      );
    }
  }

  return reasons;
}

export function evaluateRoutes(
  routes:
    BaseRouteOption[],
  hazards:
    Hazard[]
): RouteOption[] {
  const evaluated =
    routes.map(
      (
        route
      ): Omit<
        RouteOption,
        | "isRecommended"
        | "reasons"
      > => {
        const impacts =
          hazards
            .map(
              (hazard) =>
                calculateHazardImpact(
                  route,
                  hazard
                )
            )
            .filter(
              (
                impact
              ): impact is
                RouteHazardImpact =>
                impact !== null
            )
            .sort(
              (a, b) =>
                b.contribution -
                a.contribution
            );

        const rawRisk =
          impacts.reduce(
            (
              total,
              impact
            ) =>
              total +
              impact.contribution,
            0
          );

        const riskScore =
          Math.min(
            100,
            Math.round(
              rawRisk
            )
          );

        return {
          ...route,

          riskScore,

          riskLevel:
            getRiskLevel(
              riskScore
            ),

          hazardImpacts:
            impacts,
        };
      }
    );

  const ranked =
    [...evaluated].sort(
      (a, b) => {
        if (
          a.riskScore !==
          b.riskScore
        ) {
          return (
            a.riskScore -
            b.riskScore
          );
        }

        return (
          a.durationSeconds -
          b.durationSeconds
        );
      }
    );

  return ranked.map(
    (
      route,
      index
    ): RouteOption => ({
      ...route,

      isRecommended:
        index === 0,

      reasons:
        buildReasons(
          route.hazardImpacts,
          index === 0,
          ranked.length
        ),
    })
  );
}