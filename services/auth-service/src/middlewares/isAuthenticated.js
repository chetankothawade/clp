import { verifyToken } from "../../../../src/utils/token.js";
import logger from "../../../../src/utils/logger.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded = verifyToken(token);

    if (!decoded) {
      decoded = verifyToken(token, "admin");
    }

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error({ err: error }, "Auth middleware error");
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export default isAuthenticated;
