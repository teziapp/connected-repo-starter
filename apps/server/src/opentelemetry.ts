import * as tracker from '@middleware.io/node-apm';
tracker.track({
  serviceName: "demo-backend-server",
  accessToken: "your-api-key",
  target: "your-target",
  disabledInstrumentations : "dns,net"
});