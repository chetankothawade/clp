import { handleError, sendResponse } from '../utils/response.js';
import { productService } from '../services/product.service.js';

/**
 * List products with pagination, search, sorting, and optional status filtering.
 *
 * @route GET /api/v1/products
 * @access Admin, Super Admin
 */
export const listProducts = async (req, res) => {
  try {
    const data = await productService.listProducts(req.query);
    return sendResponse(res, 200, true, 'product.list.success', data);
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'List product error:' });
  }
};

/**
 * Create a product.
 *
 * @route POST /api/v1/products
 * @access Admin, Super Admin
 */
export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendResponse(res, 201, true, 'product.create.success', { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Create product error:' });
  }
};

/**
 * Get product details by UUID.
 *
 * @route GET /api/v1/products/:uuid
 * @access Admin, Super Admin
 */
export const getProduct = async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.uuid);
    return sendResponse(res, 200, true, 'product.get.success', { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Get product error:' });
  }
};

/**
 * Update a product by UUID.
 *
 * @route PUT /api/v1/products/:uuid
 * @access Admin, Super Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.uuid, req.body);
    return sendResponse(res, 200, true, 'product.update.success', { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Update product error:' });
  }
};

/**
 * Activate or deactivate a product by UUID.
 *
 * @route PATCH /api/v1/products/:uuid/status
 * @access Admin, Super Admin
 */
export const updateProductStatus = async (req, res) => {
  try {
    const product = await productService.updateProductStatus(req.params.uuid, req.body.status);
    return sendResponse(res, 200, true, 'product.status.success', { product });
  } catch (error) {
    return handleError(req, res, error, { logPrefix: 'Update product status error:' });
  }
};
