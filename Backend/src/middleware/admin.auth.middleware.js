/**
 * Middleware xác thực Admin.
 * Kiểm tra token từ header hoặc cookie để xác định quyền truy cập.
 */

export function adminAuth(req, res, next) {
  // 1. Lấy token từ Header (Bearer Token)
  let token = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");

  // 2. Nếu không có trong Header, tìm trong Cookie `admin_token`
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

  // Nếu vẫn không tìm thấy token -> Trả về lỗi 401 Unauthorized
  if (!token) {
    return res.status(401).json({ error: "Chưa xác thực (Unauthorized)" });
  }

  // 3. Kiểm tra tính hợp lệ của Token
  const legacyToken = process.env.ADMIN_TOKEN || "";
  let isValid = false;

  // Trường hợp 1: Token tĩnh (Legacy/Super Admin)
  if (legacyToken && token === legacyToken) {
    isValid = true;
  } else {
    // Trường hợp 2: Session Token (Base64 encoded "adminID:timestamp")
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      
      if (decoded.includes(":")) {
        const [adminId, timestamp] = decoded.split(":");
        
        // Kiểm tra thời hạn token (7 ngày)
        const now = Date.now();
        const tokenTime = parseInt(timestamp);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        if (adminId && tokenTime && now - tokenTime < sevenDays) {
          isValid = true;
          // Gắn thông tin Admin ID vào request để các middleware/controller sau sử dụng
          req.adminId = adminId;
        }
      }
    } catch (e) {
      // Token không đúng định dạng base64 -> Bỏ qua, isValid vẫn là false
    }
  }

  if (!isValid) {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }

  // Token hợp lệ, cho phép đi tiếp
  next();
}

export default { adminAuth };
