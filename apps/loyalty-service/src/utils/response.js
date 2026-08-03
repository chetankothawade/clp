// utils/response.js

import {
  sendResponse as sharedSendResponse,
  sendListResponse as sharedSendListResponse,
  handleError as sharedHandleError,
} from "@loyalty/shared";

export const sendResponse = (res, status, success, message, data = {}, vars = {}) => {
  return sharedSendResponse(res, status, success, message, data, vars);
};

export const sendListResponse = (res, status, success, message, data = [], pagination = null, vars = {}) => {
  return sharedSendListResponse(res, status, success, message, data, pagination, vars);
};

export const handleError = (req, res, error, options = {}) => {
  return sharedHandleError(req, res, error, options);
};
