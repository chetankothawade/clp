// utils/response.js

import {
  sendResponse as sharedSendResponse,
  sendListResponse as sharedSendListResponse,
  handleError as sharedHandleError,
} from "@loyalty/shared";

/**
 * Standardized API Response Utility with i18n support
 * @param {object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {boolean} success - Success flag
 * @param {string} message - Response message key
 * @param {object} [data={}] - Additional response data
 * @param {object} [vars={}] - Variables for message interpolation
 */
export const sendResponse = (res, status, success, message, data = {}, vars = {}) => {
  return sharedSendResponse(res, status, success, message, data, vars);
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
  return sharedSendListResponse(res, status, success, message, data, pagination, vars);
};

/**
 * Common controller error handler
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {Error|object} error - Thrown error
 * @param {object} [options]
 * @param {string} [options.logPrefix]
 * @param {string} [options.fallbackMessage]
 * @param {Function} [options.validationMapper]
 */
export const handleError = (req, res, error, options = {}) => {
  return sharedHandleError(req, res, error, options);
};
