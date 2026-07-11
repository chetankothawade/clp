import express from 'express';
import { createReward, getReward, listRewards, updateReward, updateRewardStatus } from '../controllers/reward.controller.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();
const authenticatedRoles = [isAuthenticated, authorizeRoles('user', 'admin', 'super_admin')];
const adminOnly = [isAuthenticated, authorizeRoles('admin', 'super_admin')];

// Admins manage the reward catalog; customers can only view available rewards.
router.route('/').post(...adminOnly, validateRequest('reward.create'), createReward).get(...authenticatedRoles, validateRequest('reward.list'), listRewards);
router.route('/:uuid').get(...authenticatedRoles, validateRequest('reward.get'), getReward).put(...adminOnly, validateRequest('reward.update'), updateReward);
router.route('/:uuid/status').patch(...adminOnly, validateRequest('reward.status'), updateRewardStatus);

export default router;
