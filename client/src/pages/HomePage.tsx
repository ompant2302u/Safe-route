import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import LiveMap from "../components/map/LiveMap";

import useCurrentLocation from "../hooks/useCurrentLocation";

import {
  demoSafePlaces,
} from "../constants/demoMapData";

import {
  getActiveHazards,
} from "../services/hazardService";

import type {
  Hazard,
} from "../types/hazard";

import "./HomePage.css";

type RiskLevel =
  | "critical"
  | "high"
  | "moderate"
  | "low";

function getRiskLevel(
  hazards: Hazard[]
): RiskLevel {
  if (
    hazards.some(
      (hazard) =>
        hazard.severity === "critical"
    )
  ) {
    return "critical";
  }

  if (
    hazards.some(
      (hazard) =>
        hazard.severity === "high"
    )
  ) {
    return "high";
  }

  if (hazards.length > 0) {
    return "moderate";
  }

  return "low";
}

const RISK_COPY: Record<
  RiskLevel,
  string
> = {
  critical:
    "Critical verified hazard in your area",

  high:
    "High-risk verified hazard in your area",

  moderate:
    "Verified hazards reported nearby",

  low:
    "No active verified hazards nearby",
};

export default function HomePage() {
  const navigate =
    useNavigate();

  const {
    location,
    loading: locationLoading,
    error: locationError,
  } =
    useCurrentLocation();

  const [
    hazards,
    setHazards,
  ] =
    useState<Hazard[]>([]);

  const [
    hazardsLoading,
    setHazardsLoading,
  ] =
    useState(true);

  const [
    hazardsError,
    setHazardsError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    let cancelled =
      false;

    async function loadHazards() {
      try {
        const data =
          await getActiveHazards();

        if (cancelled) {
          return;
        }

        setHazards(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setHazardsError(
          error instanceof Error
            ? error.message
            : "Unable to load hazards."
        );
      } finally {
        if (!cancelled) {
          setHazardsLoading(
            false
          );
        }
      }
    }

    void loadHazards();

    return () => {
      cancelled = true;
    };
  }, []);

  const riskLevel =
    getRiskLevel(hazards);

  return (
    <div className="home-page">
      {/* HEADER */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="logo-icon-wrapper">
            <ShieldCheck
              size={24}
            />
          </div>

          <div>
            <h1>
              SafeRoute Nepal
            </h1>

            <p>
              Safer roads. Stronger
              communities.
            </p>
          </div>
        </div>
      </header>

      {/* SAFETY STATUS */}
      <section
        className={`caution-banner risk-${riskLevel}`}
      >
        <div className="caution-left">
          <div className="caution-icon">
            <AlertTriangle
              size={22}
            />
          </div>

          <div>
            <h2>
              Travel with caution
            </h2>

            <p className="caution-status">
              <span className="dot" />

              {
                RISK_COPY[
                  riskLevel
                ]
              }
            </p>
          </div>
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={() =>
            navigate("/route")
          }
        >
          <Navigation
            size={16}
          />

          Find Lower-Risk Route
        </button>
      </section>

      {/* API ERROR */}
      {hazardsError && (
        <div className="home-error">
          <AlertTriangle
            size={18}
          />

          <span>
            {hazardsError}
          </span>
        </div>
      )}

      {/* LIVE MAP */}
      <section className="map-section">
        <div className="section-heading">
          <div>
            <h2>
              Live Safety Map
            </h2>

            <p>
              Verified hazards and
              emergency locations
              near you.
            </p>
          </div>

          <span className="live-data-badge">
            {hazardsLoading
              ? "Loading hazards..."
              : `${hazards.length} verified hazard${
                  hazards.length ===
                  1
                    ? ""
                    : "s"
                }`}
          </span>
        </div>

        <div className="map-wrapper">
          <LiveMap
            location={location}
            hazards={hazards}
            safePlaces={
              demoSafePlaces
            }
          />
        </div>

        <div className="map-legend">
          <span>
            <i className="legend-dot user-dot" />

            {locationLoading
              ? "Detecting location..."
              : locationError
                ? "Location unavailable"
                : "You"}
          </span>

          <span>
            <i className="legend-dot hazard-dot" />
            High / Critical
          </span>

          <span>
            <i className="legend-dot moderate-dot" />
            Low / Medium
          </span>

          <span>
            <i className="legend-dot safe-dot" />
            Safe place
          </span>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="home-summary">
        <div className="summary-card">
          <div className="summary-icon danger">
            <AlertTriangle
              size={22}
            />
          </div>

          <div>
            <span>
              Verified Hazards
            </span>

            <strong>
              {hazardsLoading
                ? "..."
                : hazards.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon safe">
            <CheckCircle2
              size={22}
            />
          </div>

          <div>
            <span>
              Safe Places
            </span>

            <strong>
              {
                demoSafePlaces.length
              }
            </strong>
          </div>
        </div>
      </section>

      {/* VERIFIED ALERTS */}
      <section className="nearby-section">
        <div className="section-heading">
          <div>
            <h2>
              Verified Alerts
            </h2>

            <p>
              Active hazard
              information from the
              SafeRoute database.
            </p>
          </div>
        </div>

        {hazardsLoading ? (
          <div className="alert-card">
            Loading verified
            hazards...
          </div>
        ) : hazards.length ===
          0 ? (
          <div className="alert-card">
            No active verified
            hazards found.
          </div>
        ) : (
          <div className="alert-list">
            {hazards.map(
              (hazard) => (
                <Link
                  key={hazard.id}
                  to={`/incidents/${hazard.id}`}
                  className="alert-card alert-card-link"
                >
                  <div className="alert-icon">
                    <AlertTriangle
                      size={21}
                    />
                  </div>

                  <div className="alert-content">
                    <div className="alert-title-row">
                      <h3>
                        {
                          hazard.title
                        }
                      </h3>

                      <span
                        className={`severity-badge severity-${hazard.severity}`}
                      >
                        {
                          hazard.severity
                        }
                      </span>
                    </div>

                    <p>
                      {
                        hazard.description
                      }
                    </p>

                    <div className="alert-meta">
                      <span>
                        <MapPin
                          size={14}
                        />

                        {hazard.latitude.toFixed(
                          4
                        )}
                        ,{" "}
                        {hazard.longitude.toFixed(
                          4
                        )}
                      </span>

                      <span>
                        Confidence{" "}
                        {
                          hazard.confidence
                        }
                        %
                      </span>

                      <span>
                        Verified
                      </span>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}