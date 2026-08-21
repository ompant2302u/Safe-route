import { useEffect, useState } from "react";

import type { UserLocation } from "../types/location";

type LocationState = {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
};

function isGeolocationSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "geolocation" in navigator
  );
}

export default function useCurrentLocation(): LocationState {
  const supported = isGeolocationSupported();

  const [location, setLocation] =
    useState<UserLocation | null>(null);

  const [loading, setLoading] =
    useState<boolean>(supported);

  const [error, setError] =
    useState<string | null>(
      supported
        ? null
        : "Location services are not supported by this browser."
    );

  useEffect(() => {
    if (!supported) {
      return;
    }

    let active = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) {
          return;
        }

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setError(null);
        setLoading(false);
      },

      (locationError) => {
        if (!active) {
          return;
        }

        switch (locationError.code) {
          case locationError.PERMISSION_DENIED:
            setError(
              "Location permission was denied."
            );
            break;

          case locationError.POSITION_UNAVAILABLE:
            setError(
              "Your location is currently unavailable."
            );
            break;

          case locationError.TIMEOUT:
            setError(
              "Location request timed out."
            );
            break;

          default:
            setError(
              "Unable to determine your location."
            );
        }

        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => {
      active = false;
    };
  }, [supported]);

  return {
    location,
    loading,
    error,
  };
}