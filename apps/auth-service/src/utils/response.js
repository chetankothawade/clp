// utils/response.js

// /**
//  * Standardized API Response Utility
//  * @param {object} res - Express response object
//  * @param {number} status - HTTP status code
//  * @param {boolean} success - Success flag
//  * @param {string} message - Response message
//  * @param {object} [data={}] - Additional response data
//  */
// export const sendResponse = (res, status, success, message, data = {}) => {
//   return res.status(status).json({
//     success,
//     message,
//     ...data,
//   });
// };

/**
 * Standardized API Response Utility with i18n support
 * @param {object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {boolean} success - Success flag
 * @param {string} message - Response message key
 * @param {object} [data={}] - Additional response data
 * @param {object} [vars={}] - Variables for message interpolation
 */
import { sendResponse as sharedSendResponse, sendListResponse as sharedSendListResponse, handleError as sharedHandleError } from "@loyalty/shared";

export const sendResponse = (res, status, success, message, data = {}, vars = {}) => {
  return sharedSendResponse(res, status, success, message, data, vars);
};

export const sendListResponse = (res, status, success, message, data = [], pagination = null, vars = {}) => {
  return sharedSendListResponse(res, status, success, message, data, pagination, vars);
};

export const handleError = (req, res, error, options = {}) => {
  return sharedHandleError(req, res, error, options);
};
