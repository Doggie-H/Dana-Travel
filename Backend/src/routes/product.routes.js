import express from "express";
import * as productController from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.upload.single("image"), productController.createProduct);
router.put("/:id", productController.upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
