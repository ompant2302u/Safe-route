import {
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  MapPin,
  Upload,
} from "lucide-react";

import ReportLocationMap
  from "../components/map/ReportLocationMap";

import useCurrentLocation
  from "../hooks/useCurrentLocation";

import {
  saveHazardReport,
} from "../services/reportService";

import type {
  HazardSeverity,
  HazardType,
} from "../types/hazard";

import type {
  UserLocation,
} from "../types/location";

const DESCRIPTION_LIMIT = 300;

export default function ReportHazardPage() {
  const {
    location:
      currentLocation,

    error:
      locationError,
  } = useCurrentLocation();

  const [
    hazardType,
    setHazardType,
  ] =
    useState<
      HazardType | ""
    >("");

  const [
    severity,
    setSeverity,
  ] =
    useState<
      HazardSeverity | ""
    >("");

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    selectedLocation,
    setSelectedLocation,
  ] =
    useState<
      UserLocation | null
    >(null);

  const [
    evidence,
    setEvidence,
  ] =
    useState<File | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    useState(false);

  function useMyLocation() {
    setSuccess(false);

    if (!currentLocation) {
      setError(
        locationError ??
          "Your current location has not been detected yet."
      );

      return;
    }

    setSelectedLocation(
      currentLocation
    );

    setError(null);
  }

  function handleEvidence(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      setEvidence(null);

      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select an image file."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      setError(
        "Photo must be smaller than 5 MB."
      );

      event.target.value = "";

      return;
    }

    setEvidence(file);

    setError(null);
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    if (!hazardType) {
      setError(
        "Please select a hazard type."
      );

      return;
    }

    if (!severity) {
      setError(
        "Please select the hazard severity."
      );

      return;
    }

    if (
      title.trim().length < 5
    ) {
      setError(
        "Title must contain at least 5 characters."
      );

      return;
    }

    if (
      description.trim()
        .length < 10
    ) {
      setError(
        "Description must contain at least 10 characters."
      );

      return;
    }

    if (!selectedLocation) {
      setError(
        "Please select the hazard location."
      );

      return;
    }

    saveHazardReport({
      type:
        hazardType,

      severity,

      title:
        title.trim(),

      description:
        description.trim(),

      latitude:
        selectedLocation.latitude,

      longitude:
        selectedLocation.longitude,

      evidenceName:
        evidence?.name,
    });

    setHazardType("");
    setSeverity("");
    setTitle("");
    setDescription("");

    setSelectedLocation(
      null
    );

    setEvidence(null);

    setSuccess(true);
  }

  return (
    <div className="report-page">
      <section className="report-header">
        <span className="eyebrow">
          Community Safety Report
        </span>

        <h1>
          Report a Hazard
        </h1>

        <p>
          Help others avoid dangerous
          areas by reporting hazards
          you have observed.
        </p>
      </section>

      <div className="report-warning">
        <AlertTriangle
          size={21}
        />

        <div>
          <strong>
            Safety first
          </strong>

          <span>
            Do not put yourself in
            danger to collect photos
            or information.
          </span>
        </div>
      </div>

      {success && (
        <div className="report-success">
          <CheckCircle2
            size={22}
          />

          <div>
            <strong>
              Report submitted
            </strong>

            <span>
              Your report is pending
              verification before it
              can be treated as
              verified hazard data.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      <form
        className="report-grid"
        onSubmit={
          handleSubmit
        }
      >
        <section className="report-panel">
          <div className="panel-heading">
            <h2>
              Hazard Information
            </h2>

            <p>
              Describe what you
              observed.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label
                htmlFor="hazardType"
              >
                Hazard Type
              </label>

              <select
                id="hazardType"
                value={
                  hazardType
                }
                onChange={(
                  event
                ) =>
                  setHazardType(
                    event.target
                      .value as
                      | HazardType
                      | ""
                  )
                }
              >
                <option value="">
                  Select type
                </option>

                <option value="landslide">
                  Landslide
                </option>

                <option value="flood">
                  Flood
                </option>

                <option value="fire">
                  Fire
                </option>

                <option value="road_blockage">
                  Road Blockage
                </option>

                <option value="earthquake_damage">
                  Earthquake Damage
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div className="form-group">
              <label
                htmlFor="severity"
              >
                Severity
              </label>

              <select
                id="severity"
                value={severity}
                onChange={(
                  event
                ) =>
                  setSeverity(
                    event.target
                      .value as
                      | HazardSeverity
                      | ""
                  )
                }
              >
                <option value="">
                  Select severity
                </option>

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label
              htmlFor="reportTitle"
            >
              Title
            </label>

            <input
              id="reportTitle"
              type="text"
              value={title}
              maxLength={80}
              placeholder="Example: Road blocked by landslide"
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label
                htmlFor="description"
              >
                Description
              </label>

              <span>
                {
                  description.length
                }
                /
                {
                  DESCRIPTION_LIMIT
                }
              </span>
            </div>

            <textarea
              id="description"
              value={
                description
              }
              maxLength={
                DESCRIPTION_LIMIT
              }
              rows={6}
              placeholder="Describe what happened, road condition, nearby landmarks, and anything useful for other people."
              onChange={(
                event
              ) =>
                setDescription(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="evidence"
            >
              Photo Evidence
              <span className="optional">
                Optional
              </span>
            </label>

            <label
              className="file-upload"
              htmlFor="evidence"
            >
              <Upload
                size={21}
              />

              <div>
                <strong>
                  {evidence
                    ? evidence.name
                    : "Choose a photo"}
                </strong>

                <span>
                  JPG, PNG or other
                  image — maximum
                  5 MB
                </span>
              </div>
            </label>

            <input
              id="evidence"
              className="hidden-file-input"
              type="file"
              accept="image/*"
              onChange={
                handleEvidence
              }
            />
          </div>
        </section>

        <section className="report-panel">
          <div className="panel-heading">
            <h2>
              Hazard Location
            </h2>

            <p>
              Use your GPS or click
              the exact location on
              the map.
            </p>
          </div>

          <button
            type="button"
            className="current-location-button"
            onClick={
              useMyLocation
            }
          >
            <Crosshair
              size={18}
            />

            Use My Current Location
          </button>

          <div className="location-map-wrapper">
            <ReportLocationMap
              selectedLocation={
                selectedLocation
              }
              onSelect={
                setSelectedLocation
              }
            />
          </div>

          <div className="location-help">
            <MapPin
              size={18}
            />

            {selectedLocation ? (
              <div>
                <strong>
                  Location selected
                </strong>

                <span>
                  {
                    selectedLocation
                      .latitude
                      .toFixed(6)
                  }
                  ,{" "}
                  {
                    selectedLocation
                      .longitude
                      .toFixed(6)
                  }
                </span>
              </div>
            ) : (
              <div>
                <strong>
                  No location selected
                </strong>

                <span>
                  Click on the map or
                  use your current
                  location.
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-report-button"
          >
            Submit Hazard Report
          </button>

          <p className="verification-note">
            Submitted reports are
            initially marked as
            <strong>
              {" "}
              Pending
            </strong>
            . Verification will be
            handled before the report
            is considered trusted
            hazard information.
          </p>
        </section>
      </form>
    </div>
  );
}