import type {
  Request,
  Response,
} from "express";

import {
  getActiveHazards,
  getHazardById,
} from "../services/hazardService";

export async function listActiveHazards(
  _request: Request,
  response: Response
) {
  try {
    const hazards =
      await getActiveHazards();

    return response
      .status(200)
      .json({
        success: true,

        data: hazards,
      });
  } catch (error) {
    console.error(
      "Failed to load hazards:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to load hazards.",
      });
  }
}

export async function getHazardDetails(
  request: Request,
  response: Response
) {
  const hazardId =
    Number(
      request.params.id
    );

  if (
    !Number.isInteger(
      hazardId
    ) ||
    hazardId <= 0
  ) {
    return response
      .status(400)
      .json({
        success: false,

        message:
          "Invalid hazard ID.",
      });
  }

  try {
    const hazard =
      await getHazardById(
        hazardId
      );

    if (!hazard) {
      return response
        .status(404)
        .json({
          success: false,

          message:
            "Hazard not found.",
        });
    }

    return response
      .status(200)
      .json({
        success: true,

        data: hazard,
      });
  } catch (error) {
    console.error(
      "Failed to load hazard:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to load hazard.",
      });
  }
}