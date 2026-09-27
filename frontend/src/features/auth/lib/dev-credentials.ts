import { env } from "@/config/env";

import type { LoginInput } from "../schemas/login";

/**
 * The default superuser from DJANGO_SUPERUSER_*, passed in by docker-compose.yml.
 * Always null in production: the prod stack never sets these and the check below is a backstop.
 */
export const devCredentials: LoginInput | null =
  !env.isProduction && env.devLoginUsername && env.devLoginPassword
    ? { username: env.devLoginUsername, password: env.devLoginPassword }
    : null;
