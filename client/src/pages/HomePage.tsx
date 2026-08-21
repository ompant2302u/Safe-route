import {
  AlertTriangle,
  CheckCircle2,
  LocateFixed,
  MapPin,
} from "lucide-react";

import LiveMap from "../components/map/LiveMap";

import useCurrentLocation from "../hooks/useCurrentLocation";

import {
  demoHazards,
  demoSafePlaces,
} from "../constants/demoMapData";

export default function HomePage() {
  const {
    location,
    loading,
    error,
  } = useCurrentLocation();

  return (
    <div className="home-page">
      <section className="home-header">
        <div>
          <span className="eyebrow">
            Disaster Safety & Navigation
          </span>

          <h1>SafeRoute Nepal</h1>

          <p>
            Check nearby hazards and find
            lower-risk routes during emergencies.
          </p>
        </div>

        <div className="location-status">
          <LocateFixed size={20} />

          <div>
            <strong>
              Your Location
            </strong>

            {loading && (
              <span>
                Detecting location...
              </span>
            )}

            {!loading && location && (
              <span className="status-success">
                Location detected
              </span>
            )}

            {!loading && error && (
              <span className="status-error">
                {error}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="section-heading">
          <div>
            <h2>Live Safety Map</h2>

            <p>
              Hazards and emergency locations
              near you.
            </p>
          </div>

          <span className="demo-warning">
            Demo data
          </span>
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
            Your location
          </span>

          <span>
            <i className="legend-dot hazard-dot" />
            Hazard
          </span>

          <span>
            <i className="legend-dot safe-dot" />
            Safe location
          </span>
        </div>
      </section>

      <section className="home-summary">
        <div className="summary-card">
          <div className="summary-icon danger">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>
              Active Hazards
            </span>

            <strong>
              {demoHazards.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon safe">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              Safe Locations
            </span>

            <strong>
              {demoSafePlaces.length}
            </strong>
          </div>
        </div>
      </section>

      <section className="nearby-section">
        <div className="section-heading">
          <div>
            <h2>Nearby Alerts</h2>

            <p>
              Recent hazard information
              around the map.
            </p>
          </div>
        </div>

        <div className="alert-list">
          {demoHazards.map(
            (hazard) => (
              <article
                key={hazard.id}
                className="alert-card"
              >
                <div className="alert-icon">
                  <AlertTriangle
                    size={21}
                  />
                </div>

                <div className="alert-content">
                  <div className="alert-title-row">
                    <h3>
                      {hazard.title}
                    </h3>

                    <span
                      className={`severity-badge severity-${hazard.severity}`}
                    >
                      {hazard.severity}
                    </span>
                  </div>

                  <p>
                    {hazard.description}
                  </p>

                  <div className="alert-meta">
                    <span>
                      <MapPin
                        size={14}
                      />
                      Demo location
                    </span>

                    <span>
                      Confidence{" "}
                      {hazard.confidence}%
                    </span>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      </section>
    </div>
  );
}