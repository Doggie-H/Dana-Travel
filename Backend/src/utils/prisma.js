import { createRequire } from "module";
const require = createRequire(import.meta.url);

let PrismaClient;
try {
  const pkg = require("@prisma/client");
  PrismaClient = pkg.PrismaClient;
  console.log("PrismaClient loaded successfully");
} catch (e) {
  console.error("Failed to load PrismaClient:", e);
}

const prisma = new PrismaClient();

export default prisma;
