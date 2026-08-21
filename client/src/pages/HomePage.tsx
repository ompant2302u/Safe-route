import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";

import LiveMap from "../components/map/LiveMap";
import useCurrentLocation from "../hooks/useCurrentLocation";
import {
  demoHazards,
  demoSafePlaces,
} from "../constants/demoMapData";

import "./HomePage.css";

type RiskLevel = "critical" | "high" | "moderate" | "low";

function getRiskLevel(hazards: typeof demoHazards): RiskLevel {
  if (hazards.some((h) => h.severity === "critical")) return "critical";
  if (hazards.some((h) => h.severity === "high")) return "high";
  if (hazards.length > 0) return "moderate";
  return "low";
}

const RISK_COPY: Record<RiskLevel, string> = {
  critical: "Critical risk in your area",
  high: "High risk in your area",
  moderate: "Moderate risk in your area",
  low: "No active hazards nearby",
};

export default function HomePage() {
  const {
    location,
    loading,
    error,
  } = useCurrentLocation();

  const riskLevel = getRiskLevel(demoHazards);

  return (
    <div className="home-page">

      {/* TOP HEADER BAR */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="logo-icon-wrapper">
            <ShieldCheck size={24} className="text-success" />
          </div>
          <div>
            <h1>SafeRoute Nepal</h1>
            <p>Safer roads. Stronger communities.</p>
          </div>
        </div>
      </header>

      {/* CAUTION BANNER */}
      <section className={`caution-banner risk-${riskLevel}`}>
        <div className="caution-left">
          <div className="caution-icon">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h2>Travel with caution</h2>
            <p className="caution-status">
              <span className="dot" />
              {RISK_COPY[riskLevel]}
            </p>
          </div>
        </div>

        <button className="btn-primary" type="button">
          <Navigation size={16} />
          Plan Safe Route
        </button>
      </section>

      {/* LIVE MAP */}
      <section className="map-section">
        <div className="section-heading">
          <div>
            <h2>Live Safety Map</h2>
            <p>Hazards and emergency locations near you.</p>
          </div>

          <span className="demo-warning">Demo data</span>
        </div>

        <div className="map-wrapper">
          <LiveMap
            location={location}
            hazards={demoHazards}
            safePlaces={demoSafePlaces}
          />
        </div>

        <div className="map-legend">
          <span>
            <i className="legend-dot user-dot" />
            {loading
              ? "Detecting location..."
              : error
                ? "Location unavailable"
                : "You"}
          </span>

          <span>
            <i className="legend-dot hazard-dot" />
            Hazard
          </span>

          <span>
            <i className="legend-dot moderate-dot" />
            Moderate
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
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Hazards Nearby</span>
            <strong>{demoHazards.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon safe">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Safe Places Nearby</span>
            <strong>{demoSafePlaces.length}</strong>
          </div>
        </div>
      </section>

      {/* NEARBY ALERTS */}
      <section className="nearby-section">
        <div className="section-heading">
          <div>
            <h2>Nearby Alerts</h2>
            <p>Recent hazard information around the map.</p>
          </div>

          <a className="view-all" href="#">
            View all
          </a>
        </div>

        <div className="alert-list">
          {demoHazards.map((hazard) => (
            <article key={hazard.id} className="alert-card">
              <div className="alert-icon">
                <AlertTriangle size={21} />
              </div>

              <div className="alert-content">
                <div className="alert-title-row">
                  <h3>{hazard.title}</h3>

                  <span
                    className={`severity-badge severity-${hazard.severity}`}
                  >
                    {hazard.severity}
                  </span>
                </div>

                <p>{hazard.description}</p>

                <div className="alert-meta">
                  <span>
                    <MapPin size={14} />
                    Demo location
                  </span>

                  <span>Confidence {hazard.confidence}%</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}