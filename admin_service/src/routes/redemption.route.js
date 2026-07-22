import express from 'express';
import { createRedemption, getRedemption, listRedemptions } from '../controllers/redemption.controller.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();
const customerOnly = [isAuthenticated, authorizeRoles('user')];

// Customer reward-redemption endpoints, mounted at /api/v1/redemptions.
router.route('/').post(...customerOnly, validateRequest('redemption.create'), createRedemption).get(...customerOnly, validateRequest('redemption.list'), listRedemptions);
router.route('/:uuid').get(...customerOnly, validateRequest('redemption.get'), getRedemption);

export default router;
