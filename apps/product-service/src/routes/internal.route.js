import express from "express";
import db from "../models/index.js";

const router = express.Router();
router.get("/products/:uuid/purchase-details", async (req, res, next) => {
  const requestId = req.get("X-Request-Id") || req.id;
  res.setHeader("X-Request-Id", requestId);
  const sendError = (status, code, message) => res.status(status).json({ success: false, code, message, requestId });
  if (process.env.INTERNAL_SERVICE_KEY && req.get("X-Internal-Service-Key") !== process.env.INTERNAL_SERVICE_KEY) return sendError(401, "INTERNAL_UNAUTHORIZED", "Unauthorized internal request");
  try {
    const product = await db.Product.findOne({ where: { uuid: req.params.uuid, status: "active" }, attributes: ["uuid", "name", "sku", "status", "price", "loyalty_points"] });
    if (!product) return sendError(404, "PRODUCT_UNAVAILABLE", "Product unavailable");
    return res.json({ success: true, data: { product: product.toJSON() }, requestId });
  } catch (error) { return next(error); }
});
export default router;
