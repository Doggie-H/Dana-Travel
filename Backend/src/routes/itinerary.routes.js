/**
 * =================================================================================================
 * FILE: itinerary.routes.js
 * MỤC ĐÍCH: Định nghĩa các đường dẫn API (Endpoints) liên quan đến Lịch trình.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * File này giống như một "bảng chỉ đường". Khi Frontend gửi yêu cầu đến Server,
 * Router sẽ nhìn vào địa chỉ (URL) để quyết định chuyển yêu cầu đó cho "nhân viên" nào xử lý (Controller).
 * 
 * DANH SÁCH API:
 * 1. POST /api/itinerary/generate -> Tạo lịch trình mới.
 * =================================================================================================
 */

import express from "express";
import { generateItineraryHandler } from "../controllers/itinerary.controller.js";

const router = express.Router();

// POST /api/itinerary/generate
// Tạo lịch trình du lịch dựa trên yêu cầu người dùng
router.post("/generate", generateItineraryHandler);

export default router;
