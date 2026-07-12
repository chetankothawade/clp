import { handleError, sendResponse } from "../utils/response.js";
import { dashboardService } from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.user.id);
    return sendResponse(res, 200, true, "dashboard.get.success", dashboard);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get dashboard error:" });
  }
};
