/**
 * =================================================================================================
 * FILE: chatLog.service.js
 * MỤC ĐÍCH: Ghi lại lịch sử trò chuyện (Chat History).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Service này là "Thư ký" ghi chép biên bản cuộc họp.
 * 1. Ghi log: Khi Chatbot trả lời khách, thư ký sẽ ghi lại "Khách hỏi gì - Bot đáp gì".
 * 2. Truy xuất: Admin có thể xem lại các cuộc hội thoại này để biết khách quan tâm điều gì.
 * 3. Dọn dẹp: Có chức năng xóa log nếu dữ liệu quá nhiều.
 * =================================================================================================
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
