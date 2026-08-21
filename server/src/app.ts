import cors from "cors";
import express from "express";

import { prisma } from "./config/database";

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ??
      "http://localhost:5173",
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.get(
  "/api/health",
  async (_request, response) => {
    try {
      await prisma.$queryRaw`
        SELECT 1
      `;

      response.status(200).json({
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

      response.status(503).json({
        success: false,

        message:
          "SafeRoute Nepal API is running",

        database:
          "disconnected",
      });
    }
  }
);

app.use(
  (
    _request,
    response
  ) => {
    response.status(404).json({
      success: false,

      message:
        "API endpoint not found",
    });
  }
);

export default app;