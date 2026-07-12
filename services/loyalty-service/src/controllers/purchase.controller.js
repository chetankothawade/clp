import { handleError, sendResponse } from "../utils/response.js";
import { purchaseService } from "../services/purchase.service.js";

export const createPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.createPurchase(req.user.id, req.body);
    return sendResponse(res, 201, true, "purchase.create.success", { purchase });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Create purchase error:" });
  }
};

export const listPurchases = async (req, res) => {
  try {
    const data = await purchaseService.listPurchases(req.user.id, req.query);
    return sendResponse(res, 200, true, "purchase.list.success", data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "List purchases error:" });
  }
};

export const getPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchase(req.user.id, req.params.uuid);
    return sendResponse(res, 200, true, "purchase.get.success", { purchase });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get purchase error:" });
  }
};
