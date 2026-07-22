import { handleError, sendResponse } from '../utils/response.js';
import { purchaseService } from '../services/purchase.service.js';

/**
 * Create a purchase for the logged-in customer and record earned loyalty points.
 *
 * @route POST /api/v1/purchases
 * @access Customer
 */
export const createPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.createPurchase(req.user.uuid || req.user.id, req.body, req.get('X-Request-Id'));
    return sendResponse(res, 201, true, 'purchase.create.success', { purchase });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Create purchase error:' });
  }
};

/**
 * List the logged-in customer's purchases.
 *
 * @route GET /api/v1/purchases
 * @access Customer
 */
export const listPurchases = async (req, res) => {
  try {
    const data = await purchaseService.listPurchases(req.user.uuid || req.user.id, req.query);
    return sendResponse(res, 200, true, 'purchase.list.success', data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'List purchases error:' });
  }
};

/**
 * Get a purchase owned by the logged-in customer.
 *
 * @route GET /api/v1/purchases/:uuid
 * @access Customer
 */
export const getPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchase(req.user.uuid || req.user.id, req.params.uuid);
    return sendResponse(res, 200, true, 'purchase.get.success', { purchase });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Get purchase error:' });
  }
};
