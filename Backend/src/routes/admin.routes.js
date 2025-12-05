/**
 * =================================================================================================
 * FILE: admin.routes.js
 * MỤC ĐÍCH: Điều phối giao thông cho khu vực Admin.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Bốt bảo vệ" và "Bàn hướng dẫn" cho Admin Panel.
 * 1. Cửa khẩu (Login): Kiểm tra thẻ ra vào (Username/Password).
 * 2. Khu vực Hồ sơ (Accounts): Ai được làm sếp, ai làm lính.
 * 3. Kho Địa điểm (Locations): Nhập xuất hàng hóa (địa điểm du lịch).
 * 4. Thư viện (Knowledge): Nơi chứa sách vở kiến thức cho AI học.
 * 5. Phòng An ninh (Stats/Logs): Xem camera và số liệu mổ xẻ vấn đề.
 * =================================================================================================
 */

import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import {
  getAllLocations as repoGetAllLocations,
  createLocation as repoCreateLocation,
  updateLocation as repoUpdateLocation,
  deleteLocation as repoDeleteLocation,
} from "../services/location.service.js";
import {
  getRecentChatLogs,
  clearChatLogs,
} from "../services/chatLog.service.js";
import {
  verifyAdmin,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  changePassword,
} from "../services/admin.service.js";
import {
  getAllKnowledge,
  addKnowledge,
  deleteKnowledge,
  updateKnowledge,
} from "../services/knowledge.service.js";
import prisma from "../utils/prisma.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. XÁC THỰC (AUTHENTICATION) ---

/**
 * Đăng nhập Admin.
 * POST /api/admin/login
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng nhập Username và Password" });
    }

    // Kiểm tra thông tin đăng nhập
    const admin = await verifyAdmin(username, password);
    if (!admin) {
      return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // Cập nhật thời gian đăng nhập cuối
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // TRACKING: Ghi log đăng nhập Admin
    await prisma.accessLog.create({
      data: {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        endpoint: "/api/admin/login",
        method: "LOGIN", // Method đặc biệt cho Admin Login
        username: admin.username,
        role: admin.role,
      },
    });

    // Tạo session token đơn giản (Admin ID + Timestamp)
    // Trong thực tế nên dùng JWT hoặc Session Store chuyên dụng.
    const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString(
      "base64"
    );

    // Thiết lập Cookie bảo mật (HttpOnly)
    res.cookie?.("admin_token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Set true nếu chạy HTTPS
      path: "/api/admin",
      maxAge: 8 * 60 * 60 * 1000, // 8 giờ
    });
    
    // Fallback nếu res.cookie không hoạt động (một số môi trường Express cũ)
    if (!res.cookie) {
      res.setHeader(
        "Set-Cookie",
        `admin_token=${encodeURIComponent(
          sessionToken
        )}; HttpOnly; SameSite=Lax; Path=/api/admin; Max-Age=${8 * 60 * 60}`
      );
    }

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ error: "Đăng nhập thất bại" });
  }
});

/**
 * Đăng xuất Admin.
 * POST /api/admin/logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie?.("admin_token", { path: "/api/admin" });
  if (!res.clearCookie) {
    res.setHeader("Set-Cookie", "admin_token=; Path=/api/admin; Max-Age=0");
  }
  return res.json({ success: true });
});

// Kiểm tra trạng thái Router
router.get("/ping", (req, res) => res.json({ message: "Admin Router đang hoạt động" }));

/**
 * Lấy thông tin Admin hiện tại (Check Session).
 * GET /api/admin/me
 */
router.get("/me", adminAuth, (req, res) => {
  if (!req.admin) return res.status(401).json({ error: "Chưa xác thực" });
  return res.json({
    success: true,
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
    }
  });
});

// --- ÁP DỤNG MIDDLEWARE BẢO VỆ CHO CÁC ROUTE BÊN DƯỚI ---
router.use(adminAuth);

// --- 2. QUẢN LÝ TÀI KHOẢN ADMIN (ACCOUNTS) ---

