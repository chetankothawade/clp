import express from 'express';
import { createPurchase, getPurchase, listPurchases } from '../controllers/purchase.controller.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();
const customerOnly = [isAuthenticated, authorizeRoles('user')];

// Customer purchase endpoints, mounted at /api/v1/purchases.
router.route('/').post(...customerOnly, validateRequest('purchase.create'), createPurchase).get(...customerOnly, validateRequest('purchase.list'), listPurchases);
router.route('/:uuid').get(...customerOnly, validateRequest('purchase.get'), getPurchase);

export default router;
