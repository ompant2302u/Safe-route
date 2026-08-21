import {
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  MapPin,
  PhoneCall,
  Navigation,
  Building2,
  Shield,
  Flame,
  Home,
  CheckCircle2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import LiveMap
  from "../components/map/LiveMap";

import useCurrentLocation
  from "../hooks/useCurrentLocation";

import {
  demoSafePlaces,
} from "../constants/demoMapData";

import {
  getActiveHazards,
} from "../services/hazardService";

import type {
  Hazard,
} from "../types/hazard";

import "./SafePlacesPage.css";

type CategoryFilter =
  | "all"
  | "hospital"
  | "police"
  | "fire"
  | "shelter";

type SafeLocationItem = {
  id: number;
  name: string;
  category: string;
  type:
    | "hospital"
    | "police"
    | "fire"
    | "shelter";

  time: string;
  distance: string;

  latitude: number;
  longitude: number;

  phone: string;
};

const safeLocationsList:
  SafeLocationItem[] = [
    {
      id: 1,
      name:
        "Civil Service Hospital",
      category:
        "Hospital",
      type:
        "hospital",
      time:
        "12 min",
      distance:
        "3.2 km",
      latitude:
        27.6879,
      longitude:
        85.3446,
      phone:
        "01-4793000",
    },

    {
      id: 2,
      name:
        "Kathmandu Police Station",
      category:
        "Police",
      type:
        "police",
      time:
        "14 min",
      distance:
        "4.1 km",
      latitude:
        27.7047,
      longitude:
        85.3075,
      phone:
        "100",
    },

    {
      id: 3,
      name:
        "Kathmandu Fire Station",
      category:
        "Fire Station",
      type:
        "fire",
      time:
        "14 min",
      distance:
        "4.3 km",
      latitude:
        27.7063,
      longitude:
        85.3142,
      phone:
        "101",
    },

    {
      id: 4,
      name:
        "Bhaktapur Shelter",
      category:
        "Shelter",
      type:
        "shelter",
      time:
        "16 min",
      distance:
        "4.6 km",
      latitude:
        27.671,
      longitude:
        85.4298,
      phone:
        "100",
    },
  ];

function getPlaceIcon(
  type:
    SafeLocationItem["type"]
) {
  switch (type) {
    case "hospital":
      return (
        <Building2
          size={20}
          className="text-success"
        />
      );

    case "police":
      return (
        <Shield
          size={20}
          className="text-primary"
        />
      );

    case "fire":
      return (
        <Flame
          size={20}
          className="text-danger"
        />
      );

    case "shelter":
      return (
        <Home
          size={20}
          className="text-warning"
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
    hazards,
    setHazards,
  ] =
    useState<
      Hazard[]
    >([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<
      CategoryFilter
    >("all");

  useEffect(() => {
    let cancelled =
      false;

    async function loadHazards() {
      try {
        const data =
          await getActiveHazards();

        if (!cancelled) {
          setHazards(data);
        }
      } catch (loadError) {
        console.error(
          "Unable to load hazards:",
          loadError
        );
      }
    }

    void loadHazards();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlaces =
    selectedCategory ===
    "all"
      ? safeLocationsList
      : safeLocationsList.filter(
          (item) =>
            item.type ===
            selectedCategory
        );

  function handleRoute(
    place:
      SafeLocationItem
  ) {
    navigate(
      `/route?destinationLat=${place.latitude}&destinationLng=${place.longitude}&destinationName=${encodeURIComponent(
        place.name
      )}`
    );
  }

  function handleCall(
    phone: string
  ) {
    window.location.href =
      `tel:${phone}`;
  }

  return (
    <div className="safe-places-page">
      {/* HEADER */}
      <header className="app-header">
        <div className="brand-logo">
          <div className="logo-icon-wrapper">
            <ShieldCheck
              size={24}
              className="text-success"
            />
          </div>

          <div>
            <h1>
              SafeRoute Nepal
            </h1>

            <p>
              Safer roads.
              Stronger communities.
            </p>
          </div>
        </div>
      </header>

      {/* EMERGENCY BANNER */}
      <section className="emergency-banner">
        <div className="emergency-left">
          <div className="emergency-icon">
            <PhoneCall
              size={20}
            />
          </div>

          <div>
            <h2>
              In immediate danger?
            </h2>

            <p>
              Call 100 and share
              your location.
            </p>
          </div>
        </div>

        <button
          className="btn-sos"
          type="button"
          onClick={() =>
            handleCall("100")
          }
        >
          <PhoneCall
            size={16}
          />

          SOS
        </button>
      </section>

      {/* MAIN SPLIT */}
      <div className="split-content-grid">
        {/* MAP */}
        <section className="map-section-split">
          <div className="safe-map-heading">
            <div>
              <h2>
                Nearby Safe Places
              </h2>

              <p>
                Emergency locations
                and verified hazards
                around you.
              </p>
            </div>

            <span className="safe-map-badge">
              {
                demoSafePlaces.length
              }{" "}
              locations
            </span>
          </div>

          <div className="map-wrapper-split">
            <LiveMap
              location={
                location
              }
              hazards={
                hazards
              }
              safePlaces={
                demoSafePlaces
              }
            />
          </div>

          <div className="map-legend">
            <span>
              <i className="legend-dot user-dot" />

              {loading
                ? "Detecting..."
                : error
                  ? "Unavailable"
                  : "You"}
            </span>

            <span>
              <i className="legend-dot safe-dot" />

              Safe place
            </span>

            <span>
              <i className="legend-dot hazard-dot" />

              Verified hazard
            </span>
          </div>
        </section>

        {/* SIDE PANEL */}
        <section className="safe-places-panel">
          <div className="safe-panel-heading">
            <div>
              <span className="safe-panel-eyebrow">
                Emergency Support
              </span>

              <h2>
                Safe Locations
              </h2>
            </div>

            <ShieldCheck
              size={22}
            />
          </div>

          {/* FILTERS */}
          <div className="category-filters">
            <button
              className={`filter-btn ${
                selectedCategory ===
                "all"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  "all"
                )
              }
              type="button"
            >
              ✓ All
            </button>

            <button
              className={`filter-btn ${
                selectedCategory ===
                "hospital"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  "hospital"
                )
              }
              type="button"
            >
              🏥 Hospital
            </button>

            <button
              className={`filter-btn ${
                selectedCategory ===
                "police"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  "police"
                )
              }
              type="button"
            >
              🛡 Police
            </button>

            <button
              className={`filter-btn ${
                selectedCategory ===
                "fire"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  "fire"
                )
              }
              type="button"
            >
              🔥 Fire
            </button>

            <button
              className={`filter-btn ${
                selectedCategory ===
                "shelter"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  "shelter"
                )
              }
              type="button"
            >
              🏠 Shelter
            </button>
          </div>

          {/* PLACES */}
          <div className="places-list">
            {filteredPlaces.map(
              (
                place,
                index
              ) => (
                <div
                  key={
                    place.id
                  }
                  className="place-card"
                >
                  <div className="place-card-main">
                    <div className="place-card-left">
                      <span className="place-index-number">
                        {index +
                          1}
                      </span>

                      <div className="place-type-icon">
                        {getPlaceIcon(
                          place.type
                        )}
                      </div>

                      <div className="place-info">
                        <h3>
                          {
                            place.name
                          }
                        </h3>

                        <p>
                          {
                            place.category
                          }
                        </p>
                      </div>
                    </div>

                    <div className="place-card-middle">
                      <span>
                        <Navigation
                          size={12}
                        />

                        {
                          place.time
                        }
                      </span>

                      <span>
                        <MapPin
                          size={12}
                        />

                        {
                          place.distance
                        }
                      </span>
                    </div>
                  </div>

                  <div className="place-card-actions">
                    <button
                      className="btn-route"
                      type="button"
                      onClick={() =>
                        handleRoute(
                          place
                        )
                      }
                    >
                      <Navigation
                        size={14}
                      />

                      Route
                    </button>

                    <button
                      className="btn-call"
                      type="button"
                      onClick={() =>
                        handleCall(
                          place.phone
                        )
                      }
                    >
                      <PhoneCall
                        size={14}
                      />

                      Call
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="panel-footer-note">
            <CheckCircle2
              size={16}
              className="text-success"
            />

            <span>
              Route recommendations
              consider verified
              hazard zones.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}