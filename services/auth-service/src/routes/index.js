import express from "express";

const router = express.Router();

router.post("/auth/register", (_req, res) => {
  res.json({ success: true, message: "Auth service placeholder", service: "auth-service" });
});

router.post("/auth/login", (_req, res) => {
  res.json({ success: true, message: "Auth service placeholder", service: "auth-service" });
});

router.get("/auth/profile", (_req, res) => {
  res.json({ success: true, message: "Auth service placeholder", service: "auth-service" });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Auth service placeholder", service: "auth-service" });
});

export default router;
