// file: backend/middleware/adminAuth.js

/**
 * Admin authentication middleware
 * Accepts: 1) Session tokens from login (base64 encoded)
 *          2) Legacy ADMIN_TOKEN from .env for backward compatibility
 */

export function adminAuth(req, res, next) {
  // 1) Header Bearer token
  let token = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");
  // 2) Or cookie `admin_token`
  if (!token) {
    const cookieHeader = req.headers["cookie"] || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          const idx = c.indexOf("=");
          const k = decodeURIComponent(idx >= 0 ? c.slice(0, idx) : c);
          const v = decodeURIComponent(idx >= 0 ? c.slice(idx + 1) : "");
          return [k, v];
        })
    );
    if (cookies.admin_token) token = cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if it's a session token (base64 encoded with format "adminID:timestamp")
  // or legacy ADMIN_TOKEN from .env
  const legacyToken = process.env.ADMIN_TOKEN || "";

  // Accept either session token or legacy token
  let isValid = false;

  // Try legacy token first
  if (legacyToken && token === legacyToken) {
    isValid = true;
  } else {
    // Try to decode session token
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      // Format: "adminID:timestamp"
      if (decoded.includes(":")) {
        const [adminId, timestamp] = decoded.split(":");
        // Basic validation: check if timestamp is reasonable (within last 8 hours)
        const now = Date.now();
        const tokenTime = parseInt(timestamp);
        const eightHours = 8 * 60 * 60 * 1000;
        if (adminId && tokenTime && now - tokenTime < eightHours) {
          isValid = true;
          // Optionally attach admin info to request
          req.adminId = adminId;
        }
      }
    } catch (e) {
      // Not a valid base64 token, will fail below
    }
  }

  if (!isValid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

export default { adminAuth };
