import express from "express";

import accessRoute from "../access.route.js";
import authRoute from "../auth.route.js";
import categoryRoute from "../category.route.js";
import cmsRoute from "../cms.route.js";
import editorRoute from "../editor.route.js";
import moduleRoute from "../module.route.js";
import productRoute from "../product.route.js";
import roleModuleRoute from "../roleModule.route.js";
import userPermissionRoute from "../userPermission.route.js";
import userRoute from "../user.route.js";

const router = express.Router();

router.use("/", authRoute);
router.use("/user", userRoute);
router.use("/access", accessRoute);
router.use("/module", moduleRoute);
router.use("/products", productRoute);
router.use("/editor", editorRoute);
router.use("/cms", cmsRoute);
router.use("/category", categoryRoute);
router.use("/user-permissions", userPermissionRoute);
router.use("/role-modules", roleModuleRoute);

export default router;
