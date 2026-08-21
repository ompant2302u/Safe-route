import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import type {
  RouteOption,
} from "../../types/route";

type Props = {
  route:
    RouteOption;

  selected:
    boolean;

  index:
    number;

  onSelect:
    () => void;
};

function formatDistance(
  meters: number
): string {
  if (
    meters < 1000
  ) {
    return `${Math.round(
      meters
    )} m`;
  }

  return `${(
    meters / 1000
  ).toFixed(1)} km`;
}

function formatDuration(
  seconds: number
): string {
  const minutes =
    Math.max(
      1,
      Math.round(
        seconds / 60
      )
    );

  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remaining =
    minutes % 60;

  return remaining
    ? `${hours} hr ${remaining} min`
    : `${hours} hr`;
}

export default function RouteCard({
  route,
  selected,
  index,
  onSelect,
}: Props) {
  return (
    <article
      className={
        selected
          ? "route-result-card selected"
          : "route-result-card"
      }
      onClick={
        onSelect
      }
    >
      <div className="route-card-header">
        <div>
          <span className="route-number">
            Route{" "}
            {index + 1}
          </span>

          <h3>
            {route.isRecommended
              ? "Recommended Lower-Risk Route"
              : "Alternative Route"}
          </h3>
        </div>

        {route.isRecommended && (
          <span className="recommended-badge">
            <ShieldCheck
              size={14}
            />
            Recommended
          </span>
        )}
      </div>

      <div className="route-metrics">
        <div>
          <MapPinned
            size={18}
          />

          <span>
            Distance
          </span>

          <strong>
            {formatDistance(
              route.distanceMeters
            )}
          </strong>
        </div>

        <div>
          <Clock3
            size={18}
          />

          <span>
            Estimated time
          </span>

          <strong>
            {formatDuration(
              route.durationSeconds
            )}
          </strong>
        </div>

        <div>
          {route.riskScore <
          45 ? (
            <CheckCircle2
              size={18}
            />
          ) : (
            <AlertTriangle
              size={18}
            />
          )}

          <span>
            Risk score
          </span>

          <strong
            className={`route-risk-text risk-${route.riskLevel}`}
          >
            {
              route.riskScore
            }
            /100
          </strong>
        </div>
      </div>

      <div className="route-risk-row">
        <span
          className={`route-risk-badge risk-${route.riskLevel}`}
        >
          {route.riskLevel}
          {" "}
          risk estimate
        </span>

        <span>
          {
            route
              .hazardImpacts
              .length
          }{" "}
          nearby known{" "}
          {route
            .hazardImpacts
            .length === 1
            ? "hazard"
            : "hazards"}
        </span>
      </div>

      <div className="route-reasons">
        {route.reasons.map(
          (
            reason
          ) => (
            <p
              key={
                reason
              }
            >
              {reason}
            </p>
          )
        )}
      </div>

      {route
        .hazardImpacts
        .length >
        0 && (
        <div className="route-hazards">
          <strong>
            Hazards influencing
            this score
          </strong>

          {route
            .hazardImpacts
            .slice(
              0,
              3
            )
            .map(
              (
                impact
              ) => (
                <div
                  key={
                    impact.hazardId
                  }
                  className="route-hazard-item"
                >
                  <AlertTriangle
                    size={15}
                  />

                  <div>
                    <strong>
                      {
                        impact.title
                      }
                    </strong>

                    <span>
                      {
                        impact.severity
                      }
                      {" • "}
                      approximately{" "}
                      {
                        impact.distanceMeters
                      }
                      {" m away"}
                    </span>
                  </div>
                </div>
              )
            )}
        </div>
      )}
    </article>
  );
}