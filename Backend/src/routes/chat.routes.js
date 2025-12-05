/**
 * =================================================================================================
 * FILE: chat.routes.js
 * MỤC ĐÍCH: Định nghĩa các đường dẫn API cho Chatbot AI.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Khi người dùng nhắn tin cho Bot, tin nhắn sẽ đi qua Route này.
 * Nó đóng vai trò "cổng giao tiếp" giữa giao diện Chat và bộ não AI (Service).
 * 
 * DANH SÁCH API:
 * 1. POST /api/chat -> Gửi tin nhắn và nhận câu trả lời.
 * =================================================================================================
 */

import express from "express";
import { chatHandler } from "../controllers/chat.controller.js";

const router = express.Router();

// POST /api/chat
// Gửi tin nhắn và nhận phản hồi từ AI
router.post("/", chatHandler);

export default router;
