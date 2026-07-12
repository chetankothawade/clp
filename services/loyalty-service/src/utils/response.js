// utils/response.js
import logger from "../../../src/utils/logger.js";

export const sendResponse = (res, status, success, message, data = {}, vars = {}) => {
  const req = res.req;
  let localizedMessage = message;

  if (req && typeof message === "string") {
    localizedMessage = req.__(message, vars);
  }

  return res.status(status).json({
    success,
    message: localizedMessage,
    ...(Object.keys(data).length ? { data } : {}),
  });
};

export const sendListResponse = (
  res,
  status,
  success,
  message,
  data = [],
  pagination = null,
  vars = {}
) => {
  const req = res.req;
  let localizedMessage = message;

  if (req && typeof message === "string") {
    localizedMessage = req.__(message, vars);
  }

  return res.status(status).json({
    success,
    message: localizedMessage,
    data,
    ...(pagination ? { pagination } : {}),
  });
};

export const handleError = (
  req,
  res,
  error,
  { logPrefix = "Controller error:", fallbackMessage = "error.internal", validationMapper } = {}
) => {
  if (error?.name === "SequelizeValidationError") {
    const mapValidation = validationMapper || ((err) => req.__(err.message));
    const messages = error.errors.map(mapValidation);
    return sendResponse(res, 422, false, messages);
  }

  if (error?.status && error?.exposeMessage) {
    return sendResponse(res, error.status, false, error.exposeMessage);
  }

  logger.error({ err: error, logPrefix }, "Controller error");
  return sendResponse(res, 500, false, fallbackMessage);
};
