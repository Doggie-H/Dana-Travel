/**
 * ITINERARY ROUTES
 * 
 * Định tuyến cho các chức năng tạo lịch trình.
 * Endpoint: /api/itinerary
 */

import express from "express";
import { generateItineraryHandler } from "../controllers/itinerary.controller.js";

const router = express.Router();

// POST /api/itinerary/generate
// Tạo lịch trình du lịch dựa trên yêu cầu người dùng
router.post("/generate", generateItineraryHandler);

export default router;
