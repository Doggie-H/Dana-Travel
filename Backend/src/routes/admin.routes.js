/**
 * =================================================================================================
 * ADMIN ROUTES - ĐỊNH TUYẾN API QUẢN TRỊ
 * =================================================================================================
 * 
 * Định nghĩa các API Endpoint cho Admin Panel.
 * Sử dụng Controller để xử lý logic, giữ file route sạch sẽ.
 */

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Middleware
import { adminAuth } from "../middleware/admin.auth.middleware.js";

// Controllers
import AuthController from "../controllers/auth.controller.js";
import LocationController from "../controllers/location.controller.js";
// Note: Knowledge & Stats logic still inline for now, will extract in Phase 2 if needed (keeping complexity manageable)
import {
  getAllKnowledge,
  addKnowledge,
  deleteKnowledge,
  updateKnowledge,
} from "../services/knowledge.base.service.js";
import {
  getAllLocations as repoGetAllLocations,
  createLocation as repoCreateLocation,
  updateLocation as repoUpdateLocation,
  deleteLocation as repoDeleteLocation,
} from "../services/location.service.js"; // Direct service access for now, or move to controller

import prisma from "../config/prisma.client.js";

const router = express.Router();

/**
 * =================================================================================================
 * 1. AUTHENTICATION (PUBLIC)
 * =================================================================================================
 */
router.post("/login", AuthController.loginHandler);
router.post("/logout", AuthController.logoutHandler);
router.get("/ping", (req, res) => res.json({ message: "Admin Router OK" }));


/**
 * =================================================================================================
 * PROTECTED ROUTES (REQUIRE LOGIN)
 * =================================================================================================
 */
router.use(adminAuth);

// --- Session Check ---
router.get("/me", AuthController.getCurrentAdminHandler);

// --- Account Management ---
router.get("/accounts", AuthController.getAllAccountsHandler);
router.post("/accounts", AuthController.createAccountHandler);
router.put("/accounts/:id", AuthController.updateAccountHandler);
router.delete("/accounts/:id", AuthController.deleteAccountHandler);
router.post("/change-password", AuthController.changePasswordHandler);


// --- Location Management ---
// TODO: Move these to LocationController fully in next phase
router.get("/locations", async (req, res) => {
  try { res.json({ success: true, data: await repoGetAllLocations() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/locations", async (req, res) => {
  try { res.status(201).json({ success: true, data: await repoCreateLocation(req.body) }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/locations/:id", async (req, res) => {
  try { res.json({ success: true, data: await repoUpdateLocation(req.params.id, req.body) }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/locations/:id", async (req, res) => {
  try { await repoDeleteLocation(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});


// --- Knowledge Base Management ---
router.get("/knowledge", async (req, res) => {
  try {
    const items = await getAllKnowledge();
    const mapped = items.map(item => ({
      id: item.id,
      pattern: item.question,
      reply: item.answer,
      tags: item.keywords ? JSON.parse(item.keywords) : [],
      active: item.active !== false
    }));
    res.json({ success: true, data: mapped });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/knowledge", async (req, res) => {
  try {
    const { pattern, reply, tags } = req.body;
    const item = await addKnowledge({ question: pattern, answer: reply, keywords: JSON.stringify(tags) });
    res.status(201).json({ success: true, data: item });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/knowledge/:id", async (req, res) => {
  try {
    const { pattern, reply, tags } = req.body;
    const updates = {};
    if (pattern) updates.question = pattern;
    if (reply) updates.answer = reply;
    if (tags) updates.keywords = JSON.stringify(tags);
    res.json({ success: true, data: await updateKnowledge(req.params.id, updates) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/knowledge/:id", async (req, res) => {
  try { await deleteKnowledge(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});


// --- Stats & Uploads (Keeping inline for now to avoid over-engineering) ---
// ... (Logic for stats preserved but condensed)
router.get("/stats/traffic", async (req, res) => {
  try {
    // 1. Calculate date range (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 2. Fetch raw logs from DB
    const logs = await prisma.accessLog.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        timestamp: true,
        role: true,
      },
    });

    // 3. Initialize data structure for last 7 days (ensure 0 values for empty days)
    const statsMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      statsMap[dateStr] = { date: dateStr, visitors: 0, internal: 0 };
    }

    // 4. Aggregate logs
    logs.forEach(log => {
      const dateStr = log.timestamp.toISOString().split('T')[0];
      if (statsMap[dateStr]) {
        if (log.role === 'admin' || log.role === 'staff') {
          statsMap[dateStr].internal++;
        } else {
          statsMap[dateStr].visitors++;
        }
      }
    });

    // 5. Sort by date ascending
    const data = Object.values(statsMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data });
  } catch (e) {
    console.error("Stats Error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/stats/trends", async (req, res) => {
  try {
    const queries = await prisma.searchQuery.findMany();
    const tagCounts = {};

    // Mapping chuẩn hóa (Key thường -> Label hiển thị)
    const validTags = {
      "beach": "Biển", "biển": "Biển",
      "culture": "Văn hóa", "văn hóa": "Văn hóa",
      "food": "Ẩm thực", "ẩm thực": "Ẩm thực",
      "theme-park": "Vui chơi giải trí", "vui chơi": "Vui chơi giải trí", "vui chơi giải trí": "Vui chơi giải trí",
      "nightlife": "Cuộc sống đêm", "cuộc sống đêm": "Cuộc sống đêm",
      "family": "Gia đình", "gia đình": "Gia đình"
    };

    queries.forEach(q => {
      try {
        const tags = JSON.parse(q.tags);
        if (Array.isArray(tags)) {
          tags.forEach(rawTag => {
            const normalizedLabel = validTags[rawTag.toLowerCase()];
            if (normalizedLabel) {
              tagCounts[normalizedLabel] = (tagCounts[normalizedLabel] || 0) + 1;
            }
          });
        }
      } catch (e) { }
    });

    const data = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    // Không cần slice 10 nữa vì chỉ có tối đa 6 loại

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Logs Endpoint
router.get("/access-logs", async (req, res) => {
  try {
    const logs = await prisma.accessLog.findMany({
      take: 50,
      orderBy: { timestamp: "desc" },
    });
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Re-implementing the robust Upload Logic here since it's route-specific
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.resolve(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsRoot, "misc");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "-")}`);
  }
});
const upload = multer({ storage });

router.post("/upload-image", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ success: true, url: `/uploads/misc/${req.file.filename}` });
});

export default router;
