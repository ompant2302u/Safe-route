import type {
  Request,
  Response,
} from "express";

import {
  adminLoginSchema,
} from "../validators/adminValidator";

import {
  loginAdmin,
} from "../services/adminAuthService";

export async function adminLogin(
  request: Request,
  response: Response
) {
  const validation =
    adminLoginSchema.safeParse(
      request.body
    );

  if (!validation.success) {
    return response
      .status(400)
      .json({
        success: false,

        message:
          "Invalid login details.",
      });
  }

  try {
    const result =
      await loginAdmin(
        validation.data
      );

    if (!result) {
      return response
        .status(401)
        .json({
          success: false,

          message:
            "Invalid email or password.",
        });
    }

    return response
      .status(200)
      .json({
        success: true,

        message:
          "Admin login successful.",

        data:
          result,
      });
  } catch (error) {
    console.error(
      "Admin login failed:",
      error
    );

    return response
      .status(500)
      .json({
        success: false,

        message:
          "Unable to login.",
      });
  }
}