import express from "express";
import { createProduct, getProduct, listProducts, updateProduct, updateProductStatus } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/products", listProducts);
router.post("/products", createProduct);
router.get("/products/:uuid", getProduct);
router.put("/products/:uuid", updateProduct);
router.patch("/products/:uuid/status", updateProductStatus);

export default router;
