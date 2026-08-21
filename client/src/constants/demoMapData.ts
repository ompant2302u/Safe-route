import type { Hazard } from "../types/hazard";
import type { SafePlace } from "../types/safePlace";

export const demoHazards: Hazard[] = [
  {
    id: 1,

    title: "Demo Landslide Alert",

    type: "landslide",

    severity: "high",

    latitude: 27.7172,
    longitude: 85.324,

    description:
      "Demo hazard used only for development and testing.",

    verified: true,

    confidence: 85,

    isDemo: true,
  },

  {
    id: 2,

    title: "Demo Road Blockage",

    type: "road_blockage",

    severity: "medium",

    latitude: 27.708,
    longitude: 85.326,

    description:
      "Demo road blockage used only for development.",

    verified: false,

    confidence: 60,

    isDemo: true,
  },
];

export const demoSafePlaces: SafePlace[] = [
  {
    id: 1,
    name: "Demo Emergency Shelter",
    type: "shelter",

    latitude: 27.712,
    longitude: 85.318,

    address: "Kathmandu",

    status: "available",

    description:
      "Development-only emergency shelter location.",

    isDemo: true,
  },

  {
    id: 2,
    name: "Demo Hospital",
    type: "hospital",

    latitude: 27.721,
    longitude: 85.32,

    address: "Kathmandu",

    status: "available",

    description:
      "Development-only hospital location.",

    isDemo: true,
  },

  {
    id: 3,
    name: "Demo Police Station",
    type: "police",

    latitude: 27.7065,
    longitude: 85.326,

    address: "Kathmandu",

    status: "available",

    description:
      "Development-only police location.",

    isDemo: true,
  },

  {
    id: 4,
    name: "Demo Open Ground",
    type: "open_ground",

    latitude: 27.7245,
    longitude: 85.333,

    address: "Kathmandu",

    status: "limited",

    description:
      "Development-only open evacuation area.",

    isDemo: true,
  },

  {
    id: 5,
    name: "Demo Health Post",
    type: "health_post",

    latitude: 27.7005,
    longitude: 85.315,

    address: "Kathmandu",

    status: "available",

    description:
      "Development-only health post location.",

    isDemo: true,
  },

  {
    id: 6,
    name: "Demo Fire Station",
    type: "fire_station",

    latitude: 27.716,
    longitude: 85.337,

    address: "Kathmandu",

    status: "unknown",

    description:
      "Development-only fire station location.",

    isDemo: true,
  },
];