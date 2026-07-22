import express from "express";


import purchaseRoute from "../purchase.route.js";
import redemptionRoute from "../redemption.route.js";
import rewardRoute from "../reward.route.js";
import dashboardRoute from "../dashboard.route.js";


const router = express.Router();


router.use("/purchases", purchaseRoute);
router.use("/rewards", rewardRoute);
router.use("/redemptions", redemptionRoute);
router.use("/dashboard", dashboardRoute);
 

export default router;
