import { handleError, sendResponse } from '../utils/response.js';
import { rewardService } from '../services/reward.service.js';

/**
 * List rewards. Customers receive only available rewards; administrators receive the full catalog.
 *
 * @route GET /api/v1/rewards
 * @access Customer, Admin, Super Admin
 */
export const listRewards = async (req, res) => {
  try {
    const data = await rewardService.listRewards(req.query, req.user.role);
    return sendResponse(res, 200, true, 'reward.list.success', data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'List rewards error:' });
  }
};

/**
 * Create a reward catalog entry.
 *
 * @route POST /api/v1/rewards
 * @access Admin, Super Admin
 */
export const createReward = async (req, res) => {
  try {
    const reward = await rewardService.createReward(req.body);
    return sendResponse(res, 201, true, 'reward.create.success', { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Create reward error:' });
  }
};

/**
 * Get a reward by UUID. Customers can access only available rewards.
 *
 * @route GET /api/v1/rewards/:uuid
 * @access Customer, Admin, Super Admin
 */
export const getReward = async (req, res) => {
  try {
    const reward = await rewardService.getReward(req.params.uuid, req.user.role);
    return sendResponse(res, 200, true, 'reward.get.success', { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Get reward error:' });
  }
};

/**
 * Update a reward catalog entry by UUID.
 *
 * @route PUT /api/v1/rewards/:uuid
 * @access Admin, Super Admin
 */
export const updateReward = async (req, res) => {
  try {
    const reward = await rewardService.updateReward(req.params.uuid, req.body);
    return sendResponse(res, 200, true, 'reward.update.success', { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Update reward error:' });
  }
};

/**
 * Activate or deactivate a reward by UUID.
 *
 * @route PATCH /api/v1/rewards/:uuid/status
 * @access Admin, Super Admin
 */
export const updateRewardStatus = async (req, res) => {
  try {
    const reward = await rewardService.updateRewardStatus(req.params.uuid, req.body.status);
    return sendResponse(res, 200, true, 'reward.status.success', { reward });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Update reward status error:' });
  }
};
