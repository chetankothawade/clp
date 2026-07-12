import express from "express";
import { forgotPassword, login, logout, register, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.put("/auth/reset-password/:token", resetPassword);
router.post("/auth/logout", logout);

export default router;
