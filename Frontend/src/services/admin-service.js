/**
 * =================================================================================================
 * ADMIN SERVICE - QUẢN LÝ API ADMIN
 * =================================================================================================
 * 
 * Service này chịu trách nhiệm gọi các API backend liên quan đến trang Admin.
 * Giúp tách biệt logic gọi mạng (Network Calls) khỏi giao diện (UI).
 */

const API_BASE = "/api/admin";

/**
 * =================================================================================================
 * 1. XÁC THỰC (AUTHENTICATION)
 * =================================================================================================
 */

export async function checkAuth() {
    const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
    const data = await res.json();
    if (res.ok && data.success) return data.admin;
    return null;
}

export async function login(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");
    return data.admin;
}

export async function logout() {
    await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
}


/**
 * =================================================================================================
 * 2. DASHBOARD DATA (STATS & LOGS)
 * =================================================================================================
 */

export async function fetchHealth() {
    const res = await fetch(`${API_BASE}/health`, { credentials: "include" });
    if (res.ok) return await res.json();
    return null;
}

export async function fetchTrafficStats() {
    const res = await fetch(`${API_BASE}/stats/traffic`, { credentials: "include" });
    const data = await res.json();
    return data.data || [];
}

export async function fetchTrendStats() {
    const res = await fetch(`${API_BASE}/stats/trends`, { credentials: "include" });
    const data = await res.json();
    return data.data || [];
}

export async function fetchAccessLogs() {
    const res = await fetch(`${API_BASE}/access-logs`, { credentials: "include" });
    const data = await res.json();
    return data.data || [];
}


/**
 * =================================================================================================
 * 3. QUẢN LÝ DỮ LIỆU (LOCATIONS, KNOWLEDGE, ACCOUNTS)
 * =================================================================================================
 */

// --- Locations ---
export async function getLocations() {
    const res = await fetch(`${API_BASE}/locations`, { credentials: "include" });
    const data = await res.json();
    return data.data || [];
}

export async function saveLocation(loc, mode) {
    const method = mode === "new" ? "POST" : "PUT";
    const url = mode === "new" ? `${API_BASE}/locations` : `${API_BASE}/locations/${mode}`;

    // Format payload
    const payload = {
        ...loc,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        ticket: Number(loc.ticket),
        tags: typeof loc.tags === 'string' ? loc.tags.split(",").map(t => t.trim()).filter(Boolean) : loc.tags
    };

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Lưu địa điểm thất bại");
}

export async function deleteLocation(id) {
    const res = await fetch(`${API_BASE}/locations/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error("Xóa địa điểm thất bại");
}

export async function getLocationVersions(id) {
    const res = await fetch(`${API_BASE}/locations/${id}/versions`, { credentials: "include" });
    const data = await res.json();
    return data.data || [];
}

// --- Knowledge Base ---
export async function getKnowledgeItems() {
    const res = await fetch(`${API_BASE}/knowledge`, { credentials: "include" });
    const data = await res.json();
    return data.data || [];
}

export async function saveKnowledgeItem(item, isUpdate = false) {
    const url = isUpdate ? `${API_BASE}/knowledge/${item.id}` : `${API_BASE}/knowledge`;
    const method = isUpdate ? "PUT" : "POST";

    const payload = {
        ...item,
        tags: typeof item.tags === 'string' ? item.tags.split(",").map(t => t.trim()).filter(Boolean) : item.tags,
        meta: item.patternType === "fuzzy" ? { threshold: Number(item.meta_threshold) } : {}
    };

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(isUpdate ? "Cập nhật thất bại" : "Thêm mới thất bại");
}

export async function deleteKnowledgeItem(id) {
    const res = await fetch(`${API_BASE}/knowledge/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error("Xóa kiến thức thất bại");
}

// --- Accounts ---
export async function getAccounts() {
    const res = await fetch(`${API_BASE}/accounts`, { credentials: "include" });
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
}

export async function createAccount(acc) {
    const res = await fetch(`${API_BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(acc),
    });
    if (!res.ok) throw new Error("Tạo tài khoản thất bại");
}

export async function deleteAccount(id) {
    const res = await fetch(`${API_BASE}/accounts/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error("Xóa tài khoản thất bại");
}

export default {
    checkAuth, login, logout,
    fetchHealth, fetchTrafficStats, fetchAccessLogs, fetchTrendStats,
    getLocations, saveLocation, deleteLocation, getLocationVersions,
    getKnowledgeItems, saveKnowledgeItem, deleteKnowledgeItem,
    getAccounts, createAccount, deleteAccount
};
