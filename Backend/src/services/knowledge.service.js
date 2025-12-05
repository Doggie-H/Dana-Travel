/**
 * Service quản lý Knowledge Base cho Chatbot.
 * Cung cấp các chức năng CRUD và tìm kiếm kiến thức (matchKnowledge) để trả lời câu hỏi người dùng.
 */

import prisma from "../utils/prisma.js";
import { randomUUID } from "crypto";

/**
 * Lấy toàn bộ danh sách kiến thức.
 * @returns {Promise<Array>}
 */
export const getAllKnowledge = async () => {
  return await prisma.knowledge.findMany();
};

/**
 * Thêm mới một mục kiến thức.
 * @param {Object} data - { question, answer, keywords }
 * @returns {Promise<Object>}
 */
export const addKnowledge = async (data) => {
  return await prisma.knowledge.create({
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
  return await prisma.knowledge.update({
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
    await prisma.knowledge.delete({ where: { id } });
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
  return await prisma.knowledge.findFirst({
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
export const matchKnowledge = async (query) => {
  const item = await findKnowledge(query);
  if (item) {
    return { reply: item.answer };
  }
  return null;
};
