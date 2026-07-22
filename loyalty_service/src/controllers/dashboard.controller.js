import { handleError, sendResponse } from '../utils/response.js';
import { dashboardService } from '../services/dashboard.service.js';

/**
 * Return the authenticated customer's loyalty overview, latest activity, and available reward count.
 *
 * @route GET /api/v1/dashboard
 * @access Customer
 */
export const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.user.uuid || req.user.id);
    return sendResponse(res, 200, true, 'dashboard.get.success', dashboard);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Get dashboard error:' });
  }
};
