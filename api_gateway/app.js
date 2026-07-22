import crypto from "crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const app = express();
const timeoutMs = Number.parseInt(process.env.DOWNSTREAM_TIMEOUT_MS, 10) || 5000;
const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://127.0.0.1:8001",
  product: process.env.PRODUCT_SERVICE_URL || "http://127.0.0.1:8002",
  loyalty: process.env.LOYALTY_SERVICE_URL || "http://127.0.0.1:8003",
  admin: process.env.ADMIN_SERVICE_URL || "http://127.0.0.1:8004",
};
const publicPaths = new Set(["/api/v1/register", "/api/v1/login", "/api/v1/forgot-password"]);

app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  req.requestId = req.get("X-Request-Id") || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

function identity(req, res, next) {
  if (req.method === "OPTIONS" || publicPaths.has(req.path) || req.path.startsWith("/api/v1/reset-password/")) return next();
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ success: false, message: "Authorization required", requestId: req.requestId });
  try {
    req.identity = jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_PRIVATE_KEY || process.env.SECRET_KEY, {
      algorithms: [process.env.JWT_ALGORITHM || "HS256"], issuer: "auth-service", audience: "clp-api",
    });
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token", requestId: req.requestId });
  }
}

function proxy(service) {
  return async (req, res) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const target = new URL(req.originalUrl, services[service]);
    const headers = { "X-Request-Id": req.requestId };
    if (req.get("content-type")) headers["content-type"] = req.get("content-type");
    if (req.get("authorization")) headers.authorization = req.get("authorization");
    if (req.get("idempotency-key")) headers["idempotency-key"] = req.get("idempotency-key");
    if (req.identity) {
      headers["X-User-Id"] = req.identity.sub;
      headers["X-User-Role"] = req.identity.role;
      headers["X-User-Permissions"] = JSON.stringify(req.identity.permissions || []);
    }
    try {
      const response = await fetch(target, { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body), signal: controller.signal });
      res.status(response.status);
      for (const [name, value] of response.headers) if (["content-type", "set-cookie"].includes(name)) res.setHeader(name, value);
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      res.status(error.name === "AbortError" ? 504 : 502).json({ success: false, message: "Downstream service unavailable", requestId: req.requestId });
    } finally { clearTimeout(timer); }
  };
}

app.get("/health", (req, res) => res.json({ status: "ok", requestId: req.requestId }));
app.get("/ready", (req, res) => res.json({ status: "ready", requestId: req.requestId }));
app.use("/api/v1", identity);
app.use(["/api/v1/register", "/api/v1/login", "/api/v1/logout", "/api/v1/forgot-password", "/api/v1/reset-password", "/api/v1/user", "/api/v1/access", "/api/v1/module", "/api/v1/role-modules", "/api/v1/user-permissions"], proxy("auth"));
// Phase 3: Product Service owns categories and products.
app.use(["/api/v1/products", "/api/v1/category"], proxy("product"));
// Phase 4: Loyalty Service owns loyalty transactions and point balances.
app.use(["/api/v1/purchases", "/api/v1/rewards", "/api/v1/redemptions", "/api/v1/dashboard"], proxy("loyalty"));
app.use(["/api/v1/cms", "/api/v1/editor"], proxy("admin"));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found", requestId: req.requestId }));
export default app;
