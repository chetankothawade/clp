import { handleError, sendResponse } from '../utils/response.js';
import { redemptionService } from '../services/redemption.service.js';

/**
 * Redeem an available reward for the logged-in customer.
 *
 * @route POST /api/v1/redemptions
 * @access Customer
 */
export const createRedemption = async (req, res) => {
  try {
    const redemption = await redemptionService.createRedemption(req.user.id, req.body);
    return sendResponse(res, 201, true, 'redemption.create.success', { redemption });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Create redemption error:' });
  }
};

/**
 * List redemptions made by the logged-in customer.
 *
 * @route GET /api/v1/redemptions
 * @access Customer
 */
export const listRedemptions = async (req, res) => {
  try {
    const data = await redemptionService.listRedemptions(req.user.id, req.query);
    return sendResponse(res, 200, true, 'redemption.list.success', data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'List redemptions error:' });
  }
};

/**
 * Get a redemption owned by the logged-in customer.
 *
 * @route GET /api/v1/redemptions/:uuid
 * @access Customer
 */
export const getRedemption = async (req, res) => {
  try {
    const redemption = await redemptionService.getRedemption(req.user.id, req.params.uuid);
    return sendResponse(res, 200, true, 'redemption.get.success', { redemption });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Get redemption error:' });
  }
};
