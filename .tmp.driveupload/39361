// file: backend/controllers/chatController.js

/**
 * Chat Controller - xử lý chat requests
 *
 * Vai trò: validate message, gọi suggestionService
 * Input: {message, context?}
 * Output: {reply, suggestions?, itineraryPatch?}
 */

import { processChatMessage } from "../services/chatbot.service.js";
import { logChatInteraction } from "../services/chatLog.service.js";

/**
 * POST /api/chat
 * Process chat message & return response
 */
export async function chatHandler(req, res, next) {
  try {
    const { message, context } = req.body;

    // Validate message
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Message is required and must be non-empty string",
      });
    }

    // Call service
    const response = await processChatMessage(message, context || {});

    // Log interaction for debugging
    logChatInteraction({
      userMessage: message,
      botResponse: response,
      context: context || {},
    });

    // Success response
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  chatHandler,
};
