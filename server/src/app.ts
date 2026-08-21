import cors from "cors";
import express from "express";

import { prisma }
  from "./config/database";

import hazardReportRoutes
  from "./routes/hazardReportRoutes";

import adminAuthRoutes
  from "./routes/adminAuthRoutes";

import adminReportRoutes
  from "./routes/adminReportRoutes";

import hazardRoutes
  from "./routes/hazardRoutes";

const app =
  express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(
  (origin): origin is string =>
    Boolean(origin)
);

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      if (
        !origin ||
        allowedOrigins.includes(
          origin
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }

      callback(
        new Error(
          "Origin not allowed by CORS."
        )
      );
    },
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

/* =========================
   HEALTH
========================= */

app.get(
  "/api/health",
  async (
    _request,
    response
  ) => {
    try {
      await prisma.$queryRaw`
        SELECT 1
      `;

      response
        .status(200)
        .json({
          success: true,

          message:
            "SafeRoute Nepal API is running",

          database:
            "connected",
        });
    } catch (error) {
      console.error(
        "Health check failed:",
        error
      );

      response
        .status(503)
        .json({
          success: false,

          message:
            "SafeRoute Nepal API is running",

          database:
            "disconnected",
        });
    }
  }
);

/* =========================
   API ROUTES
========================= */

app.use(
  "/api/reports",
  hazardReportRoutes
);

app.use(
  "/api/hazards",
  hazardRoutes
);

app.use(
  "/api/admin",
  adminAuthRoutes
);

app.use(
  "/api/admin/reports",
  adminReportRoutes
);

/* =========================
   404
========================= */

app.use(
  (
    _request,
    response
  ) => {
    response
      .status(404)
      .json({
        success: false,

        message:
          "API endpoint not found",
      });
  }
);

export default app;