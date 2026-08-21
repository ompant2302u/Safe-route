import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getHazardById,
} from "../services/hazardService";

import type {
  Hazard,
} from "../types/hazard";

import "./IncidentDetailsPage.css";

export default function IncidentDetailsPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } =
    useParams();

  const [
    hazard,
    setHazard,
  ] = useState<
    Hazard | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      const hazardId =
        Number(id);

      if (
        !Number.isInteger(
          hazardId
        ) ||
        hazardId <= 0
      ) {
        setError(
          "Invalid hazard."
        );

        setLoading(false);

        return;
      }

      try {
        const data =
          await getHazardById(
            hazardId
          );

        if (!cancelled) {
          setHazard(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load hazard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="incident-page">
        Loading incident...
      </div>
    );
  }

  if (
    error ||
    !hazard
  ) {
    return (
      <div className="incident-page">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
        >
          Back
        </button>

        <p>
          {error ??
            "Hazard not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="incident-page">
      <button
        type="button"
        className="incident-back"
        onClick={() =>
          navigate(-1)
        }
      >
        <ArrowLeft
          size={17}
        />

        Back
      </button>

      <div className="incident-header">
        <div>
          <span className="eyebrow">
            Verified Incident
          </span>

          <h1>
            {hazard.title}
          </h1>
        </div>

        <span
          className={`severity-badge severity-${hazard.severity}`}
        >
          {hazard.severity}
        </span>
      </div>

      <div className="incident-details-card">
        <div>
          <AlertTriangle
            size={20}
          />

          <div>
            <strong>
              Hazard Type
            </strong>

            <span>
              {hazard.type.replaceAll(
                "_",
                " "
              )}
            </span>
          </div>
        </div>

        <div>
          <ShieldCheck
            size={20}
          />

          <div>
            <strong>
              Confidence
            </strong>

            <span>
              {
                hazard.confidence
              }
              %
            </span>
          </div>
        </div>

        <div>
          <MapPin
            size={20}
          />

          <div>
            <strong>
              Location
            </strong>

            <span>
              {
                hazard.latitude.toFixed(
                  6
                )
              }
              ,{" "}
              {
                hazard.longitude.toFixed(
                  6
                )
              }
            </span>
          </div>
        </div>
      </div>

      <section className="incident-description">
        <h2>
          Description
        </h2>

        <p>
          {hazard.description}
        </p>
      </section>

      <div className="route-safety-warning">
        <ShieldCheck
          size={20}
        />

        <div>
          <strong>
            Verified hazard
          </strong>

          <span>
            This incident has been
            reviewed before being
            published to SafeRoute.
            Conditions may still
            change.
          </span>
        </div>
      </div>
    </div>
  );
}