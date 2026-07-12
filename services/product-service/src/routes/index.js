import express from "express";
import { listProducts, createProduct, getProduct, updateProduct, updateProductStatus } from "../controllers/product.controller.js";
import { listCategories, createCategory, updateCategory, deleteCategory, getCategory, updateCategoryStatus, getCategoryList } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/products", listProducts);
router.post("/products", createProduct);
router.get("/products/:uuid", getProduct);
router.put("/products/:uuid", updateProduct);
router.patch("/products/:uuid/status", updateProductStatus);

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.get("/categories/list", getCategoryList);
router.get("/categories/:uuid", getCategory);
router.put("/categories/:uuid", updateCategory);
router.delete("/categories/:uuid", deleteCategory);
router.patch("/categories/:uuid/status", updateCategoryStatus);

export default router;
