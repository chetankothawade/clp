import express from 'express';
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  updateProductStatus,
} from '../controllers/product.controller.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();
const adminOnly = [isAuthenticated, authorizeRoles('admin', 'super_admin')];

// Admin product management endpoints, mounted at /api/v1/products.
router.route('/').post(...adminOnly, validateRequest('product.create'), createProduct).get(...adminOnly, validateRequest('product.list'), listProducts);
router.route('/:uuid').get(...adminOnly, validateRequest('product.get'), getProduct).put(...adminOnly, validateRequest('product.update'), updateProduct);
router.route('/:uuid/status').patch(...adminOnly, validateRequest('product.status'), updateProductStatus);

export default router;
