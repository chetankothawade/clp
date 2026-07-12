import { purchaseService } from "../services/purchase.service.js";
import { rewardService } from "../services/reward.service.js";
import { redemptionService } from "../services/redemption.service.js";
import { dashboardService } from "../services/dashboard.service.js";

const resolveUserId = (req) => {
  const headerValue = req.headers["x-user-id"] || req.headers["x-userid"];
  const queryValue = req.query?.userId || req.query?.user_id;
  const bodyValue = req.body?.userId || req.body?.user_id;
  return Number(headerValue || queryValue || bodyValue || process.env.DEFAULT_USER_ID || 1);
};

const sendJson = (res, status, payload) => res.status(status).json(payload);

const toServiceError = (error) => {
  const isDatabaseUnavailable =
    error?.code === "ECONNREFUSED" ||
    error?.message?.includes("ECONNREFUSED") ||
    error?.message?.includes("connect ECONNREFUSED") ||
    error?.message?.includes("database") && error?.message?.includes("not available");

  if (isDatabaseUnavailable) {
    return {
      status: 503,
      message: "Database connection unavailable. Start PostgreSQL and ensure the configured database is running.",
    };
  }

  return {
    status: error?.status || 500,
    message: error?.message || "Service request failed",
  };
};

export const listPurchases = async (req, res) => {
  try {
    const data = await purchaseService.listPurchases(resolveUserId(req), req.query || {});
    return sendJson(res, 200, { success: true, message: "purchase.list.success", data });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.createPurchase(resolveUserId(req), req.body || {});
    return sendJson(res, 201, { success: true, message: "purchase.create.success", data: { purchase } });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const getPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchase(resolveUserId(req), req.params.uuid);
    return sendJson(res, 200, { success: true, message: "purchase.get.success", data: { purchase } });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const listRewards = async (req, res) => {
  try {
    const data = await rewardService.listRewards(req.query || {}, req.user?.role || "user");
    return sendJson(res, 200, { success: true, message: "reward.list.success", data });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const getReward = async (req, res) => {
  try {
    const reward = await rewardService.getReward(req.params.uuid, req.user?.role || "user");
    return sendJson(res, 200, { success: true, message: "reward.get.success", data: { reward } });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const createRedemption = async (req, res) => {
  try {
    const redemption = await redemptionService.createRedemption(resolveUserId(req), req.body || {});
    return sendJson(res, 201, { success: true, message: "redemption.create.success", data: { redemption } });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const listRedemptions = async (req, res) => {
  try {
    const data = await redemptionService.listRedemptions(resolveUserId(req), req.query || {});
    return sendJson(res, 200, { success: true, message: "redemption.list.success", data });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const getRedemption = async (req, res) => {
  try {
    const redemption = await redemptionService.getRedemption(resolveUserId(req), req.params.uuid);
    return sendJson(res, 200, { success: true, message: "redemption.get.success", data: { redemption } });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard(resolveUserId(req));
    return sendJson(res, 200, { success: true, message: "dashboard.get.success", data: dashboard });
  } catch (error) {
    const serviceError = toServiceError(error);
    return sendJson(res, serviceError.status, {
      success: false,
      message: serviceError.message,
    });
  }
};
