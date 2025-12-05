/**
 * =================================================================================================
 * FILE: knowledge.service.js
 * MỤC ĐÍCH: Quản lý "Kho kiến thức" (Knowledge Base) cho Chatbot.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "trí nhớ" của Chatbot. Thay vì lúc nào cũng phải hỏi AI (tốn tiền), bot sẽ tra cứu ở đây trước.
 * Ví dụ: Nếu khách hỏi "Đà Nẵng mùa nào đẹp?", bot sẽ tìm trong bảng này xem có câu trả lời sẵn không.
 * 
 * CÁC CHỨC NĂNG CHÍNH:
 * 1. matchKnowledge: Tìm câu trả lời phù hợp nhất cho câu hỏi của người dùng.
 * 2. CRUD: Thêm, sửa, xóa các mục kiến thức.
 * =================================================================================================
 */

import prisma from "../utils/prisma.js";

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
  return await prisma.knowledge.create({ data });
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
