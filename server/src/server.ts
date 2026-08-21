import "dotenv/config";

import app from "./app";
import { prisma } from "./config/database";

const port =
  Number(
    process.env.PORT
  ) || 5000;

const server =
  app.listen(
    port,
    () => {
      console.log(
        `SafeRoute Nepal API running on http://localhost:${port}`
      );
    }
  );

async function shutdown(
  signal: string
) {
  console.log(
    `\n${signal} received. Shutting down...`
  );

  server.close(
    async () => {
      await prisma.$disconnect();

      console.log(
        "Server stopped."
      );

      process.exit(0);
    }
  );
}

process.on(
  "SIGINT",
  () =>
    void shutdown(
      "SIGINT"
    )
);

process.on(
  "SIGTERM",
  () =>
    void shutdown(
      "SIGTERM"
    )
);