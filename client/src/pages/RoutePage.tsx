import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Crosshair,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  useSearchParams,
} from "react-router-dom";

import RouteMap
  from "../components/map/RouteMap";

import RouteCard
  from "../components/route/RouteCard";

import useCurrentLocation
  from "../hooks/useCurrentLocation";

import {
  getActiveHazards,
} from "../services/hazardService";

import {
  getRouteAlternatives,
} from "../services/routeService";

import type {
  Hazard,
} from "../types/hazard";

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


interface PlaceSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}


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


  /* ===================================
     VERIFIED HAZARDS
  =================================== */

  const [
    hazards,
    setHazards,
  ] =
    useState<
      Hazard[]
    >([]);

  const [
    hazardsLoading,
    setHazardsLoading,
  ] =
    useState(true);

  const [
    hazardsError,
    setHazardsError,
  ] =
    useState<
      string | null
    >(null);

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
      } catch (error) {
        if (!cancelled) {
          setHazardsError(
            error instanceof Error
              ? error.message
              : "Unable to load verified hazards."
          );
        }
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


  /* ===================================
     QUERY DESTINATION
  =================================== */

  const latitudeParam =
    searchParams.get(
      "destinationLat"
    );

  const longitudeParam =
    searchParams.get(
      "destinationLng"
    );

  const queryLatitude =
    latitudeParam &&
    latitudeParam.trim() !== ""
      ? Number(
          latitudeParam
        )
      : Number.NaN;

  const queryLongitude =
    longitudeParam &&
    longitudeParam.trim() !== ""
      ? Number(
          longitudeParam
        )
      : Number.NaN;

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


  /* ===================================
     MANUAL DESTINATION
  =================================== */

  const [
    manualDestination,
    setManualDestination,
  ] =
    useState<
      UserLocation | null
    >(null);

  const [
    manualDestinationName,
    setManualDestinationName,
  ] =
    useState<
      string | null
    >(null);

  const destination =
    manualDestination ??
    queryDestination;

  const destinationName =
    manualDestination
      ? manualDestinationName ??
        "Selected map location"
      : searchParams.get(
          "destinationName"
        ) ??
        (queryDestination
          ? "Selected destination"
          : null);


  /* ===================================
     SEARCH
  =================================== */

  const [
    destinationQuery,
    setDestinationQuery,
  ] =
    useState("");

  const [
    placeResults,
    setPlaceResults,
  ] =
    useState<
      PlaceSearchResult[]
    >([]);

  const [
    searchingPlaces,
    setSearchingPlaces,
  ] =
    useState(false);


  /* ===================================
     ROUTES
  =================================== */

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


  function resetRoutes() {
    setRoutes([]);

    setSelectedRouteId(
      null
    );

    setRouteError(null);
  }


  /* ===================================
     MAP DESTINATION
  =================================== */

  function handleDestinationChange(
    nextDestination:
      UserLocation
  ) {
    setSearchParams({});

    setManualDestination(
      nextDestination
    );

    setManualDestinationName(
      "Selected map location"
    );

    setDestinationQuery("");

    setPlaceResults([]);

    resetRoutes();
  }


  /* ===================================
     SEARCH INPUT
  =================================== */

  function handleDestinationQueryChange(
    value: string
  ) {
    setDestinationQuery(
      value
    );

    setPlaceResults([]);

    setRouteError(null);

    if (
      manualDestination ||
      queryDestination
    ) {
      setSearchParams({});

      setManualDestination(
        null
      );

      setManualDestinationName(
        null
      );

      setRoutes([]);

      setSelectedRouteId(
        null
      );
    }
  }


  /* ===================================
     SEARCH NEPAL PLACE
  =================================== */

  async function searchDestination(
    autoSelect:
      boolean = false
  ): Promise<
    UserLocation | null
  > {
    const query =
      destinationQuery.trim();

    if (!query) {
      setRouteError(
        "Enter a destination."
      );

      return null;
    }

    if (
      query.length < 2
    ) {
      setRouteError(
        "Enter at least 2 characters."
      );

      return null;
    }

    try {
      setSearchingPlaces(
        true
      );

      setRouteError(null);

      setPlaceResults([]);

      const params =
        new URLSearchParams({
          q: query,
          format:
            "jsonv2",
          limit:
            "6",
          countrycodes:
            "np",
          addressdetails:
            "1",
          "accept-language":
            "en",
        });

      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to search locations."
        );
      }

      const data =
        (await response.json()) as
          PlaceSearchResult[];

      if (
        data.length === 0
      ) {
        setRouteError(
          "No matching destination found in Nepal."
        );

        return null;
      }

      if (!autoSelect) {
        setPlaceResults(
          data
        );

        return null;
      }

      const bestMatch =
        data[0];

      if (!bestMatch) {
        return null;
      }

      const latitude =
        Number(
          bestMatch.lat
        );

      const longitude =
        Number(
          bestMatch.lon
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        throw new Error(
          "Invalid destination coordinates."
        );
      }

      const nextDestination:
        UserLocation = {
          latitude,
          longitude,
        };

      setSearchParams({});

      setManualDestination(
        nextDestination
      );

      setManualDestinationName(
        bestMatch.display_name
      );

      setDestinationQuery(
        bestMatch.display_name
      );

      setPlaceResults([]);

      return nextDestination;
    } catch (error) {
      setRouteError(
        error instanceof Error
          ? error.message
          : "Unable to search destination."
      );

      return null;
    } finally {
      setSearchingPlaces(
        false
      );
    }
  }


  /* ===================================
     SELECT SEARCH RESULT
  =================================== */

  function selectPlace(
    place:
      PlaceSearchResult
  ) {
    const latitude =
      Number(place.lat);

    const longitude =
      Number(place.lon);

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      setRouteError(
        "Invalid destination."
      );

      return;
    }

    setSearchParams({});

    setManualDestination({
      latitude,
      longitude,
    });

    setManualDestinationName(
      place.display_name
    );

    setDestinationQuery(
      place.display_name
    );

    setPlaceResults([]);

    resetRoutes();
  }


  function clearDestination() {
    setSearchParams({});

    setManualDestination(
      null
    );

    setManualDestinationName(
      null
    );

    setDestinationQuery("");

    setPlaceResults([]);

    resetRoutes();
  }


  /* ===================================
     FIND LOWER-RISK ROUTES
  =================================== */

  async function findRoutes() {
    if (!location) {
      setRouteError(
        locationError ??
          "Current location is not available."
      );

      return;
    }

    if (hazardsLoading) {
      setRouteError(
        "Verified hazards are still loading."
      );

      return;
    }

    if (hazardsError) {
      setRouteError(
        "Hazard information could not be loaded."
      );

      return;
    }

    let targetDestination =
      destination;

    if (
      !targetDestination &&
      destinationQuery.trim()
    ) {
      targetDestination =
        await searchDestination(
          true
        );
    }

    if (
      !targetDestination
    ) {
      setRouteError(
        "Search a destination or select one on the map."
      );

      return;
    }

    setFindingRoutes(
      true
    );

    setRouteError(null);

    setRoutes([]);

    setSelectedRouteId(
      null
    );

    try {
      const alternatives =
        await getRouteAlternatives(
          location,
          targetDestination
        );

      const evaluated =
        evaluateRoutes(
          alternatives,
          hazards
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

      if (
        evaluated.length === 0
      ) {
        setRouteError(
          "No routes were found."
        );
      }
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

      {/* HEADER */}
      <header className="route-top-header">
        <div className="route-brand">
          <div className="route-brand-icon">
            <ShieldCheck
              size={24}
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


      {/* STATUS BANNER */}
      <section className="route-status-banner">
        <div className="route-status-left">
          <div className="route-status-icon">
            <Navigation
              size={21}
            />
          </div>

          <div>
            <h2>
              Plan a lower-risk journey
            </h2>

            <p>
              Routes are compared
              against verified hazard
              information.
            </p>
          </div>
        </div>

        <div className="route-status-badge">
          <ShieldCheck
            size={15}
          />

          {hazardsLoading
            ? "Loading hazards..."
            : `${hazards.length} verified hazard${
                hazards.length === 1
                  ? ""
                  : "s"
              }`}
        </div>
      </section>


      {/* SEARCH CONTROLS */}
      <section className="route-control-panel">

        {/* FROM */}
        <div className="route-control-group">
          <label>
            From
          </label>

          <div className="route-control-item">
            <span className="route-control-icon start">
              <Crosshair
                size={18}
              />
            </span>

            <div>
              <strong>
                {location
                  ? "Your Current Location"
                  : locationLoading
                    ? "Detecting GPS..."
                    : "Location unavailable"}
              </strong>

              <span className="route-location-small">
                {location
                  ? "GPS position detected"
                  : locationError ??
                    "Waiting for location"}
              </span>
            </div>
          </div>
        </div>


        <div className="route-control-divider">
          ⇅
        </div>


        {/* TO */}
        <div className="route-control-group destination-group">
          <label>
            To
          </label>

          <div className="route-control-item">
            <span className="route-control-icon destination">
              <MapPin
                size={18}
              />
            </span>

            <div className="destination-search-area">
              <div className="destination-search-row">

                <input
                  type="text"
                  value={
                    destinationQuery
                  }
                  placeholder={
                    destinationName ??
                    "Search destination..."
                  }
                  autoComplete="off"
                  onChange={(
                    event
                  ) =>
                    handleDestinationQueryChange(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();

                      void findRoutes();
                    }
                  }}
                />

                <button
                  type="button"
                  className="destination-search-button"
                  disabled={
                    searchingPlaces
                  }
                  onClick={() =>
                    void searchDestination(
                      false
                    )
                  }
                  aria-label="Search destination"
                >
                  <Search
                    size={18}
                  />
                </button>

                {(destination ||
                  destinationQuery) && (
                  <button
                    type="button"
                    className="clear-destination"
                    onClick={
                      clearDestination
                    }
                    aria-label="Clear destination"
                  >
                    ×
                  </button>
                )}
              </div>


              {placeResults.length >
                0 && (
                <div className="destination-results">
                  {placeResults.map(
                    (place) => (
                      <button
                        type="button"
                        key={
                          place.place_id
                        }
                        onClick={() =>
                          selectPlace(
                            place
                          )
                        }
                      >
                        <MapPin
                          size={15}
                        />

                        <span>
                          {
                            place.display_name
                          }
                        </span>
                      </button>
                    )
                  )}

                  <div className="search-attribution">
                    Search data ©
                    OpenStreetMap
                    contributors
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* BUTTON */}
        <button
          type="button"
          className="find-route-button"
          disabled={
            findingRoutes ||
            searchingPlaces ||
            hazardsLoading ||
            Boolean(
              hazardsError
            ) ||
            !location ||
            (
              !destination &&
              !destinationQuery.trim()
            )
          }
          onClick={() =>
            void findRoutes()
          }
        >
          <Navigation
            size={18}
          />

          {findingRoutes
            ? "Checking Routes..."
            : searchingPlaces
              ? "Searching..."
              : "Find Lower-Risk Route"}
        </button>
      </section>


      {(routeError ||
        hazardsError) && (
        <div className="route-error">
          <AlertTriangle
            size={18}
          />

          <span>
            {routeError ??
              hazardsError}
          </span>
        </div>
      )}


      {/* SPLIT LAYOUT */}
      <div className="route-main-layout">

        {/* MAP */}
        <section className="route-map-panel">
          <div className="route-panel-heading">
            <div>
              <h2>
                Route Map
              </h2>

              <p>
                Select a destination
                and compare available
                routes.
              </p>
            </div>

            <span className="verified-route-badge">
              Verified hazards
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
                hazards
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
              You
            </span>

            <span>
              <i className="legend-dot destination-dot" />
              Destination
            </span>

            <span>
              <i className="legend-dot hazard-dot" />
              Hazard
            </span>

            <span>
              <i className="legend-line recommended-line" />
              Lower risk
            </span>

            <span>
              <i className="legend-line moderate-line" />
              Moderate
            </span>
          </div>
        </section>


        {/* RESULTS */}
        <section className="route-results-panel">

          <div className="route-panel-heading route-results-heading-visible">
            <div>
              <span className="route-panel-eyebrow">
                Route Analysis
              </span>

              <h2>
                Route Comparison
              </h2>

              <p>
                {routes.length > 0
                  ? `${routes.length} route ${
                      routes.length === 1
                        ? "option"
                        : "options"
                    } analysed`
                  : "Search a destination to compare routes"}
              </p>
            </div>

            <ShieldCheck
              size={22}
            />
          </div>


          {routes.length ===
          0 ? (
            <div className="route-empty-state">
              <RouteIcon
                size={36}
              />

              <strong>
                No routes calculated yet
              </strong>

              <p>
                Search for a
                destination or click
                anywhere on the map.
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


          <div className="route-safety-warning">
            <AlertTriangle
              size={21}
            />

            <div>
              <strong>
                Conditions may change
              </strong>

              <span>
                A lower-risk route is
                not guaranteed to be
                completely safe.
              </span>
            </div>

            {recommended && (
              <button
                type="button"
                className="reroute-button"
                disabled={
                  findingRoutes
                }
                onClick={() =>
                  void findRoutes()
                }
              >
                {findingRoutes
                  ? "Checking..."
                  : "Reroute"}
              </button>
            )}
          </div>


          <div className="route-panel-footer">
            <ShieldCheck
              size={16}
            />

            <span>
              Route recommendations
              use verified hazard
              severity, confidence
              and proximity.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}