/**
 * Service quản lý tài khoản và xác thực Admin.
 * Bao gồm các chức năng đăng nhập, tạo mới, cập nhật và xóa tài khoản quản trị.
 */

import prisma from "../utils/prisma.js";
import bcrypt from "bcryptjs";

/**
 * Xác thực thông tin đăng nhập của Admin.
 * 
 * @param {string} username - Tên đăng nhập.
 * @param {string} password - Mật khẩu (chưa mã hóa).
 * @returns {Promise<Object|null>} - Trả về object Admin nếu đúng, null nếu sai.
 */
export const verifyAdmin = async (username, password) => {
  // Tìm admin theo username
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;

  // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) return null;

  return admin;
};

/**
 * Cập nhật thông tin Admin.
 * Nếu có cập nhật mật khẩu, sẽ tự động mã hóa lại.
 * 
 * @param {string} id - ID của Admin.
 * @param {Object} updates - Các trường cần cập nhật.
 * @returns {Promise<Object>} - Admin sau khi cập nhật.
 */
export const updateAdmin = async (id, updates) => {
  const data = { ...updates };
  
  // Nếu có đổi mật khẩu, cần hash lại trước khi lưu
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password; // Xóa trường password plain text
  }

  return await prisma.admin.update({
    where: { id },
    data,
  });
};

/**
 * Đổi mật khẩu Admin.
 * Yêu cầu phải nhập đúng mật khẩu cũ.
 * 
 * @param {string} id - ID của Admin.
 * @param {string} oldPassword - Mật khẩu cũ.
 * @param {string} newPassword - Mật khẩu mới.
 * @returns {Promise<boolean>} - True nếu thành công.
 */
export const changePassword = async (id, oldPassword, newPassword) => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new Error("Không tìm thấy tài khoản Admin");

  // Kiểm tra mật khẩu cũ
  const isValid = await bcrypt.compare(oldPassword, admin.passwordHash);
  if (!isValid) throw new Error("Mật khẩu cũ không chính xác");

  // Mã hóa mật khẩu mới
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.admin.update({
    where: { id },
    data: { passwordHash },
  });
  return true;
};

/**
 * Lấy thông tin Admin theo Username.
 * 
 * @param {string} username 
 * @returns {Promise<Object|null>}
 */
export const getAdminByUsername = async (username) => {
  return await prisma.admin.findUnique({
    where: { username },
  });
};

/**
 * Tạo tài khoản Admin mới.
 * 
 * @param {Object} adminData - Dữ liệu admin (username, password, role...).
 * @returns {Promise<Object>} - Admin mới được tạo.
 */
export const createAdmin = async (adminData) => {
  const { password, ...rest } = adminData;
  
  // Mã hóa mật khẩu
  const passwordHash = await bcrypt.hash(password, 10);
  
  return await prisma.admin.create({
    data: { ...rest, passwordHash },
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
