import {
  useMemo,
  useState,
} from "react";

import {
  Building2,
  Crosshair,
  Flame,
  HeartPulse,
  MapPin,
  Navigation,
  Shield,
  TentTree,
  Trees,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import SafePlacesMap
  from "../components/map/SafePlacesMap";

import {
  demoSafePlaces,
} from "../constants/demoMapData";

import useCurrentLocation
  from "../hooks/useCurrentLocation";

import calculateDistance
  from "../utils/calculateDistance";

import type {
  SafePlace,
  SafePlaceType,
} from "../types/safePlace";

type FilterType =
  | "all"
  | SafePlaceType;

function getTypeLabel(
  type: SafePlaceType
): string {
  switch (type) {
    case "hospital":
      return "Hospital";

    case "police":
      return "Police";

    case "shelter":
      return "Shelter";

    case "open_ground":
      return "Open Ground";

    case "health_post":
      return "Health Post";

    case "fire_station":
      return "Fire Station";

    default:
      return "Other";
  }
}

function getPlaceIcon(
  type: SafePlaceType
) {
  switch (type) {
    case "hospital":
      return (
        <HeartPulse
          size={21}
        />
      );

    case "police":
      return (
        <Shield
          size={21}
        />
      );

    case "shelter":
      return (
        <TentTree
          size={21}
        />
      );

    case "open_ground":
      return (
        <Trees
          size={21}
        />
      );

    case "health_post":
      return (
        <Building2
          size={21}
        />
      );

    case "fire_station":
      return (
        <Flame
          size={21}
        />
      );

    default:
      return (
        <MapPin
          size={21}
        />
      );
  }
}

export default function SafePlacesPage() {
  const navigate =
    useNavigate();

  const {
    location,
    loading,
    error,
  } =
    useCurrentLocation();

  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>(
      "all"
    );

  const [
    selectedPlaceId,
    setSelectedPlaceId,
  ] =
    useState<
      number | null
    >(null);

  const places =
    useMemo(() => {
      const filtered =
        filter === "all"
          ? demoSafePlaces
          : demoSafePlaces.filter(
              (place) =>
                place.type ===
                filter
            );

      return filtered
        .map((place) => ({
          ...place,

          distanceKm:
            location
              ? calculateDistance(
                  location,
                  place
                )
              : null,
        }))
        .sort((a, b) => {
          if (
            a.distanceKm ===
              null ||
            b.distanceKm ===
              null
          ) {
            return 0;
          }

          return (
            a.distanceKm -
            b.distanceKm
          );
        });
    }, [
      filter,
      location,
    ]);

  function handleGetRoute(
    place: SafePlace
  ) {
    const params =
      new URLSearchParams({
        destinationName:
          place.name,

        destinationLat:
          String(
            place.latitude
          ),

        destinationLng:
          String(
            place.longitude
          ),
      });

    navigate(
      `/route?${params.toString()}`
    );
  }

  function handleMapSelection(
    place: SafePlace
  ) {
    setSelectedPlaceId(
      place.id
    );

    const element =
      document.getElementById(
        `safe-place-${place.id}`
      );

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <div className="safe-places-page">
      <section className="safe-places-header">
        <div>
          <span className="eyebrow">
            Emergency Locations
          </span>

          <h1>
            Safe Places
          </h1>

          <p>
            Find nearby emergency
            shelters, hospitals,
            police stations and other
            safer locations.
          </p>
        </div>

        <div className="safe-location-status">
          <Crosshair
            size={20}
          />

          <div>
            <strong>
              Distance From You
            </strong>

            {loading && (
              <span>
                Detecting location...
              </span>
            )}

            {!loading &&
              location && (
                <span className="status-success">
                  Location detected
                </span>
              )}

            {!loading &&
              error && (
                <span className="status-error">
                  {error}
                </span>
              )}
          </div>
        </div>
      </section>

      <div className="safe-demo-notice">
        These locations are
        development demo data only.
        Real locations will come from
        the verified SafeRoute
        database.
      </div>

      <section className="safe-filter-section">
        <button
          type="button"
          className={
            filter === "all"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter("all")
          }
        >
          All
        </button>

        <button
          type="button"
          className={
            filter ===
            "hospital"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter(
              "hospital"
            )
          }
        >
          Hospital
        </button>

        <button
          type="button"
          className={
            filter ===
            "shelter"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter(
              "shelter"
            )
          }
        >
          Shelter
        </button>

        <button
          type="button"
          className={
            filter ===
            "police"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter(
              "police"
            )
          }
        >
          Police
        </button>

        <button
          type="button"
          className={
            filter ===
            "health_post"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter(
              "health_post"
            )
          }
        >
          Health Post
        </button>

        <button
          type="button"
          className={
            filter ===
            "open_ground"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter(
              "open_ground"
            )
          }
        >
          Open Ground
        </button>

        <button
          type="button"
          className={
            filter ===
            "fire_station"
              ? "safe-filter active"
              : "safe-filter"
          }
          onClick={() =>
            setFilter(
              "fire_station"
            )
          }
        >
          Fire Station
        </button>
      </section>

      <div className="safe-places-layout">
        <section className="safe-map-panel">
          <div className="section-heading">
            <div>
              <h2>
                Nearby Safe Locations
              </h2>

              <p>
                Select a green marker
                to view its details.
              </p>
            </div>

            <span className="demo-warning">
              Demo data
            </span>
          </div>

          <div className="safe-map-wrapper">
            <SafePlacesMap
              location={
                location
              }
              safePlaces={
                places
              }
              selectedPlaceId={
                selectedPlaceId
              }
              onSelectPlace={
                handleMapSelection
              }
            />
          </div>

          <div className="safe-map-legend">
            <span>
              <i className="legend-dot user-dot" />
              Your location
            </span>

            <span>
              <i className="legend-dot safe-dot" />
              Safe location
            </span>
          </div>
        </section>

        <section className="safe-list-panel">
          <div className="safe-list-heading">
            <div>
              <h2>
                Locations
              </h2>

              <p>
                {places.length}{" "}
                location
                {places.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            {location && (
              <span>
                Nearest first
              </span>
            )}
          </div>

          <div className="safe-place-list">
            {places.map(
              (place) => (
                <article
                  id={`safe-place-${place.id}`}
                  key={
                    place.id
                  }
                  className={
                    selectedPlaceId ===
                    place.id
                      ? "safe-place-card selected"
                      : "safe-place-card"
                  }
                  onClick={() =>
                    setSelectedPlaceId(
                      place.id
                    )
                  }
                >
                  <div className="safe-place-top">
                    <div className="safe-place-icon">
                      {getPlaceIcon(
                        place.type
                      )}
                    </div>

                    <div className="safe-place-main">
                      <div className="safe-place-title-row">
                        <div>
                          <h3>
                            {
                              place.name
                            }
                          </h3>

                          <span className="safe-place-type">
                            {getTypeLabel(
                              place.type
                            )}
                          </span>
                        </div>

                        <span
                          className={`availability-badge availability-${place.status}`}
                        >
                          {
                            place.status
                          }
                        </span>
                      </div>

                      <div className="safe-place-address">
                        <MapPin
                          size={14}
                        />

                        <span>
                          {
                            place.address
                          }
                        </span>
                      </div>

                      {place.description && (
                        <p>
                          {
                            place.description
                          }
                        </p>
                      )}

                      <div className="safe-place-footer">
                        <div>
                          {place.distanceKm !==
                          null ? (
                            <strong>
                              {place.distanceKm <
                              1
                                ? `${Math.round(
                                    place.distanceKm *
                                      1000
                                  )} m away`
                                : `${place.distanceKm.toFixed(
                                    1
                                  )} km away`}
                            </strong>
                          ) : (
                            <span>
                              Distance
                              unavailable
                            </span>
                          )}

                          {place.isDemo && (
                            <span className="demo-label">
                              Demo
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="get-route-button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            handleGetRoute(
                              place
                            );
                          }}
                        >
                          <Navigation
                            size={16}
                          />

                          Get Route
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}