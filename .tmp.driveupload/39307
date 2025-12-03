import prisma from "../utils/prisma.js";

export const requestLogger = async (req, res, next) => {
  // 1. Static & Health Checks (Always Skip)
  if (req.url.startsWith("/uploads") || req.url.startsWith("/api/admin/health")) {
    return next();
  }

  // 2. Define Noisy Endpoints (Polling) - Skip logging these
  const noisyEndpoints = [
    "/api/admin/stats",      // Traffic & Trends polling
    "/api/admin/access-logs", // Log polling
    "/api/admin/chat-logs",   // Chat log polling
  ];
  if (noisyEndpoints.some(p => req.originalUrl.startsWith(p))) {
    return next();
  }

  res.on("finish", async () => {
    try {
      const method = req.method;
      
      // 3. Smart Logging Logic
      // - Always log mutations (POST, PUT, DELETE, PATCH)
      // - IGNORE ALL GET REQUESTS (Handled by client-side session tracking /api/log-visit)
      if (method === "GET") {
        return;
      }

      // --- Identity Resolution (Copy from previous) ---
      let username = null;
      let role = "guest";

      let token = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
      if (!token) {
        const cookieHeader = req.headers["cookie"] || "";
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map(c => {
            const [k, v] = c.trim().split("=");
            return [k, decodeURIComponent(v)];
          })
        );
        if (cookies.admin_token) token = cookies.admin_token;
      }

      if (token) {
        try {
          const decoded = Buffer.from(token, "base64").toString("utf8");
          if (decoded.includes(":")) {
            const [adminId, timestamp] = decoded.split(":");
            if (adminId && Date.now() - parseInt(timestamp) < 8 * 60 * 60 * 1000) {
              const admin = await prisma.admin.findUnique({
                where: { id: adminId },
                select: { username: true, role: true }
              });
              if (admin) {
                username = admin.username;
                role = admin.role;
              }
            }
          } else if (token === process.env.ADMIN_TOKEN) {
             role = "SUPER_ADMIN";
             username = "system_admin";
          }
        } catch (e) {}
      }

      // 4. Create Log
      await prisma.accessLog.create({
        data: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          endpoint: req.originalUrl,
          method: method,
          username: username,
          role: role,
        },
      });
    } catch (error) {
      console.error("Error logging request:", error);
    }
  });

  next();
};
