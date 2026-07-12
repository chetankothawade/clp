import { sendResponse, handleError } from "../../../../src/utils/response.js";
import { authService } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    return sendResponse(res, 201, true, "auth.register.success", data);
  } catch (error) {
    return handleError(req, res, error, {
      logPrefix: "Register error:",
      fallbackMessage: "auth.register.error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    return sendResponse(res, 200, true, "auth.login.success", data);
  } catch (error) {
    return handleError(req, res, error, {
      logPrefix: "Login error:",
      fallbackMessage: "auth.login.error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body);
    return sendResponse(res, 200, true, "auth.forgot_password.email_sent");
  } catch (error) {
    return handleError(req, res, error, {
      logPrefix: "Forgot password error:",
      fallbackMessage: "auth.forgot_password.error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.params.token, req.body);
    return sendResponse(res, 200, true, "auth.reset_password.success");
  } catch (error) {
    return handleError(req, res, error, {
      logPrefix: "Reset password error:",
      fallbackMessage: "auth.reset_password.error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { role } = authService.logout(req.user);
    if (role === "admin") {
      res.clearCookie("admin_token");
    } else {
      res.clearCookie("user_token");
    }

    return sendResponse(res, 200, true, "auth.logout.success", {
      message: "Token invalidated on client side.",
      role,
    });
  } catch (error) {
    return handleError(req, res, error, {
      logPrefix: "Logout error:",
      fallbackMessage: "auth.logout.error",
    });
  }
};
