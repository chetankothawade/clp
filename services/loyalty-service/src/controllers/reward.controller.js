import { handleError, sendResponse } from "../utils/response.js";
import { rewardService } from "../services/reward.service.js";

export const listRewards = async (req, res) => {
  try {
    const data = await rewardService.listRewards(req.query, req.user.role);
    return sendResponse(res, 200, true, "reward.list.success", data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "List rewards error:" });
  }
};

export const createReward = async (req, res) => {
  try {
    const reward = await rewardService.createReward(req.body);
    return sendResponse(res, 201, true, "reward.create.success", { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Create reward error:" });
  }
};

export const getReward = async (req, res) => {
  try {
    const reward = await rewardService.getReward(req.params.uuid, req.user.role);
    return sendResponse(res, 200, true, "reward.get.success", { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get reward error:" });
  }
};

export const updateReward = async (req, res) => {
  try {
    const reward = await rewardService.updateReward(req.params.uuid, req.body);
    return sendResponse(res, 200, true, "reward.update.success", { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Update reward error:" });
  }
};

export const updateRewardStatus = async (req, res) => {
  try {
    const reward = await rewardService.updateRewardStatus(req.params.uuid, req.body.status);
    return sendResponse(res, 200, true, "reward.status.success", { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Update reward status error:" });
  }
};
