import { handleError, sendResponse } from "../utils/response.js";
import { productService } from "../services/product.service.js";

export const listProducts = async (req, res) => {
  try {
    const data = await productService.listProducts(req.query);
    return sendResponse(res, 200, true, "product.list.success", data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "List product error:" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendResponse(res, 201, true, "product.create.success", { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Create product error:" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.uuid);
    return sendResponse(res, 200, true, "product.get.success", { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Get product error:" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.uuid, req.body);
    return sendResponse(res, 200, true, "product.update.success", { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Update product error:" });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const product = await productService.updateProductStatus(req.params.uuid, req.body.status);
    return sendResponse(res, 200, true, "product.status.success", { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: "Update product status error:" });
  }
};
