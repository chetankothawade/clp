import express from "express";

const router = express.Router();
const loyaltyBaseUrl = process.env.LOYALTY_BASE_URL || "http://127.0.0.1:3002";
const authBaseUrl = process.env.AUTH_BASE_URL || "http://127.0.0.1:3003";
const productBaseUrl = process.env.PRODUCT_BASE_URL || "http://127.0.0.1:3004";

const proxyToService = (baseUrl) => async (req, res) => {
  try {
    const targetUrl = new URL(req.originalUrl, baseUrl);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(", "));
      }
    }

    headers.delete("host");

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = JSON.stringify(req.body ?? {});
    }

    const response = await fetch(targetUrl, init);
    const contentType = response.headers.get("content-type") || "";
    const responseBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    res.status(response.status);
    if (contentType.includes("application/json")) {
      res.json(responseBody);
    } else {
      res.send(responseBody);
    }
  } catch (error) {
    res.status(502).json({
      success: false,
      message: "Unable to reach loyalty service",
      error: error.message,
    });
  }
};

router.get("/loyalty/health", (_req, res) => {
  res.json({ status: "ok", message: "Gateway is routing loyalty traffic" });
});

router.post(["/auth/register", "/api/v1/auth/register"], proxyToService(authBaseUrl));
router.post(["/auth/login", "/api/v1/auth/login"], proxyToService(authBaseUrl));
router.all(["/auth", "/api/v1/auth"], proxyToService(authBaseUrl));

router.use(["/purchases", "/api/v1/purchases"], proxyToService(loyaltyBaseUrl));
router.use(["/rewards", "/api/v1/rewards"], proxyToService(loyaltyBaseUrl));
router.use(["/redemptions", "/api/v1/redemptions"], proxyToService(loyaltyBaseUrl));
router.use(["/dashboard", "/api/v1/dashboard"], proxyToService(loyaltyBaseUrl));

router.use(["/products", "/api/v1/products"], proxyToService(productBaseUrl));

export default router;
