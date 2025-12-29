/**
 * Service xử lý logic Chatbot.
 * Kết hợp Rule-based (từ khóa) và AI (Gemini) để trả lời người dùng.
 */

import { processChatWithAI } from "../adapters/gemini.adapter.js";

/**
 * Xử lý tin nhắn từ người dùng và trả về phản hồi.
 * 
 * @param {string} message - Nội dung tin nhắn của user.
 * @param {Object} context - Ngữ cảnh cuộc trò chuyện (lịch trình hiện tại, v.v.).
 * @returns {Promise<Object>} - Đối tượng chứa câu trả lời (reply), gợi ý (suggestions), và hành động (itineraryPatch).
 */
export async function processChatMessage(message, context = {}) {
  const lowerMsg = message.toLowerCase().trim();

  // Mini-RAG Context Injection (Built in adapter)
  // Call AI directly for everything
  try {
    const aiResponse = await processChatWithAI(message, {
      ...context,
      history: context.history || []
    });

    if (aiResponse) {
      return {
        reply: aiResponse.reply,
        quickReplies: aiResponse.quickReplies || [],
        suggestions: [], // No structural suggestions needed for pure consultant
        // No itineraryPatch actions
      };
    }
  } catch (err) {
    console.error("Lỗi khi gọi AI adapter:", err);
  }

  // Fallback
  return {
    reply: "Xin lỗi bạn, Dana đang bị mất kết nối một chút. Bạn hỏi lại giúp mình nhé!",
    quickReplies: [],
  };
}


