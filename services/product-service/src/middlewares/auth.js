import jwt from "jsonwebtoken";
import { BaseService } from "../../../src/services/base.service.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export const authorize = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ success: false, message: "Forbidden" });
  next();
};
