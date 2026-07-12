import express from "express";
import {
  createPurchase,
  createRedemption,
  getDashboard,
  getPurchase,
  getRedemption,
  getReward,
  listPurchases,
  listRedemptions,
  listRewards,
} from "../controllers/loyalty.controller.js";

const router = express.Router();

router.get("/purchases", listPurchases);
router.post("/purchases", createPurchase);
router.get("/purchases/:uuid", getPurchase);

router.get("/rewards", listRewards);
router.get("/rewards/:uuid", getReward);

router.get("/redemptions", listRedemptions);
router.post("/redemptions", createRedemption);
router.get("/redemptions/:uuid", getRedemption);

router.get("/dashboard", getDashboard);

export default router;
