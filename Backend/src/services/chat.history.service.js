/**
 * =================================================================================================
 * CHAT HISTORY SERVICE - BỘ NHỚ CỦA CHATBOT
 * =================================================================================================
 * 
 * Nhiệm vụ:
 * 1. Ghi nhật ký hội thoại (User Message + Bot Response).
 * 2. Cung cấp Context (ngữ cảnh) cho AI để nó nhớ được câu chuyện trước đó.
 */

import prisma from "../config/prisma.client.js";
import { randomUUID } from "crypto";

// --- 1. GHI LOG ---
export const logChat = async (userMessage, botResponse) => {
  return await prisma.chatHistory.create({
    data: {
      id: `TN_${randomUUID()}`,
      userMessage,
      botResponse
    }
  });
};

// Alias cho Chatbot Service (giữ tương thích)
export const logChatInteraction = ({ userMessage, botResponse }) => logChat(userMessage, botResponse);


// --- 2. TRUY XUẤT NGỮ CẢNH (CONTEXT) ---
export const getConversationContext = async (limit = 3) => {
  // Lấy N tin nhắn gần nhất
  const logs = await prisma.chatHistory.findMany({
    orderBy: { timestamp: "desc" },
    take: limit
  });

  // Đảo ngược lại để đúng thứ tự thời gian (Quá khứ -> Hiện tại)
  // logs từ DB: [Mới nhất, Nhì, Ba] -> reverse -> [Ba, Nhì, Mới nhất]
  const chronological = logs.reverse();

  const context = [];
  chronological.forEach(log => {
    // 1. User Message
    if (log.userMessage) {
      context.push({ role: 'user', content: log.userMessage });
    }

    // 2. Bot Response (Cần xử lý JSON nếu bot trả về structured data)
    let botText = log.botResponse;
    try {
      if (botText.startsWith('{')) {
        const parsed = JSON.parse(botText);
        botText = parsed.reply || botText;
      }
    } catch (e) { /* Ignore JSON parse error, treat as text */ }

    if (botText) {
      context.push({ role: 'model', content: botText });
    }
  });

  return context;
};

// --- 3. HELPER: LẤY LỆNH CUỐI CÙNG ---
export const getLastBotMessage = async () => {
  const last = await prisma.chatHistory.findFirst({ orderBy: { timestamp: "desc" } });
  return last?.botResponse || "";
};
