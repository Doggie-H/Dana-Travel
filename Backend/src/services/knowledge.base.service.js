/**
 * Service quản lý Knowledge Base cho Chatbot.
 * Cung cấp các chức năng CRUD và tìm kiếm kiến thức (matchKnowledge) để trả lời câu hỏi người dùng.
 */

import prisma from "../config/prisma.client.js";
import { randomUUID } from "crypto";

/**
 * Lấy toàn bộ danh sách kiến thức.
 * @returns {Promise<Array>}
 */
export const getAllKnowledge = async () => {
  return await prisma.knowledgeBase.findMany();
};

/**
 * Thêm mới một mục kiến thức.
 * @param {Object} data - { question, answer, keywords }
 * @returns {Promise<Object>}
 */
export const addKnowledge = async (data) => {
  return await prisma.knowledgeBase.create({
    data: {
      id: data.id || `KB_${randomUUID()}`,
      ...data
    }
  });
};

/**
 * Cập nhật mục kiến thức.
 * @param {string} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const updateKnowledge = async (id, data) => {
  return await prisma.knowledgeBase.update({
    where: { id },
    data
  });
};

/**
 * Xóa mục kiến thức.
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export const deleteKnowledge = async (id) => {
  try {
    await prisma.knowledgeBase.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Tìm kiếm kiến thức dựa trên từ khóa hoặc câu hỏi.
 * Sử dụng tìm kiếm chuỗi đơn giản (contains).
 * 
 * @param {string} query - Từ khóa tìm kiếm.
 * @returns {Promise<Object|null>} - Mục kiến thức tìm thấy đầu tiên.
 */
export const findKnowledge = async (query) => {
  // Tìm kiếm theo từ khóa xuất hiện trong câu hỏi hoặc trường keywords
  return await prisma.knowledgeBase.findFirst({
    where: {
      OR: [
        { question: { contains: query } },
        { keywords: { contains: query } }
      ]
    }
  });
};

/**
 * Hàm wrapper để tìm kiếm và trả về câu trả lời định dạng chuẩn.
 * Dùng cho Chatbot Service.
 * 
 * @param {string} query 
 * @returns {Promise<Object|null>} - { reply: string }
 */
/**
 * Hàm tìm kiếm kiến thức thông minh hơn (Simple Fuzzy Match).
 * 
 * Logic:
 * 1. Tìm chính xác (Contains) trước.
 * 2. Nếu không có, tách từ khóa (Tokenize) và tìm các mục có nhiều từ khóa trùng lặp nhất.
 */
export const matchKnowledge = async (query) => {
  if (!query) return null;
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Exact / Substring Match (Ưu tiên cao nhất)
  const exactMatch = await prisma.knowledgeBase.findFirst({
    where: {
      OR: [
        { question: { contains: normalizedQuery } },
        { keywords: { contains: normalizedQuery } }
      ]
    }
  });

  // Note: Schema của KnowledgeBase có thể chưa có 'items' relation phức tạp, 
  // quay lại check schema hiện tại. Code cũ dùng `findFirst` trực tiếp.
  // Code cũ:
  // return await prisma.knowledgeBase.findFirst({
  //   where: {
  //     OR: [
  //       { question: { contains: query } },
  //       { keywords: { contains: query } }
  //     ]
  //   }
  // });

  // GIẢI PHÁP: Lấy hết KB về (số lượng ít ~100) và xử lý JS tại Memory để Fuzzy
  const allKB = await prisma.knowledgeBase.findMany();

  // Tokenize Query
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 2); // Bỏ từ quá ngắn (1 ký tự)

  let bestMatch = null;
  let maxScore = 0;

  for (const kb of allKB) {
    let score = 0;
    const qNorm = (kb.question || "").toLowerCase();
    const kNorm = (kb.keywords || "").toLowerCase();

    // Check Substring (High Score)
    if (qNorm.includes(normalizedQuery)) score += 10;
    if (kNorm.includes(normalizedQuery)) score += 8;

    // Check Token Overlap
    queryTokens.forEach(token => {
      if (qNorm.includes(token)) score += 1;
      if (kNorm.includes(token)) score += 1;
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = kb;
    }
  }

  // Ngưỡng Score (Ít nhất phải khớp 1 token hoặc substring)
  if (bestMatch && maxScore >= 2) {
    return { reply: bestMatch.answer };
  }

  return null;
};
