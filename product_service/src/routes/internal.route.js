import express from "express";
import db from "../models/index.js";

const router = express.Router();
router.get("/products/:uuid/purchase-details", async (req, res, next) => {
  if (process.env.INTERNAL_SERVICE_KEY && req.get("X-Internal-Service-Key") !== process.env.INTERNAL_SERVICE_KEY) return res.status(401).json({ success: false, message: "Unauthorized internal request" });
  try {
    const product = await db.Product.findOne({ where: { uuid: req.params.uuid, status: "active" }, attributes: ["uuid", "name", "sku", "price", "loyalty_points"] });
    if (!product) return res.status(404).json({ success: false, message: "Product unavailable" });
    return res.json({ product: product.toJSON() });
  } catch (error) { return next(error); }
});
export default router;
