import { z } from "zod";

export const adminLoginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email()
      .transform(
        (value) =>
          value.toLowerCase()
      ),

    password: z
      .string()
      .min(8)
      .max(128),
  });

export const verifyReportSchema =
  z.object({
    confidence: z
      .number()
      .int()
      .min(0)
      .max(100),
  });

export type AdminLoginInput =
  z.infer<
    typeof adminLoginSchema
  >;