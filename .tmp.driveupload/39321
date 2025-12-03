import prisma from "../utils/prisma.js";

import bcrypt from "bcryptjs";

export const verifyAdmin = async (username, password) => {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) return null;
  return admin;
};

export const updateAdmin = async (id, updates) => {
  const data = { ...updates };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return await prisma.admin.update({
    where: { id },
    data,
  });
};

export const changePassword = async (id, oldPassword, newPassword) => {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new Error("Admin not found");

  const isValid = await bcrypt.compare(oldPassword, admin.passwordHash);
  if (!isValid) throw new Error("Incorrect old password");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({
    where: { id },
    data: { passwordHash },
  });
  return true;
};

export const getAdminByUsername = async (username) => {
  return await prisma.admin.findUnique({
    where: { username },
  });
};

export const createAdmin = async (adminData) => {
  const { password, ...rest } = adminData;
  const passwordHash = await bcrypt.hash(password, 10);
  return await prisma.admin.create({
    data: { ...rest, passwordHash },
  });
};

export const updateAdminLastLogin = async (id) => {
  return await prisma.admin.update({
    where: { id },
    data: { lastLogin: new Date() },
  });
};

export const getAllAdmins = async () => {
  return await prisma.admin.findMany();
};

export const deleteAdmin = async (id) => {
  try {
    await prisma.admin.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};
