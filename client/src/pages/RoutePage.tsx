import {
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


/* ===================================
   SEARCH RESULT TYPE
=================================== */

interface PlaceSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}


/* ===================================
   ROUTE PAGE
=================================== */

export default function RoutePage() {

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  /* =================================
     CURRENT LOCATION
  ================================= */

  const {
    location,
    loading:
      locationLoading,
    error:
      locationError,
  } =
    useCurrentLocation();


  /* =================================
     QUERY PARAM DESTINATION
  ================================= */

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


  /* =================================
     MANUAL DESTINATION
  ================================= */

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


  /* =================================
     DESTINATION SEARCH
  ================================= */

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


  /* =================================
     CURRENT DESTINATION
  ================================= */

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
        (
          queryDestination
            ? "Selected destination"
            : null
        );


  /* =================================
     ROUTE STATES
  ================================= */

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


  /* =================================
     RESET ROUTE RESULTS
  ================================= */

  function resetRoutes() {

    setRoutes([]);

    setSelectedRouteId(
      null
    );

    setRouteError(null);
  }


  /* =================================
     DESTINATION FROM MAP
  ================================= */

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


  /* =================================
     SEARCH INPUT CHANGE
  ================================= */

  function handleDestinationQueryChange(
    value: string
  ) {

    setDestinationQuery(
      value
    );

    setPlaceResults([]);

    setRouteError(null);


    /*
      User is typing a new place.
      Remove previously selected
      destination coordinates.
    */

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


  /* =================================
     SEARCH DESTINATION
  ================================= */

  async function searchDestination(
    autoSelect:
      boolean = false
  ):
    Promise<
      UserLocation | null
    >
  {

    const query =
      destinationQuery.trim();


    if (!query) {

      setPlaceResults([]);

      setRouteError(
        "Enter a destination to search."
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
          q:
            query,

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


      if (
        !response.ok
      ) {

        throw new Error(
          "Unable to search locations."
        );
      }


      const data =
        (
          await response.json()
        ) as
          PlaceSearchResult[];


      if (
        data.length === 0
      ) {

        setRouteError(
          "No matching destination found in Nepal."
        );

        return null;
      }


      /* ===============================
         SEARCH ICON CLICK
         Show dropdown results
      =============================== */

      if (
        !autoSelect
      ) {

        setPlaceResults(
          data
        );

        return null;
      }


      /* ===============================
         FIND SAFE ROUTE CLICK
         Automatically select best match
      =============================== */

      const bestMatch =
        data[0];


      if (!bestMatch) {

        setRouteError(
          "No destination found."
        );

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
        UserLocation =
      {
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


  /* =================================
     SELECT SEARCH RESULT
  ================================= */

  function selectPlace(
    place:
      PlaceSearchResult
  ) {

    const latitude =
      Number(
        place.lat
      );


    const longitude =
      Number(
        place.lon
      );


    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {

      setRouteError(
        "Invalid destination coordinates."
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


    setRoutes([]);


    setSelectedRouteId(
      null
    );


    setRouteError(null);
  }


  /* =================================
     CLEAR DESTINATION
  ================================= */

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


    setRoutes([]);


    setSelectedRouteId(
      null
    );


    setRouteError(null);
  }


  /* =================================
     FIND SAFE ROUTES
  ================================= */

  async function findRoutes() {

    /* ===============================
       CHECK CURRENT LOCATION
    =============================== */

    if (!location) {

      setRouteError(
        locationError ??
          "Your current location has not been detected yet."
      );

      return;
    }


    let targetDestination =
      destination;


    /* ===============================
       USER TYPED A PLACE
       BUT DIDN'T SELECT DROPDOWN
    =============================== */

    if (
      !targetDestination &&
      destinationQuery.trim()
    ) {

      targetDestination =
        await searchDestination(
          true
        );
    }


    /* ===============================
       NO DESTINATION
    =============================== */

    if (
      !targetDestination
    ) {

      setRouteError(
        "Enter a destination, select a search result, or click a location on the map."
      );

      return;
    }


    /* ===============================
       START ROUTING
    =============================== */

    setFindingRoutes(
      true
    );


    setRouteError(null);


    setRoutes([]);


    setSelectedRouteId(
      null
    );


    try {

      /* =============================
         GET ROUTE ALTERNATIVES
      ============================= */

      const alternatives =
        await getRouteAlternatives(
          location,
          targetDestination
        );


      /* =============================
         EVALUATE HAZARD RISK
      ============================= */

      const evaluated =
        evaluateRoutes(
          alternatives,
          demoHazards
        );


      setRoutes(
        evaluated
      );


      /* =============================
         SELECT RECOMMENDED ROUTE
      ============================= */

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
          "No available routes were found."
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


  /* =================================
     RECOMMENDED ROUTE
  ================================= */

  const recommended =
    routes.find(
      (route) =>
        route.isRecommended
    );


  /* ===================================
     PAGE
  =================================== */

  return (

    <div className="route-page">


      {/* =================================
          MOBILE HEADER
      ================================= */}

      <section className="route-page-header">

        <div>

          <span className="eyebrow">
            Hazard-Aware Navigation
          </span>

          <h1>
            Find a Lower-Risk Route
          </h1>

          <p>
            Compare available road
            routes using known hazard
            information.
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


      {/* =================================
          FROM / TO SEARCH
      ================================= */}

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
                  ? "Your location"
                  : "Waiting for GPS"}

              </strong>


              {location && (
                <span className="route-location-small">
                  Current GPS position
                </span>
              )}

            </div>

          </div>

        </div>


        {/* SWAP VISUAL */}

        <div className="route-control-divider">

          <span>
            ⇅
          </span>

        </div>


        {/* TO */}

        <div className="route-control-group destination-group">

          <label>
            To
          </label>


          <div className="route-control-item route-destination-control">


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


                {/* SEARCH BUTTON */}

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


                {/* CLEAR */}

                {destination && (

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


              {/* =================================
                  SEARCH RESULTS
              ================================= */}

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


        {/* =================================
            FIND SAFE ROUTE
        ================================= */}

        <button
          type="button"

          className="find-route-button"

          disabled={
            findingRoutes ||
            searchingPlaces ||
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


          {findingRoutes ||
          searchingPlaces
            ? "Checking Routes..."
            : "Find Safe Route"}

        </button>

      </section>


      {/* =================================
          ERROR MESSAGE
      ================================= */}

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


      {/* =================================
          MAP + ROUTE RESULTS
      ================================= */}

      <div className="route-main-layout">


        {/* =================================
            ROUTE MAP
        ================================= */}

        <section className="route-map-panel">


          <div className="section-heading">

            <div>

              <h2>
                Route Map
              </h2>

              <p>
                Click anywhere on
                the map to select a
                destination.
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


          {/* =================================
              MAP LEGEND
          ================================= */}

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

              Hazard

            </span>


            <span>

              <i className="legend-line recommended-line" />

              Safe

            </span>


            <span>

              <i className="legend-line moderate-line" />

              Moderate

            </span>


            <span>

              <i className="legend-line dangerous-line" />

              Dangerous

            </span>

          </div>

        </section>


        {/* =================================
            ROUTE RESULTS
        ================================= */}

        <section className="route-results-panel">


          <div className="route-results-heading">


            <div>

              <h2>
                Route Comparison
              </h2>


              <p>

                {routes.length > 0
                  ? `${routes.length} route ${
                      routes.length ===
                      1
                        ? "option"
                        : "options"
                    } analysed`

                  : "Search a destination to compare routes"}

              </p>

            </div>


            {recommended && (

              <ShieldCheck
                size={22}
              />

            )}

          </div>


          {/* =================================
              EMPTY ROUTE STATE
          ================================= */}

          {routes.length ===
          0 ? (

            <div className="route-empty-state">


              <RouteIcon
                size={35}
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

            /* =================================
               ROUTE CARDS
            ================================= */

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


          {/* =================================
              HAZARD WARNING
          ================================= */}

          <div className="route-safety-warning">


            <AlertTriangle
              size={23}
            />


            <div>

              <strong>
                Stay aware of changing
                road conditions
              </strong>


              <span>
                Lower-risk does not
                mean completely safe.
                Conditions may change
                quickly.
              </span>

            </div>


            {/* REROUTE */}

            {routes.length > 0 && (

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

        </section>

      </div>


      {/* =================================
          ROUTE METHOD
      ================================= */}

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
            Available routes are
            compared using known
            hazard severity,
            proximity, confidence
            and verification status.
          </p>


          <span>
            Current hazard data is
            development demo data.
          </span>

        </div>

      </section>

    </div>
  );
}