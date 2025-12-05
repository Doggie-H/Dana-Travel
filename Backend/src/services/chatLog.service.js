/**
 * Service ghi lại và quản lý lịch sử trò chuyện.
 * Hỗ trợ lưu log chat, truy xuất lịch sử cho dashboard và dọn dẹp dữ liệu cũ.
 */

import prisma from "../utils/prisma.js";

/**
 * Ghi lại một lượt tương tác Chat.
 * 
 * @param {string} userMessage - Tin nhắn của người dùng.
 * @param {string} botResponse - Phản hồi của Bot.
 * @returns {Promise<Object>} - Record đã lưu.
 */
export const logChat = async (userMessage, botResponse) => {
  return await prisma.chatLog.create({
    data: {
      userMessage,
      botResponse
    }
  });
};

/**
 * Lấy lịch sử Chat gần đây.
 * Giới hạn 50 tin nhắn mới nhất để hiển thị trên Dashboard.
 * 
 * @returns {Promise<Array>}
 */
export const getChatHistory = async () => {
  return await prisma.chatLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 50
  });
};

/**
 * Xóa toàn bộ lịch sử Chat.
 * Dùng cho Admin khi muốn dọn dẹp dữ liệu.
 * 
 * @returns {Promise<boolean>}
 */
export const clearChatLogs = async () => {
  try {
    await prisma.chatLog.deleteMany({});
    return true;
  } catch (error) {
    return false;
  }
};

// --- ALIASES (Tên gọi khác cho tương thích ngược) ---

// Dùng cho Admin Routes
export const getRecentChatLogs = getChatHistory;

// Dùng cho Chatbot Service
export const logChatInteraction = async ({ userMessage, botResponse }) => {
  return logChat(userMessage, botResponse);
};
