import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma }
  from "../config/database";

import type {
  AdminLoginInput,
} from "../validators/adminValidator";

export async function loginAdmin(
  input: AdminLoginInput
) {
  const admin =
    await prisma.admin.findUnique({
      where: {
        email:
          input.email,
      },
    });

  if (!admin) {
    return null;
  }

  const validPassword =
    await bcrypt.compare(
      input.password,
      admin.passwordHash
    );

  if (!validPassword) {
    return null;
  }

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  const token =
    jwt.sign(
      {
        adminId:
          admin.id,

        email:
          admin.email,
      },
      jwtSecret,
      {
        expiresIn: "8h",
      }
    );

  return {
    token,

    admin: {
      id:
        admin.id,

      name:
        admin.name,

      email:
        admin.email,
    },
  };
}