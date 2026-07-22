import express from "express";

import accessRoute from "../access.route.js";
import authRoute from "../auth.route.js";
import moduleRoute from "../module.route.js";
import roleModuleRoute from "../roleModule.route.js";
import userPermissionRoute from "../userPermission.route.js";
import userRoute from "../user.route.js";

const router = express.Router();

router.use("/", authRoute);
router.use("/user", userRoute);
router.use("/access", accessRoute);
router.use("/module", moduleRoute);

router.use("/user-permissions", userPermissionRoute);
router.use("/role-modules", roleModuleRoute);

export default router;
