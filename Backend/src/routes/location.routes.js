/**
 * =================================================================================================
 * FILE: location.routes.js
 * MỤC ĐÍCH: Định nghĩa các đường dẫn API (Endpoints) để tìm kiếm địa điểm.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Router này chịu trách nhiệm điều hướng các yêu cầu tìm kiếm địa điểm (Ăn uống, Vui chơi, Khách sạn).
 * Nó nhận yêu cầu từ người dùng và chuyển tiếp đến `location.controller.js` để xử lý.
 * 
 * DANH SÁCH API:
 * 1. GET /api/location/search -> Tìm kiếm địa điểm.
 * =================================================================================================
 */

import express from "express";
import { searchLocationsHandler } from "../controllers/location.controller.js";

const router = express.Router();

// GET /api/location/search
// Tìm kiếm địa điểm theo từ khóa và bộ lọc
router.get("/search", searchLocationsHandler);

export default router;
