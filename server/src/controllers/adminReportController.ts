import type {
  Request,
  Response,
} from "express";

import type {
  AdminRequest,
} from "../middleware/adminAuthMiddleware";

import {
  AdminReportError,
  getPendingReports,
  rejectReport,
  verifyReport,
} from "../services/adminReportService";

import {
  verifyReportSchema,
} from "../validators/adminValidator";

export async function listPendingReports(
  _request: Request,
  response: Response
) {
  try {
    const reports =
      await getPendingReports();

    return response
      .status(200)
      .json({
        success: true,

        data:
          reports,
      });
  } catch (error) {
    console.error(
      "Failed to load reports:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to load pending reports.",
      });
  }
}

export async function verifyHazardReport(
  request: Request,
  response: Response
) {
  const reportId =
    Number(
      request.params.id
    );

  if (
    !Number.isInteger(
      reportId
    ) ||
    reportId <= 0
  ) {
    return response
      .status(400)
      .json({
        success: false,

        message:
          "Invalid report ID.",
      });
  }

  const validation =
    verifyReportSchema.safeParse(
      request.body
    );

  if (!validation.success) {
    return response
      .status(400)
      .json({
        success: false,

        message:
          "Confidence must be between 0 and 100.",
      });
  }

  const admin =
    (
      request as
        AdminRequest
    ).admin;

  if (!admin) {
    return response
      .status(401)
      .json({
        success: false,

        message:
          "Admin authentication required.",
      });
  }

  try {
    const result =
      await verifyReport(
        reportId,
        admin.id,
        validation.data
          .confidence
      );

    return response
      .status(200)
      .json({
        success: true,

        message:
          "Hazard report verified.",

        data:
          result,
      });
  } catch (error) {
    if (
      error instanceof
      AdminReportError
    ) {
      return response
        .status(
          error.statusCode
        )
        .json({
          success: false,

          message:
            error.message,
        });
    }

    console.error(
      "Report verification failed:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to verify hazard report.",
      });
  }
}

export async function rejectHazardReport(
  request: Request,
  response: Response
) {
  const reportId =
    Number(
      request.params.id
    );

  if (
    !Number.isInteger(
      reportId
    ) ||
    reportId <= 0
  ) {
    return response
      .status(400)
      .json({
        success: false,

        message:
          "Invalid report ID.",
      });
  }

  const admin =
    (
      request as
        AdminRequest
    ).admin;

  if (!admin) {
    return response
      .status(401)
      .json({
        success: false,

        message:
          "Admin authentication required.",
      });
  }

  try {
    const report =
      await rejectReport(
        reportId,
        admin.id
      );

    return response
      .status(200)
      .json({
        success: true,

        message:
          "Hazard report rejected.",

        data:
          report,
      });
  } catch (error) {
    if (
      error instanceof
      AdminReportError
    ) {
      return response
        .status(
          error.statusCode
        )
        .json({
          success: false,

          message:
            error.message,
        });
    }

    console.error(
      "Report rejection failed:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to reject hazard report.",
      });
  }
}