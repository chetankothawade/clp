import logger from "../../../src/utils/logger.js";

export const sendResponse = (res, statusCode, success, message, data = {}) => {
  const payload = {
    success,
    message,
    ...data,
  };

  return res.status(statusCode).json(payload);
};

export const handleError = (req, res, error, meta = {}) => {
  const logPrefix = meta.logPrefix || "Unhandled error:";
  logger.error({ err: error, reqId: req?.id }, `${logPrefix} ${error?.message || error}`);

  if (error?.statusCode) {
    return sendResponse(res, error.statusCode, false, error.message, { error: error.message });
  }

  return sendResponse(res, 500, false, "error.internal_server_error", { error: error?.message || "Internal server error" });
};
