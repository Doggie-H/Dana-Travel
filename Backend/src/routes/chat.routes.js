/**
 * Định nghĩa API cho Chatbot.
 * POST /api/chat
 */

import express from "express";
import { chatHandler } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat
// Gửi tin nhắn và nhận phản hồi từ AI
router.post("/", chatHandler);

export default router;
