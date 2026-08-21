import {
  useState,
} from "react";

import {
  AlertTriangle,
  Crosshair,
  MapPin,
  Navigation,
  Route as RouteIcon,
  ShieldCheck,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import RouteMap
  from "../components/map/RouteMap";

import RouteCard
  from "../components/route/RouteCard";

import {
  demoHazards,
} from "../constants/demoMapData";

import useCurrentLocation
  from "../hooks/useCurrentLocation";

import {
  getRouteAlternatives,
} from "../services/routeService";

import type {
  UserLocation,
} from "../types/location";

import type {
  RouteOption,
} from "../types/route";

import {
  evaluateRoutes,
} from "../utils/routeRisk";

import "./RoutePage.css";

export default function RoutePage() {
  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();

  const {
    location,
    loading:
      locationLoading,
    error:
      locationError,
  } =
    useCurrentLocation();

  const queryLatitude =
    Number(
      searchParams.get(
        "destinationLat"
      )
    );

  const queryLongitude =
    Number(
      searchParams.get(
        "destinationLng"
      )
    );

  const queryDestination:
    UserLocation | null =
    Number.isFinite(
      queryLatitude
    ) &&
    Number.isFinite(
      queryLongitude
    )
      ? {
          latitude:
            queryLatitude,

          longitude:
            queryLongitude,
        }
      : null;

  const [
    manualDestination,
    setManualDestination,
  ] =
    useState<
      UserLocation | null
    >(null);

  const destination =
    manualDestination ??
    queryDestination;

  const destinationName =
    manualDestination
      ? "Selected map location"
      : searchParams.get(
          "destinationName"
        ) ??
        (queryDestination
          ? "Selected destination"
          : null);

  const [
    routes,
    setRoutes,
  ] =
    useState<
      RouteOption[]
    >([]);

  const [
    selectedRouteId,
    setSelectedRouteId,
  ] =
    useState<
      string | null
    >(null);

  const [
    findingRoutes,
    setFindingRoutes,
  ] =
    useState(false);

  const [
    routeError,
    setRouteError,
  ] =
    useState<
      string | null
    >(null);

  function handleDestinationChange(
    nextDestination:
      UserLocation
  ) {
    setSearchParams({});

    setManualDestination(
      nextDestination
    );

    setRoutes([]);

    setSelectedRouteId(
      null
    );

    setRouteError(null);
  }

  function clearDestination() {
    setSearchParams({});

    setManualDestination(
      null
    );

    setRoutes([]);

    setSelectedRouteId(
      null
    );

    setRouteError(null);
  }

  async function findRoutes() {
    if (!location) {
      setRouteError(
        locationError ??
          "Your current location has not been detected yet."
      );

      return;
    }

    if (!destination) {
      setRouteError(
        "Select a destination by clicking on the map or choosing Get Route from Safe Places."
      );

      return;
    }

    setFindingRoutes(true);

    setRouteError(null);

    setRoutes([]);

    setSelectedRouteId(
      null
    );

    try {
      const alternatives =
        await getRouteAlternatives(
          location,
          destination
        );

      const evaluated =
        evaluateRoutes(
          alternatives,
          demoHazards
        );

      setRoutes(
        evaluated
      );

      const recommended =
        evaluated.find(
          (route) =>
            route.isRecommended
        );

      setSelectedRouteId(
        recommended?.id ??
          evaluated[0]?.id ??
          null
      );
    } catch (error) {
      setRouteError(
        error instanceof Error
          ? error.message
          : "Unable to calculate routes."
      );
    } finally {
      setFindingRoutes(
        false
      );
    }
  }

  const recommended =
    routes.find(
      (route) =>
        route.isRecommended
    );

  return (
    <div className="route-page">
      <section className="route-page-header">
        <div>
          <span className="eyebrow">
            Hazard-Aware Navigation
          </span>

          <h1>
            Find a Lower-Risk
            Route
          </h1>

          <p>
            Compare available
            road routes using known
            hazard severity,
            confidence and
            proximity.
          </p>
        </div>

        <div className="route-location-status">
          <Crosshair
            size={20}
          />

          <div>
            <strong>
              Starting Location
            </strong>

            {locationLoading && (
              <span>
                Detecting GPS...
              </span>
            )}

            {!locationLoading &&
              location && (
                <span className="status-success">
                  Current location
                  detected
                </span>
              )}

            {!locationLoading &&
              locationError && (
                <span className="status-error">
                  {
                    locationError
                  }
                </span>
              )}
          </div>
        </div>
      </section>

      <div className="route-safety-warning">
        <AlertTriangle
          size={20}
        />

        <div>
          <strong>
            Lower-risk does not
            mean completely safe.
          </strong>

          <span>
            Conditions can change
            quickly. Always follow
            official emergency
            instructions and
            visible road
            conditions.
          </span>
        </div>
      </div>

      <section className="route-control-panel">
        <div className="route-control-item">
          <span className="route-control-icon start">
            <Crosshair
              size={18}
            />
          </span>

          <div>
            <label>
              Starting point
            </label>

            <strong>
              {location
                ? "Your current location"
                : "Waiting for GPS"}
            </strong>
          </div>
        </div>

        <div className="route-control-divider" />

        <div className="route-control-item">
          <span className="route-control-icon destination">
            <MapPin
              size={18}
            />
          </span>

          <div>
            <label>
              Destination
            </label>

            <strong>
              {destinationName ??
                "Click the map to choose"}
            </strong>

            {destination && (
              <span className="route-coordinate">
                {
                  destination.latitude.toFixed(
                    5
                  )
                }
                ,{" "}
                {
                  destination.longitude.toFixed(
                    5
                  )
                }
              </span>
            )}
          </div>

          {destination && (
            <button
              type="button"
              className="clear-destination"
              onClick={
                clearDestination
              }
            >
              Change
            </button>
          )}
        </div>

        <button
          type="button"
          className="find-route-button"
          disabled={
            findingRoutes ||
            !location ||
            !destination
          }
          onClick={
            findRoutes
          }
        >
          <Navigation
            size={18}
          />

          {findingRoutes
            ? "Checking Routes..."
            : "Find Lower-Risk Route"}
        </button>
      </section>

      {routeError && (
        <div className="route-error">
          <AlertTriangle
            size={18}
          />

          <span>
            {routeError}
          </span>
        </div>
      )}

      <div className="route-main-layout">
        <section className="route-map-panel">
          <div className="section-heading">
            <div>
              <h2>
                Route Map
              </h2>

              <p>
                Click anywhere on
                the map to select
                your destination.
              </p>
            </div>

            <span className="demo-warning">
              Demo hazards
            </span>
          </div>

          <div className="route-map-wrapper">
            <RouteMap
              start={
                location
              }
              destination={
                destination
              }
              hazards={
                demoHazards
              }
              routes={
                routes
              }
              selectedRouteId={
                selectedRouteId
              }
              onDestinationChange={
                handleDestinationChange
              }
              onSelectRoute={
                setSelectedRouteId
              }
            />
          </div>

          <div className="route-map-legend">
            <span>
              <i className="legend-dot user-dot" />
              Your location
            </span>

            <span>
              <i className="legend-dot destination-dot" />
              Destination
            </span>

            <span>
              <i className="legend-dot hazard-dot" />
              Known hazard
            </span>

            <span>
              <i className="legend-line recommended-line" />
              Lower-risk route
            </span>

            <span>
              <i className="legend-line alternative-line" />
              Alternative
            </span>
          </div>
        </section>

        <section className="route-results-panel">
          <div className="route-results-heading">
            <div>
              <h2>
                Route Comparison
              </h2>

              <p>
                {routes.length >
                0
                  ? `${routes.length} route ${
                      routes.length ===
                      1
                        ? "option"
                        : "options"
                    } analysed`
                  : "Choose a destination to compare routes"}
              </p>
            </div>

            {recommended && (
              <ShieldCheck
                size={22}
              />
            )}
          </div>

          {routes.length ===
          0 ? (
            <div className="route-empty-state">
              <RouteIcon
                size={35}
              />

              <strong>
                No routes
                calculated yet
              </strong>

              <p>
                Select a
                destination and
                press Find
                Lower-Risk Route.
              </p>
            </div>
          ) : (
            <div className="route-results-list">
              {routes.map(
                (
                  route,
                  index
                ) => (
                  <RouteCard
                    key={
                      route.id
                    }
                    route={
                      route
                    }
                    index={
                      index
                    }
                    selected={
                      selectedRouteId ===
                      route.id
                    }
                    onSelect={() =>
                      setSelectedRouteId(
                        route.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      <section className="route-method-note">
        <ShieldCheck
          size={20}
        />

        <div>
          <strong>
            How the recommendation
            works
          </strong>

          <p>
            Each available route
            receives an estimated
            risk score based on
            known hazard severity,
            distance from the
            route, report
            confidence and
            verification status.
            The route with the
            lowest calculated
            exposure is
            recommended.
          </p>

          <span>
            Current hazard data is
            development demo data.
            Verified database
            reports will replace it
            when the backend is
            connected.
          </span>
        </div>
      </section>
    </div>
  );
}