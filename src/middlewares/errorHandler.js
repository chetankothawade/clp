import multer from "multer";
import { ValidationError } from "sequelize";

import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload validation failed.",
      requestId: req.id,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      success: false,
      message: req.__("validation.error"),
      errors: err.errors?.map((item) => req.__(item.message)) || [],
      requestId: req.id,
    });
  }

  const isFileTypeValidationError =
    typeof err?.message === "string" &&
    err.message.startsWith("Only ") &&
    err.message.toLowerCase().includes("allowed");

  if (isFileTypeValidationError) {
    return res.status(422).json({
      success: false,
      message: err.message,
      requestId: req.id,
    });
  }

  const statusCode = Number(err?.status || err?.statusCode || 500);
  const exposeMessage = Boolean(err?.exposeMessage) || statusCode < 500;

  logger.error({ err, requestId: req.id }, "Unhandled application error");
  return res.status(statusCode).json({
    success: false,
    error: exposeMessage ? err.message : "Internal server error",
    requestId: req.id,
  });
};

export default errorHandler;
