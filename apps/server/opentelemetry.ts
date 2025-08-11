import "dotenv/config"

const AUTH_HEADER_KEY = process.env.OTLP_AUTH_HEADER_KEY || "Authorization";
const BASE_URL = process.env.OTLP_BASE_URL

import * as tracker from '@middleware.io/node-apm';
tracker.track({
  serviceName: "{APM-SERVICE-NAME}",
  accessToken: AUTH_HEADER_KEY,
  target: BASE_URL,
  DEBUG: true
});
