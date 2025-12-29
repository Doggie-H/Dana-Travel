/**
 * ROLE-BASED ACCESS CONTROL (RBAC) DEFINITIONS
 * 
 * Định nghĩa hệ thống phân quyền cho ứng dụng.
 * Quản lý các vai trò (Roles) và quyền hạn (Permissions) tương ứng.
 */

// --- ĐỊNH NGHĨA VAI TRÒ (ROLES) ---
export const ROLES = {
  ADMIN: "admin",             // Quản trị viên (Toàn quyền)
  MANAGER: "manager",         // Quản lý (Giới hạn một số quyền hệ thống)
  STAFF: "staff",             // Nhân viên (Chỉ xem và chỉnh sửa nội dung cơ bản)
};

// --- ĐỊNH NGHĨA QUYỀN HẠN (PERMISSIONS) ---
export const PERMISSIONS = {
  // Quản lý tài khoản Admin
  MANAGE_ACCOUNTS: "manage_accounts", // Tạo, xóa, phân quyền admin khác

  // Quản trị hệ thống
  VIEW_DASHBOARD: "view_dashboard",   // Xem thống kê tổng quan

  // Quản lý nội dung (Địa điểm)
  VIEW_LOCATIONS: "view_locations",   // Xem danh sách địa điểm
  CREATE_LOCATION: "create_location", // Thêm địa điểm mới
  EDIT_LOCATION: "edit_location",     // Sửa thông tin địa điểm
  DELETE_LOCATION: "delete_location", // Xóa địa điểm

  // Quản lý AI Chatbot
  MANAGE_KNOWLEDGE: "manage_knowledge", // Dạy AI, sửa câu trả lời mẫu
};

// --- BẢNG PHÂN QUYỀN (MATRIX) ---
const ROLE_PERMISSIONS = {
  // Admin: Có tất cả các quyền
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_ACCOUNTS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.CREATE_LOCATION,
    PERMISSIONS.EDIT_LOCATION,
    PERMISSIONS.DELETE_LOCATION,
    PERMISSIONS.MANAGE_KNOWLEDGE,
  ],

  // Manager: Quản lý nội dung và AI, không can thiệp hệ thống sâu (Accounts)
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.CREATE_LOCATION,
    PERMISSIONS.EDIT_LOCATION,
    PERMISSIONS.MANAGE_KNOWLEDGE,
  ],

  // Staff: Chỉ làm việc với dữ liệu địa điểm có sẵn
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.EDIT_LOCATION,
  ],
};

/**
 * Kiểm tra xem User có quyền thực hiện hành động cụ thể hay không.
 * 
 * @param {Object} user - Đối tượng user hiện tại (chứa thông tin role).
 * @param {string} permission - Quyền cần kiểm tra (lấy từ constant PERMISSIONS).
 * @returns {boolean} - True nếu có quyền, False nếu không.
 */
export function can(user, permission) {
  if (!user || !user.role) return false;

  // Chuẩn hóa role string để tránh lỗi case-sensitive
  const role = user.role.toLowerCase();

  // Admin (và Superadmin cũ) luôn có full quyền
  if (role === ROLES.ADMIN) return true;

  // Lấy danh sách quyền của role tương ứng
  const permissions = ROLE_PERMISSIONS[role] || [];

  // Kiểm tra xem quyền yêu cầu có trong danh sách không
  return permissions.includes(permission);
}

/**
 * Lấy tên hiển thị tiếng Việt của Role.
 * Dùng để hiển thị trên UI (Badge, Table...).
 */
export function getRoleLabel(role) {
  switch (role) {
    case ROLES.ADMIN: return "Quản Trị Viên";
    case "admin": return "Quản Trị Viên"; // Fallback cho string raw
    case ROLES.MANAGER: return "Quản Lý";
    case ROLES.STAFF: return "Nhân Viên";
    default: return "Khách";
  }
}

/**
 * Lấy class màu sắc CSS (Tailwind) cho Badge của Role.
 * Giúp phân biệt trực quan các cấp độ tài khoản.
 */
export function getRoleBadgeColor(role) {
  switch (role) {
    case ROLES.ADMIN:
    case "admin":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case ROLES.MANAGER: return "bg-blue-100 text-blue-800 border-blue-200";
    case ROLES.STAFF: return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-50 text-gray-500";
  }
}
