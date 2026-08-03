export const getServiceEnv = (serviceName, fallback = {}) => ({
  serviceName,
  ...fallback,
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  port: Number(process.env.PORT || 3000),
});
