/**
 * Service quản lý tài khoản và xác thực Admin.
 */
import prisma from "../utils/prisma.js";
import { randomUUID } from "crypto";

/**
 * Xác thực thông tin đăng nhập của Admin.
 * 
 * @param {string} username - Tên đăng nhập.
 * @param {string} password - Mật khẩu (chưa mã hóa).
 * @returns {Promise<Object|null>} - Trả về object Admin nếu đúng, null nếu sai.
 */
// --- 1. VERIFY ADMIN ---
export const verifyAdmin = async (username, password) => {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;

  // SO SÁNH TRỰC TIẾP (PLAIN TEXT) - THEO YÊU CẦU
  if (password === admin.passwordHash) {
    return admin;
  }
  return null;
};

// --- 2. UPDATE ADMIN ---
export const updateAdmin = async (id, updates) => {
  const data = { ...updates };
  
  if (data.password) {
    // LƯU TRỰC TIẾP (PLAIN TEXT)
    data.passwordHash = data.password;
    delete data.password;
  }

  return await prisma.admin.update({
    where: { id },
    data,
  });
};

// --- 3. CHANGE PASSWORD ---
export const changePassword = async (id, oldPassword, newPassword) => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new Error("Không tìm thấy tài khoản Admin");

  // CHECK CŨ (PLAIN TEXT)
  if (oldPassword !== admin.passwordHash) {
    throw new Error("Mật khẩu cũ không chính xác");
  }

  // LƯU MỚI (PLAIN TEXT)
  await prisma.admin.update({
    where: { id },
    data: { passwordHash: newPassword }, // Lưu thẳng text
  });
  return true;
};

// ... existing getAdminByUsername ...

// --- 4. CREATE ADMIN ---
export const createAdmin = async (adminData) => {
  const { password, ...rest } = adminData;
  
  // LƯU TRỰC TIẾP (PLAIN TEXT)
  const passwordHash = password;
  
  return await prisma.admin.create({
    data: { 
      id: rest.id || `TK_${randomUUID()}`,
      ...rest, 
      passwordHash 
    },
  });
};

/**
 * Cập nhật thời gian đăng nhập lần cuối.
 * Được gọi sau khi đăng nhập thành công.
 * 
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const updateAdminLastLogin = async (id) => {
  return await prisma.admin.update({
    where: { id },
    data: { lastLogin: new Date() },
  });
};

/**
 * Lấy danh sách tất cả Admin.
 * 
 * @returns {Promise<Array>}
 */
export const getAllAdmins = async () => {
  return await prisma.admin.findMany();
};

/**
 * Xóa tài khoản Admin.
 * 
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export const deleteAdmin = async (id) => {
  try {
    await prisma.admin.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};
