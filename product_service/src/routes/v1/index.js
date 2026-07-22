import express from "express";


import categoryRoute from "../category.route.js";
import productRoute from "../product.route.js";



const router = express.Router();


router.use("/products", productRoute);
router.use("/category", categoryRoute);


export default router;
