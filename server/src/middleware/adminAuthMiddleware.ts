import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import type {
  JwtPayload,
} from "jsonwebtoken";

export type AdminRequest =
  Request & {
    admin?: {
      id: number;
      email: string;
    };
  };

export function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authorization =
    request.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return response
      .status(401)
      .json({
        success: false,

        message:
          "Admin authentication required.",
      });
  }

  const token =
    authorization.slice(7);

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    return response
      .status(500)
      .json({
        success: false,

        message:
          "Authentication configuration error.",
      });
  }

  try {
    const decoded =
      jwt.verify(
        token,
        jwtSecret
      ) as JwtPayload;

    if (
      typeof decoded.adminId !==
        "number" ||
      typeof decoded.email !==
        "string"
    ) {
      return response
        .status(401)
        .json({
          success: false,

          message:
            "Invalid admin token.",
        });
    }

    (
      request as AdminRequest
    ).admin = {
      id:
        decoded.adminId,

      email:
        decoded.email,
    };

    next();
  } catch {
    return response
      .status(401)
      .json({
        success: false,

        message:
          "Invalid or expired admin token.",
      });
  }
}