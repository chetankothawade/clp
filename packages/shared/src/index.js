export { default } from "./utils/logger.js";
export { default as logger } from "./utils/logger.js";
export { sendResponse, sendListResponse, handleError } from "./utils/response.js";
export { default as asyncHandler } from "./middlewares/asyncHandler.js";
export { default as requestId } from "./middlewares/requestId.js";
export { getServiceEnv } from "./config/env.js";
export { signToken, verifyToken } from "./utils/token.js";

export const sharedHelpers = {
  createRequestId() {
    return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  },
};

export const sharedConstants = {
  DEFAULT_TIMEOUT_MS: 5000,
  DEFAULT_SERVICE_PORT: 3000,
};
