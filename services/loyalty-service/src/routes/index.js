import express from "express";
import { createPurchase, getPurchase, listPurchases } from "../controllers/purchase.controller.js";
import { createRedemption, getRedemption, listRedemptions } from "../controllers/redemption.controller.js";
import { createReward, getReward, listRewards, updateReward, updateRewardStatus } from "../controllers/reward.controller.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/purchases", listPurchases);
router.post("/purchases", createPurchase);
router.get("/purchases/:uuid", getPurchase);

router.get("/rewards", listRewards);
router.post("/rewards", createReward);
router.get("/rewards/:uuid", getReward);
router.put("/rewards/:uuid", updateReward);
router.patch("/rewards/:uuid/status", updateRewardStatus);

router.get("/redemptions", listRedemptions);
router.post("/redemptions", createRedemption);
router.get("/redemptions/:uuid", getRedemption);

router.get("/dashboard", getDashboard);

export default router;
