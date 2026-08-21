import { z } from "zod";

export const createHazardReportSchema =
  z.object({
    type: z.enum([
      "landslide",
      "flood",
      "fire",
      "road_blockage",
      "earthquake_damage",
      "other",
    ]),

    severity: z.enum([
      "low",
      "medium",
      "high",
      "critical",
    ]),

    title: z
      .string()
      .trim()
      .min(
        5,
        "Title must contain at least 5 characters."
      )
      .max(
        80,
        "Title cannot exceed 80 characters."
      ),

    description: z
      .string()
      .trim()
      .min(
        10,
        "Description must contain at least 10 characters."
      )
      .max(
        300,
        "Description cannot exceed 300 characters."
      ),

    latitude: z
      .number()
      .min(-90)
      .max(90),

    longitude: z
      .number()
      .min(-180)
      .max(180),

    photoUrl: z
      .string()
      .trim()
      .url()
      .optional()
      .nullable(),
  });

export type CreateHazardReportInput =
  z.infer<
    typeof createHazardReportSchema
  >;