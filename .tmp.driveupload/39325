import prisma from "../utils/prisma.js";

export const logChat = async (userMessage, botResponse) => {
  return await prisma.chatLog.create({
    data: {
      userMessage,
      botResponse
    }
  });
};

export const getChatHistory = async () => {
  return await prisma.chatLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 50
  });
};

export const clearChatLogs = async () => {
  try {
    await prisma.chatLog.deleteMany({});
    return true;
  } catch (error) {
    return false;
  }
};

// Alias for adminRoutes compatibility
export const getRecentChatLogs = getChatHistory;
export const logChatInteraction = async ({ userMessage, botResponse }) => {
  return logChat(userMessage, botResponse);
};