// Lấy danh sách Admin
router.get("/accounts", async (req, res) => {
  try {
    const admins = await getAllAdmins();
    return res.json({ success: true, data: admins });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Tạo tài khoản Admin mới
router.post("/accounts", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const newAdmin = await createAdmin({ username, password, email, role });
    return res.json({ success: true, data: newAdmin });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Cập nhật thông tin Admin
router.put("/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedAdmin = await updateAdmin(id, updates);
    return res.json({ success: true, data: updatedAdmin });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Xóa tài khoản Admin
router.delete("/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAdmin(id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Đổi mật khẩu
router.post("/change-password", async (req, res) => {
  try {
    const { adminId, oldPassword, newPassword } = req.body;

    if (!adminId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin mật khẩu" });
    }

    await changePassword(adminId, oldPassword, newPassword);
    return res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// --- 3. QUẢN LÝ ĐỊA ĐIỂM (LOCATIONS) ---

// Lấy tất cả địa điểm
router.get("/locations", async (req, res) => {
  try {
    const all = await repoGetAllLocations();
    return res.json({ success: true, data: all });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Tạo địa điểm mới
router.post("/locations", async (req, res) => {
  try {
    const loc = req.body || {};
    const created = await repoCreateLocation(loc);
    return res.status(201).json({ success: true, data: created });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Cập nhật địa điểm
router.put("/locations/:id", async (req, res) => {
  try {
    const updates = req.body;
    const updated = await repoUpdateLocation(req.params.id, updates);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Xóa địa điểm
router.delete("/locations/:id", async (req, res) => {
  try {
    await repoDeleteLocation(req.params.id);
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// --- 4. THỐNG KÊ & LOGS (STATS) ---

// Thống kê truy cập (Traffic)
router.get("/stats/traffic", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await prisma.accessLog.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo
        }
      },
      select: {
        timestamp: true,
        role: true,
        method: true
      }
    });

    // Tổng hợp dữ liệu theo ngày
    const stats = {};
    logs.forEach(log => {
      // Chuyển đổi sang giờ Việt Nam (UTC+7)
      const date = new Date(new Date(log.timestamp).getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
        
      if (!stats[date]) stats[date] = { date, visitors: 0, internal: 0 };
      
      const role = log.role || 'guest';
      if (['admin', 'manager', 'staff', 'SUPER_ADMIN'].includes(role)) {
        stats[date].internal++;
      } else {
        // Chỉ tính method VISIT là một lượt truy cập thực
        if (log.method === 'VISIT') {
          stats[date].visitors++;
        }
      }
    });

    // Sắp xếp theo ngày
    const result = Object.values(stats).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Thống kê xu hướng tìm kiếm (Trends)
router.get("/stats/trends", async (req, res) => {
  try {
    const trends = await prisma.searchTrend.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    const tagCounts = {};
    trends.forEach(t => {
      try {
        const tags = JSON.parse(t.tags);
        if (Array.isArray(tags)) {
          tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      } catch {}
    });

    // Sắp xếp top 10 tags phổ biến nhất
    const result = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Lấy Access Logs (Nhật ký truy cập)
router.get("/access-logs", async (req, res) => {
  try {
    const logs = await prisma.accessLog.findMany({
      where: {
        method: { in: ["VISIT", "LOGIN"] }
      },
      orderBy: { timestamp: "desc" },
      take: 50
    });
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Lấy Chat Logs (Lịch sử chat)
router.get("/chat-logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await getRecentChatLogs(limit);
    res.json({ success: true, data: logs, count: logs.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Xóa toàn bộ Chat Logs
router.delete("/chat-logs", async (req, res) => {
  try {
    await clearChatLogs();
    res.json({ success: true, message: "Đã xóa toàn bộ lịch sử chat" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- 5. QUẢN LÝ KIẾN THỨC (KNOWLEDGE BASE) ---

router.get("/knowledge", async (req, res) => {
  try {
    const items = await getAllKnowledge();
    // Map DB fields -> Frontend fields
    const mappedItems = items.map(item => ({
      id: item.id,
      pattern: item.question,           // DB: question -> FE: pattern
      reply: item.answer,                // DB: answer -> FE: reply
      patternType: item.patternType || "contains",
      tags: item.keywords ? JSON.parse(item.keywords) : [],
      active: item.active !== false,     // Default true
      createdAt: item.createdAt,
    }));
    res.json({ success: true, data: mappedItems, count: mappedItems.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/knowledge", async (req, res) => {
  try {
    const { pattern, reply, tags } = req.body || {};
    
    const item = await addKnowledge({
      question: pattern,
      answer: reply,
      keywords: tags ? JSON.stringify(tags) : null,
    });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/knowledge/:id", async (req, res) => {
  try {
    await deleteKnowledge(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/knowledge/:id", async (req, res) => {
  try {
    const { pattern, reply, tags } = req.body;
    const updates = {};
    if (pattern) updates.question = pattern;
    if (reply) updates.answer = reply;
    if (tags) updates.keywords = JSON.stringify(tags);

    const updated = await updateKnowledge(req.params.id, updates);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- 6. UPLOAD HÌNH ẢNH (IMAGE UPLOAD) ---

const uploadsRoot = path.resolve(__dirname, "../uploads");

// Hàm tạo slug an toàn cho tên file/thư mục
function slugify(input = "misc") {
  return (
    String(input)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "misc"
  );
}

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const area = req.query.area || "misc";
    const areaSlug = slugify(area);
    const dir = path.join(uploadsRoot, areaSlug);
    fs.mkdirSync(dir, { recursive: true }); // Tạo thư mục nếu chưa có
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safeName = slugify(path.parse(file.originalname).name);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${safeName}-${ts}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép upload ảnh
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error("Chỉ cho phép upload file hình ảnh"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

router.post("/upload-image", upload.single("file"), (req, res) => {
  try {
    const area = req.query.area || "misc";
    const areaSlug = slugify(area);
    const relPath = `/uploads/${areaSlug}/${req.file.filename}`;
    return res.status(201).json({ success: true, url: relPath, path: relPath });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Upload thất bại" });
  }
});

export default router;
