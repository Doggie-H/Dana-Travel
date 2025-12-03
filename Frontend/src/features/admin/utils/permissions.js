/**
 * Role-Based Access Control (RBAC) Definitions
 */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  STAFF: "staff",
};

export const PERMISSIONS = {
  // Account Management
  MANAGE_ACCOUNTS: "manage_accounts", // Create/Delete admins
  
  // System
  VIEW_LOGS: "view_logs",
  DELETE_LOGS: "delete_logs",
  VIEW_DASHBOARD: "view_dashboard",
  
  // Content (Locations)
  VIEW_LOCATIONS: "view_locations",
  CREATE_LOCATION: "create_location",
  EDIT_LOCATION: "edit_location",
  DELETE_LOCATION: "delete_location",
  
  // Knowledge Base (AI)
  MANAGE_KNOWLEDGE: "manage_knowledge",

  // New Features
  MANAGE_CATEGORIES: "manage_categories",
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_MENUS: "manage_menus",
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.MANAGE_ACCOUNTS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.DELETE_LOGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.CREATE_LOCATION,
    PERMISSIONS.EDIT_LOCATION,
    PERMISSIONS.DELETE_LOCATION,
    PERMISSIONS.DELETE_LOCATION,
    PERMISSIONS.MANAGE_KNOWLEDGE,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_MENUS,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.CREATE_LOCATION,
    PERMISSIONS.EDIT_LOCATION,
    PERMISSIONS.MANAGE_KNOWLEDGE,
    // Cannot manage accounts or delete logs/locations
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.EDIT_LOCATION,
    // Can only view and edit existing locations
  ],
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - The admin user object
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export function can(user, permission) {
  if (!user || !user.role) return false;
  
  // Normalize role string just in case
  const role = user.role.toLowerCase();
  
  // Super admin fallback (if role name varies)
  if (role === "admin" || role === "superadmin") return true;

  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Get readable role name
 */
export function getRoleLabel(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN: return "Quản Trị Viên Cấp Cao";
    case ROLES.MANAGER: return "Quản Lý";
    case ROLES.STAFF: return "Nhân Viên";
    default: return "Khách";
  }
}

export function getRoleBadgeColor(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN: return "bg-purple-100 text-purple-800 border-purple-200";
    case ROLES.MANAGER: return "bg-blue-100 text-blue-800 border-blue-200";
    case ROLES.STAFF: return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-50 text-gray-500";
  }
}
