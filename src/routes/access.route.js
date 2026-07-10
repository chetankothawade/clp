import express from "express";

import asyncHandler from "../middlewares/asyncHandler.js";
import { userPermissionService } from "../services/userPermission.service.js";

const router = express.Router();

router.get("/:userId", asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const access = await userPermissionService.getUserModuleAccess(userId);
  return res.json({ success: true, access });
}));

export default router;
