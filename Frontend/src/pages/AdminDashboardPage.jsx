/**
 * =================================================================================================
 * ADMIN DASHBOARD PAGE
 * =================================================================================================
 * 
 * Trang quản trị chính của hệ thống.
 * Nhiệm vụ:
 * 1. Quản lý trạng thái xác thực (Login/Logout).
 * 2. Điều hướng giữa các Tab chức năng.
 * 3. Kết nối UI với dữ liệu từ AdminService.
 */

import { useEffect, useState, useCallback } from "react";
import { can, PERMISSIONS } from "../features/admin/utils/permission-util";
import AdminService from "../services/admin-service";

// Components
import ErrorBoundary from "../components/ErrorBoundary";
import AdminLogin from "../features/admin/AdminLogin";
import AdminLayout from "../features/admin/AdminLayout";
import AdminDashboard from "../features/admin/components/AdminDashboard";
import AdminLocations from "../features/admin/components/AdminLocations";
import AdminKnowledge from "../features/admin/components/AdminKnowledge";
import AdminAccounts from "../features/admin/components/AdminAccounts";

/**
 * =================================================================================================
 * MAIN COMPONENT
 * =================================================================================================
 */
export default function AdminPage() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  );
}

function AdminContent() {
  // --- STATE LAYER ---
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data State
  const [data, setData] = useState({
    health: null,
    traffic: [],
    logs: [],
    trends: [],
    locations: [],
    knowledge: [],
    accounts: []
  });

  // Modal & Edit State
  const [viewingVersions, setViewingVersions] = useState(null);
  const [versions, setVersions] = useState([]);
  const [prefillKnowledge, setPrefillKnowledge] = useState(null);

  // Loading & Error State
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState(null);


  // --- INITIALIZATION ---
  useEffect(() => {
    verifySession();
  }, []);

  // --- POLLING LAYER (Real-time updates) ---
  useEffect(() => {
    if (!authed) return;

    // Load data khi chuyển tab
    loadTabSpecificData(activeTab);

    // Auto-refresh Dashboard realtime
    const interval = setInterval(() => {
      if (activeTab === "dashboard") refreshDashboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, [authed, activeTab]);


  // --- LOGIC: AUTHENTICATION ---
  
  async function verifySession() {
    try {
      const user = await AdminService.checkAuth();
      if (user) {
        setAuthed(true);
        setCurrentUser(user);
        refreshDashboardData(); // Load ngay dữ liệu ban đầu
      } else {
        setAuthed(false);
      }
    } catch (e) {
      console.error("Session Check Failed:", e);
    } finally {
      setIsAuthChecking(false);
    }
  }

  async function handleLogin(username, password) {
    setBusy(true);
    setLoginError(null);
    try {
      const user = await AdminService.login(username, password);
      setAuthed(true);
      setCurrentUser(user);
      refreshDashboardData();
    } catch (e) {
      setLoginError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await AdminService.logout();
    setAuthed(false);
    setCurrentUser(null);
    setData({ health: null, traffic: [], logs: [], trends: [], locations: [], knowledge: [], accounts: [] });
  }


  // --- LOGIC: DATA FETCHING ---

  const refreshDashboardData = useCallback(async () => {
    try {
      const [health, traffic, logs, trends] = await Promise.all([
        AdminService.fetchHealth(),
        AdminService.fetchTrafficStats(),
        AdminService.fetchAccessLogs(),
        AdminService.fetchTrendStats()
      ]);
      setData(prev => ({ ...prev, health, traffic, logs, trends }));
    } catch (e) { console.warn("Dashboard sync error", e); }
  }, []);

  async function loadTabSpecificData(tab) {
    if (!currentUser) return;
    try {
      if (tab === "locations" && can(currentUser, PERMISSIONS.VIEW_LOCATIONS)) {
        const locations = await AdminService.getLocations();
        setData(prev => ({ ...prev, locations }));
      }
      if (tab === "knowledge" && can(currentUser, PERMISSIONS.MANAGE_KNOWLEDGE)) {
        const knowledge = await AdminService.getKnowledgeItems();
        setData(prev => ({ ...prev, knowledge }));
      }
      if (tab === "accounts" && can(currentUser, PERMISSIONS.MANAGE_ACCOUNTS)) {
        const accounts = await AdminService.getAccounts();
        setData(prev => ({ ...prev, accounts }));
      }
    } catch (e) { console.error(`Failed to load data for tab ${tab}`, e); }
  }


  // --- LOGIC: ACTIONS (CRUD) ---

  async function handleLocationAction(action, payload) {
    try {
      if (action === "save") {
        await AdminService.saveLocation(payload.data, payload.mode);
        loadTabSpecificData("locations");
      } else if (action === "delete") {
        if (!confirm("Xóa địa điểm này?")) return;
        await AdminService.deleteLocation(payload.id);
        loadTabSpecificData("locations");
      } else if (action === "versions") {
        const hist = await AdminService.getLocationVersions(payload.id);
        setVersions(hist);
        setViewingVersions(payload.id);
      }
    } catch (e) { alert(e.message); }
  }

  async function handleKnowledgeAction(action, payload) {
    try {
      if (action === "save") {
        await AdminService.saveKnowledgeItem(payload.item, false);
      } else if (action === "update") {
        await AdminService.saveKnowledgeItem(payload.item, true);
      } else if (action === "delete") {
        if (!confirm("Xóa mục này?")) return;
        await AdminService.deleteKnowledgeItem(payload.id);
      }
      loadTabSpecificData("knowledge");
    } catch (e) { alert(e.message); }
  }

  async function handleAccountAction(action, payload) {
    try {
      if (action === "create") {
        await AdminService.createAccount(payload.account);
        alert("Tạo tài khoản thành công!");
      } else if (action === "delete") {
        if (!confirm("Xóa tài khoản này?")) return;
        await AdminService.deleteAccount(payload.id);
      }
      loadTabSpecificData("accounts");
    } catch (e) { alert(e.message); }
  }


  // --- RENDER ---

  if (isAuthChecking) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  if (!authed) {
    return <AdminLogin onLogin={handleLogin} loading={busy} error={loginError} />;
  }

  // Define Tabs based on Permissions
  const tabs = [
    { id: "dashboard", label: "Dashboard", permission: PERMISSIONS.VIEW_DASHBOARD },
    { id: "locations", label: "Địa điểm", permission: PERMISSIONS.VIEW_LOCATIONS },
    { id: "knowledge", label: "AI Knowledge", permission: PERMISSIONS.MANAGE_KNOWLEDGE },
    { id: "accounts", label: "Tài khoản", permission: PERMISSIONS.MANAGE_ACCOUNTS },
  ].filter(tab => can(currentUser, tab.permission));

  // Auto-switch tab if current one is invalid
  if (!tabs.find(t => t.id === activeTab) && tabs.length > 0) setActiveTab(tabs[0].id);

  return (
    <AdminLayout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      tabs={tabs}
    >
      {activeTab === "dashboard" && (
        <AdminDashboard 
          accessLogs={data.logs} 
          health={data.health} 
          trafficStats={data.traffic} 
          trendStats={data.trends} 
        />
      )}
      
      {activeTab === "locations" && (
        <AdminLocations 
          locations={data.locations} 
          user={currentUser}
          onSave={(loc, mode) => handleLocationAction("save", { data: loc, mode })}
          onDelete={(id) => handleLocationAction("delete", { id })}
          onFetchVersions={(id) => handleLocationAction("versions", { id })}
        />
      )}

      {activeTab === "knowledge" && (
        <AdminKnowledge 
          knowledgeItems={data.knowledge}
          user={currentUser}
          onSave={(item) => handleKnowledgeAction("save", { item })}
          onUpdate={(item) => handleKnowledgeAction("update", { item })}
          onDelete={(id) => handleKnowledgeAction("delete", { id })}
          prefillData={prefillKnowledge}
          onPrefillConsumed={() => setPrefillKnowledge(null)}
        />
      )}

      {activeTab === "accounts" && (
        <AdminAccounts 
          accounts={data.accounts}
          user={currentUser}
          onCreate={(acc) => handleAccountAction("create", { account: acc })}
          onDelete={(id) => handleAccountAction("delete", { id })}
        />
      )}

      {/* Helper Modals */}
      {viewingVersions && (
        <VersionHistoryModal 
          versions={versions} 
          onClose={() => setViewingVersions(null)} 
        />
      )}
    </AdminLayout>
  );
}

// Sub-component for versions
function VersionHistoryModal({ versions, onClose }) {
  if (!versions) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-display text-xl font-bold text-gray-900">Lịch sử thay đổi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {versions.length === 0 ? <p className="text-center text-gray-400">Chưa có lịch sử.</p> : versions.map(v => (
            <div key={v.id} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-6 last:pb-0">
               <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white shadow-sm" />
               <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{new Date(v.changedAt).toLocaleString("vi-VN")}</span>
                 <span className="text-xs font-medium text-gray-400">bởi {v.changedBy}</span>
               </div>
               <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                 <p className="font-bold text-gray-900 mb-2">{v.action === "update" ? "Cập nhật" : "Tạo mới"}</p>
                 {v.changes && <ul className="space-y-1">{Object.entries(v.changes).map(([k, val]) => <li key={k} className="flex gap-2"><span className="font-mono text-xs text-gray-500 w-20">{k}:</span><span className="text-gray-900 truncate">{String(val)}</span></li>)}</ul>}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}