// Admin Panel - Refactored with RBAC & Modular Components
import { useEffect, useState } from "react";
import { can, PERMISSIONS } from "../features/admin/utils/permissions";

// Components
import AdminLogin from "../features/admin/AdminLogin";
import AdminLayout from "../features/admin/AdminLayout";
import AdminDashboard from "../features/admin/components/AdminDashboard";
import AdminLocations from "../features/admin/components/AdminLocations";
import AdminChatLogs from "../features/admin/components/AdminChatLogs";
import AdminKnowledge from "../features/admin/components/AdminKnowledge";
import AdminAccounts from "../features/admin/components/AdminAccounts";
import ErrorBoundary from "../components/ErrorBoundary";

// Version Modal
function VersionHistoryModal({ versions, onClose }) {
  if (!versions) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-display text-xl font-bold text-gray-900">Lịch sử thay đổi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {versions.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">Chưa có lịch sử thay đổi.</p>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-6 last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white shadow-sm"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {new Date(v.changedAt).toLocaleString("vi-VN")}
                  </span>
                  <span className="text-xs font-medium text-gray-400">bởi {v.changedBy}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                  <p className="font-bold text-gray-900 mb-2">{v.action === "update" ? "Cập nhật thông tin" : "Tạo mới"}</p>
                  {v.changes && (
                    <ul className="space-y-1">
                      {Object.entries(v.changes).map(([key, val]) => (
                        <li key={key} className="flex gap-2">
                          <span className="font-mono text-xs text-gray-500 w-20">{key}:</span>
                          <span className="text-gray-900 font-medium truncate">{String(val)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  );
}

function AdminContent() {
  // API Config
  // Force port 3002 to match running backend (use IP to avoid localhost issues)
  const API_BASE = "/api";

  // State
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data State
  const [health, setHealth] = useState(null);
  const [locations, setLocations] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [trafficStats, setTrafficStats] = useState([]);
  const [trendStats, setTrendStats] = useState([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState([]);
  
  // Modal State
  const [viewingVersions, setViewingVersions] = useState(null);
  const [versions, setVersions] = useState([]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Fetch current user details
      const res = await fetch(`${API_BASE}/admin/me`, { credentials: "include" });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAuthed(true);
        setCurrentUser(data.admin);
        // Trigger data fetch with user permissions
        fetchInitialData(data.admin);
      } else {
        setAuthed(false);
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Auth check failed", e);
      setAuthed(false);
      setCurrentUser(null);
    }
  }

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    if (!authed) return;

    const interval = setInterval(() => {
      if (activeTab === "dashboard") {
        fetchTrafficStats();
        fetchAccessLogs();
        fetchTrendStats();
        fetchHealth();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [authed, activeTab]);

  // --- Auth Actions ---
  async function login(username, password) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");

      setAuthed(true);
      setCurrentUser(data.admin);
      await fetchInitialData(data.admin);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/admin/logout`, { method: "POST", credentials: "include" });
    } finally {
      setAuthed(false);
      setCurrentUser(null);
      setLocations([]);
      setChatLogs([]);
    }
  }

  // --- Data Fetching ---
  async function fetchInitialData(user) {
    await fetchHealth();
    if (can(user, PERMISSIONS.VIEW_DASHBOARD)) {
      await fetchTrafficStats();
      await fetchAccessLogs();
      await fetchTrendStats();
    }
    if (can(user, PERMISSIONS.VIEW_LOCATIONS)) await fetchLocations();
    if (can(user, PERMISSIONS.VIEW_LOGS)) await fetchChatLogs();
    if (can(user, PERMISSIONS.MANAGE_KNOWLEDGE)) await fetchKnowledge();
    if (can(user, PERMISSIONS.MANAGE_ACCOUNTS)) await fetchAdminAccounts();
  }

  async function fetchHealth() {
    try {
      const res = await fetch(`${API_BASE}/admin/health`, { credentials: "include" });
      if (res.ok) setHealth(await res.json());
    } catch {}
  }

  async function fetchTrafficStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats/traffic`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTrafficStats(data.data || []);
    } catch (e) { console.error(e); }
  }

  async function fetchTrendStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats/trends`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTrendStats(data.data || []);
    } catch (e) { console.error(e); }
  }

  async function fetchAccessLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/access-logs`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setAccessLogs(data.data || []);
    } catch (e) { console.error(e); }
  }

  async function fetchLocations() {
    try {
      const res = await fetch(`${API_BASE}/admin/locations`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setLocations(data.data || []);
    } catch (e) { console.error(e); }
  }

  async function fetchChatLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/chat-logs?limit=100`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setChatLogs(data.data || []);
    } catch (e) { console.error(e); }
  }

  async function fetchKnowledge() {
    try {
      const res = await fetch(`${API_BASE}/admin/knowledge`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setKnowledgeItems(data.data || []);
    } catch (e) { console.error(e); }
  }

  async function fetchAdminAccounts() {
    try {
      const res = await fetch(`${API_BASE}/admin/accounts`, { credentials: "include" });
      const data = await res.json();
      console.log("Fetched admin accounts:", data);
      if (res.ok) {
        if (Array.isArray(data.data)) {
           setAdminAccounts(data.data);
        } else {
           console.error("Admin accounts data is not an array:", data.data);
           setAdminAccounts([]);
        }
      }
    } catch (e) { console.error(e); }
  }

  async function fetchVersions(locationId) {
    try {
      const res = await fetch(`${API_BASE}/admin/locations/${locationId}/versions`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setVersions(data.data || []);
        setViewingVersions(locationId);
      }
    } catch (e) { alert(e.message); }
  }

  // --- Actions ---
  async function saveLocation(loc, mode) {
    const method = mode === "new" ? "POST" : "PUT";
    const url = mode === "new" ? `${API_BASE}/admin/locations` : `${API_BASE}/admin/locations/${mode}`;
    
    // Clean data
    const payload = {
      ...loc,
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      ticket: Number(loc.ticket),
      tags: typeof loc.tags === 'string' ? loc.tags.split(",").map(t => t.trim()).filter(Boolean) : loc.tags
    };

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      await fetchLocations();
    } catch (e) { alert(e.message); }
  }

  async function deleteLocation(id) {
    if (!confirm("Xóa địa điểm này?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/locations/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Xóa thất bại");
      await fetchLocations();
    } catch (e) { alert(e.message); }
  }

  async function clearLogs() {
    if (!confirm("Xóa toàn bộ logs?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/chat-logs`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Xóa thất bại");
      setChatLogs([]);
    } catch (e) { alert(e.message); }
  }

  async function saveKnowledgeItem(item) {
    try {
      const payload = {
        ...item,
        tags: typeof item.tags === 'string' ? item.tags.split(",").map(t => t.trim()).filter(Boolean) : item.tags,
        meta: item.patternType === "fuzzy" ? { threshold: Number(item.meta_threshold) } : {}
      };
      const res = await fetch(`${API_BASE}/admin/knowledge`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      await fetchKnowledge();
    } catch (e) { alert(e.message); }
  }

  async function updateKnowledgeItem(item) {
    try {
      const payload = {
        ...item,
        tags: typeof item.tags === 'string' ? item.tags.split(",").map(t => t.trim()).filter(Boolean) : item.tags,
        meta: item.patternType === "fuzzy" ? { threshold: Number(item.meta_threshold) } : {}
      };
      const res = await fetch(`${API_BASE}/admin/knowledge/${item.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      await fetchKnowledge();
    } catch (e) { alert(e.message); }
  }

  async function deleteKnowledgeItem(id) {
    if (!confirm("Xóa mục này?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/knowledge/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Xóa thất bại");
      await fetchKnowledge();
    } catch (e) { alert(e.message); }
  }

  async function createAccount(acc) {
    try {
      const res = await fetch(`${API_BASE}/admin/accounts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(acc),
      });
      if (!res.ok) throw new Error("Tạo tài khoản thất bại");
      await fetchAdminAccounts();
      alert("Tạo tài khoản thành công!");
    } catch (e) { alert(e.message); }
  }

  async function deleteAccount(id) {
    if (!confirm("Xóa tài khoản này?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/accounts/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Xóa thất bại");
      await fetchAdminAccounts();
    } catch (e) { alert(e.message); }
  }

  // --- Render Logic ---
  if (!authed) {
    return <AdminLogin onLogin={login} loading={loading} error={error} />;
  }

  // Define Tabs based on Permissions
  const tabs = [
    { id: "dashboard", label: "Dashboard", permission: PERMISSIONS.VIEW_DASHBOARD },
    { id: "locations", label: "Địa điểm", permission: PERMISSIONS.VIEW_LOCATIONS },
    { id: "knowledge", label: "AI Knowledge", permission: PERMISSIONS.MANAGE_KNOWLEDGE },
    { id: "chatlogs", label: "Chat Logs", permission: PERMISSIONS.VIEW_LOGS },
    { id: "accounts", label: "Tài khoản", permission: PERMISSIONS.MANAGE_ACCOUNTS },
  ].filter(tab => can(currentUser, tab.permission));

  // Redirect if active tab is not allowed
  if (!tabs.find(t => t.id === activeTab) && tabs.length > 0) {
    setActiveTab(tabs[0].id);
  }



  return (
    <AdminLayout 
      user={currentUser} 
      onLogout={logout} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {activeTab === "dashboard" && (
        <>
          {/* Debug Info */}
          <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200 text-xs font-mono text-yellow-800">
             <p><strong>Debug Info:</strong></p>
             <p>API_BASE: {API_BASE}</p>
             <p>Authed: {authed ? "Yes" : "No"}</p>
             <p>Traffic Stats: {trafficStats?.length} items</p>
             <p>Trend Stats: {trendStats?.length} items</p>
             <p>Access Logs: {accessLogs?.length} items</p>
             <p>Last Error: {error || "None"}</p>
          </div>
          <AdminDashboard 
            accessLogs={accessLogs} 
            health={health} 
            trafficStats={trafficStats} 
            trendStats={trendStats} 
          />
        </>
      )}
      
      {activeTab === "locations" && (
        <AdminLocations 
          locations={locations} 
          user={currentUser}
          onSave={saveLocation}
          onDelete={deleteLocation}
          onFetchVersions={fetchVersions}
        />
      )}

      {activeTab === "knowledge" && (
        <AdminKnowledge 
          knowledgeItems={knowledgeItems}
          user={currentUser}
          onSave={saveKnowledgeItem}
          onUpdate={updateKnowledgeItem}
          onDelete={deleteKnowledgeItem}
        />
      )}

      {activeTab === "chatlogs" && (
        <AdminChatLogs 
          chatLogs={chatLogs}
          user={currentUser}
          onClearLogs={clearLogs}
          onFlagEdit={() => {}} // Simplified for now
        />
      )}

      {activeTab === "accounts" && (
        <AdminAccounts 
          accounts={adminAccounts}
          user={currentUser}
          onCreate={createAccount}
          onDelete={deleteAccount}
        />
      )}

      {viewingVersions && (
        <VersionHistoryModal 
          versions={versions} 
          onClose={() => setViewingVersions(null)} 
        />
      )}
    </AdminLayout>
  );
}