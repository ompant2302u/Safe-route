import type {
  Request,
  Response,
} from "express";

import {
  createHazardReport,
} from "../services/hazardReportService";

import {
  createHazardReportSchema,
} from "../validators/hazardReportValidator";

export async function submitHazardReport(
  request: Request,
  response: Response
) {
  const validation =
    createHazardReportSchema.safeParse(
      request.body
    );

  if (!validation.success) {
    return response
      .status(400)
      .json({
        success: false,

        message:
          "Invalid hazard report.",

        errors:
          validation.error.flatten()
            .fieldErrors,
      });
  }

  try {
    const report =
      await createHazardReport(
        validation.data
      );

    return response
      .status(201)
      .json({
        success: true,

        message:
          "Hazard report submitted successfully.",

        data: {
          id:
            report.id,

          type:
            report.type,

          severity:
            report.severity,

          title:
            report.title,

          description:
            report.description,

          latitude:
            report.latitude,

          longitude:
            report.longitude,

          status:
            report.status,

          confidence:
            report.confidence,

          createdAt:
            report.createdAt,
        },
      });
  } catch (error) {
    console.error(
      "Failed to create hazard report:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to submit hazard report.",
      });
  }
}