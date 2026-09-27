import { z } from "zod";

// Next.js inlines NEXT_PUBLIC_* at build time only when they're referenced literally,
// so each variable is listed by name here instead of reading process.env dynamically.
const schema = z.object({
  apiUrl: z.string().min(1).default("/api/v1"),
  devLoginUsername: z.string().min(1).optional(),
  devLoginPassword: z.string().min(1).optional(),
  isProduction: z.boolean(),
});

export const env = schema.parse({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || undefined,
  devLoginUsername: process.env.NEXT_PUBLIC_DEV_LOGIN_USERNAME || undefined,
  devLoginPassword: process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || undefined,
  isProduction: process.env.NODE_ENV === "production",
});
