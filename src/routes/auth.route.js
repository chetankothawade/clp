import express from "express";

import { login, logout, register, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

router.route("/register").post(validateRequest("auth.register"), register);
router.route("/login").post(validateRequest("auth.login"), login);
router.route("/logout").post(logout);
router.route("/forgot-password").post(validateRequest("auth.forgot_password"), forgotPassword);
router.route("/reset-password/:token").put(validateRequest("auth.reset_password"), resetPassword);

export default router;
