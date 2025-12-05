
import express from "express";
import { logError } from "../controllers/logging.controller.js";

const router = express.Router();

/**
 * @route POST /api/logs/error
 * @desc Ghi nhận lỗi từ client/frontend
 * @access Public (hoặc có thể bảo vệ bằng token nếu cần)
 */
router.post("/error", logError);

export default router;
