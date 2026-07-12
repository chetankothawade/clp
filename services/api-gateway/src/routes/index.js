import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = express.Router();
const authTarget = process.env.AUTH_SERVICE_URL || "http://127.0.0.1:3003";
const productTarget = process.env.PRODUCT_SERVICE_URL || "http://127.0.0.1:3004";
const loyaltyTarget = process.env.LOYALTY_SERVICE_URL || "http://127.0.0.1:3002";

const authProxy = createProxyMiddleware({
  target: authTarget,
  changeOrigin: true,
  pathRewrite: { "^/api/auth": "" },
});

const productProxy = createProxyMiddleware({
  target: productTarget,
  changeOrigin: true,
  pathRewrite: { "^/api/products": "" },
});

const loyaltyProxy = createProxyMiddleware({
  target: loyaltyTarget,
  changeOrigin: true,
  pathRewrite: { "^/api/loyalty": "" },
});

router.use("/api/auth", authProxy);
router.use("/api/products", productProxy);
router.use("/api/loyalty", loyaltyProxy);

export default router;
