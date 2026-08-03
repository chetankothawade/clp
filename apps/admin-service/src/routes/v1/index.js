import express from "express";

import cmsRoute from "../cms.route.js";
import editorRoute from "../editor.route.js";

const router = express.Router();

router.use("/editor", editorRoute);
router.use("/cms", cmsRoute);

export default router;
