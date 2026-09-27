/** Mirrors the response of apps.core.views.healthcheck. */
export interface Health {
  status: "ok";
  database: boolean;
}
