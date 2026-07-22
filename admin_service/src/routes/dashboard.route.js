import express from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Customer loyalty-program overview, mounted at /api/v1/dashboard.
router.route('/').get(isAuthenticated, authorizeRoles('user'), validateRequest('dashboard.overview'), getDashboard);

export default router;
