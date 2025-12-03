// file: backend/routes/adminRoutes.js

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
console.log("Loading admin routes...");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Public: Admin login with username/password ---
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Verify credentials
    const admin = await verifyAdmin(username, password);
    if (!admin) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate session token (simple: just use admin ID + timestamp)
    const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString(
      "base64"
    );

    // Set httpOnly cookie
    res.cookie?.("admin_token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/api/admin",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });
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
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie?.("admin_token", { path: "/api/admin" });
  if (!res.clearCookie) {
    res.setHeader("Set-Cookie", "admin_token=; Path=/api/admin; Max-Age=0");
  }
  return res.json({ success: true });
});

// Apply auth for the rest
// Debug route
router.get("/ping", (req, res) => res.json({ message: "Admin Router Alive" }));

// Get current admin info
router.get("/me", adminAuth, (req, res) => {
  if (!req.admin) return res.status(401).json({ error: "Not authenticated" });
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

// Apply auth for the rest
router.use(adminAuth);

// --- Admin Account Management Routes (Protected) ---
// Get all admin accounts
router.get("/accounts", async (req, res) => {
  try {
    const admins = await getAllAdmins();
    return res.json({ success: true, data: admins });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create new admin account
router.post("/accounts", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const newAdmin = await createAdmin({ username, password, email, role });
    return res.json({ success: true, data: newAdmin });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Update admin account
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

// Delete (deactivate) admin account
router.delete("/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAdmin(id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Change password
router.post("/change-password", async (req, res) => {
  try {
    const { adminId, oldPassword, newPassword } = req.body;

    if (!adminId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields required" });
    }

    await changePassword(adminId, oldPassword, newPassword);
    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// --- Location Management Routes (Protected) ---

// --- Location Management Routes (Protected) ---
// Note: Validation is now handled in the service or can be added here if needed.


// GET all locations (with optional version history fetch param ?versions=true)
router.get("/locations", async (req, res) => {
  try {
    const all = await repoGetAllLocations();
    return res.json({ success: true, data: all });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});



// POST create location (supports reason)
router.post("/locations", async (req, res) => {
  try {
    const loc = req.body || {};
    // Basic validation could be here or in service
    const created = await repoCreateLocation(loc);
    return res.status(201).json({ success: true, data: created });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// PUT update location (supports reason field)
router.put("/locations/:id", async (req, res) => {
  try {
    const updates = req.body;
    const updated = await repoUpdateLocation(req.params.id, updates);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// DELETE location (supports reason)
router.delete("/locations/:id", async (req, res) => {
  try {
    await repoDeleteLocation(req.params.id);
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Health endpoint
router.get("/health", async (req, res) => {
  try {
    const all = await repoGetAllLocations();
    res.json({
      success: true,
      ts: new Date().toISOString(),
      count: all.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET chat logs (last 50 interactions)
router.get("/chat-logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await getRecentChatLogs(limit);
    res.json({ success: true, data: logs, count: logs.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE chat logs (clear all)
router.delete("/chat-logs", async (req, res) => {
  try {
    await clearChatLogs();
    res.json({ success: true, message: "Chat logs cleared" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Stats (Protected) ---
// import prisma from "../utils/prisma.js"; // Moved to top

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
        method: true // Added method
      }
    });

    // Aggregate
    const stats = {};
    logs.forEach(log => {
      // Convert to Vietnam Time (UTC+7)
      const date = new Date(new Date(log.timestamp).getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
        
      if (!stats[date]) stats[date] = { date, visitors: 0, internal: 0 };
      
      const role = log.role || 'guest';
      if (['admin', 'manager', 'staff', 'SUPER_ADMIN'].includes(role)) {
        stats[date].internal++;
      } else {
        // Only count "VISIT" method as a visitor session
        if (log.method === 'VISIT') {
          stats[date].visitors++;
        }
      }
    });

    // Sort by date
    const result = Object.values(stats).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

    // Convert to array and sort
    const result = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/access-logs", async (req, res) => {
  try {
    const logs = await prisma.accessLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50
    });
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Knowledge Management (Protected) ---
router.get("/knowledge", async (req, res) => {
  try {
    const items = await getAllKnowledge();
    res.json({ success: true, data: items, count: items.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/knowledge", async (req, res) => {
  try {
    const { pattern, reply, patternType, tags, source, meta, active } =
      req.body || {};
    const createdBy = req.adminId || "admin";
    
    // Map to Prisma model
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

// --- Image Upload (Protected) ---
// Store under ../uploads/<areaSlug>/filename
const uploadsRoot = path.resolve(__dirname, "../uploads");

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const area = req.query.area || "misc";
    const areaSlug = slugify(area);
    const dir = path.join(uploadsRoot, areaSlug);
    fs.mkdirSync(dir, { recursive: true });
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
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error("Only image uploads are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post("/upload-image", upload.single("file"), (req, res) => {
  try {
    const area = req.query.area || "misc";
    const areaSlug = slugify(area);
    const relPath = `/uploads/${areaSlug}/${req.file.filename}`;
    return res.status(201).json({ success: true, url: relPath, path: relPath });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Upload failed" });
  }
});

export default router;
