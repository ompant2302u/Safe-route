import "dotenv/config";

import bcrypt
  from "bcrypt";

import {
  prisma,
} from "../config/database";

async function main() {
  const name =
    process.env.ADMIN_NAME
      ?.trim();

  const email =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD;

  if (
    !name ||
    !email ||
    !password
  ) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured temporarily in .env."
    );
  }

  if (
    password.length < 8
  ) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 8 characters."
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  const admin =
    await prisma.admin.upsert({
      where: {
        email,
      },

      update: {
        name,
        passwordHash,
      },

      create: {
        name,
        email,
        passwordHash,
      },
    });

  console.log(
    `Admin ready: ${admin.email}`
  );
}

main()
  .catch(
    (error) => {
      console.error(
        error
      );

      process.exitCode =
        1;
    }
  )
  .finally(
    async () => {
      await prisma
        .$disconnect();
    }
  );