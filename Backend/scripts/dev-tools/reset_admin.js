import prisma from "./src/utils/prisma.js";
import bcrypt from "bcryptjs";

async function resetAdmin() {
  const username = "admin";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.upsert({
      where: { username },
      update: { passwordHash, role: "SUPER_ADMIN" },
      create: {
        username,
        passwordHash,
        email: "admin@example.com",
        role: "SUPER_ADMIN",
      },
    });
    console.log("Admin reset successfully:", admin);
  } catch (e) {
    console.error("Error resetting admin:", e);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
