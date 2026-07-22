//routes/user.route.js
import express from "express";
import { getMe, listUser, createUser, updateUser, deleteUser, getUser, userStatus, getUserList, exportUsersCSV } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { uploadImage } from '../utils/multer.js';

const router = express.Router();

router.route("/me").get(isAuthenticated, validateRequest("user.me"), getMe);
router.route("/list").get(isAuthenticated, validateRequest("user.list"), listUser);
router.route("/create").post(isAuthenticated, uploadImage.single("avatar"), validateRequest("user.create"), createUser);
router.route("/update/:uuid").put(isAuthenticated, uploadImage.single("avatar"), validateRequest("user.update"), updateUser);
router.route("/delete/:uuid").patch(isAuthenticated, validateRequest("user.delete"), deleteUser);
//router.route("/delete/:uuid").delete(isAuthenticated, deleteUser);
router.route("/get/:uuid").get(isAuthenticated, validateRequest("user.get"), getUser);
router.route("/status/:uuid").put(isAuthenticated, validateRequest("user.status"), userStatus);
router.route("/getList").get(isAuthenticated, validateRequest("user.getList"), getUserList);
router.route("/export/csv").get(isAuthenticated, validateRequest("user.exportCsv"), exportUsersCSV);

export default router;
