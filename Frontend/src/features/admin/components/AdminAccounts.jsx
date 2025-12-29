/**
 * Component quản lý tài khoản Admin.
 * Hỗ trợ tạo mới, xóa và phân quyền (Staff, Manager, Admin).
 */

import { useState } from "react";
import { can, PERMISSIONS, ROLES } from "../utils/permission-util";

export default function AdminAccounts({
  accounts,
  user,
  onCreate,
  onDelete,
}) {
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({
    username: "",
    password: "",
    role: ROLES.STAFF,
  });

  // Kiểm tra quyền truy cập: Chỉ Super Admin mới được vào
  if (!can(user, PERMISSIONS.MANAGE_ACCOUNTS)) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Truy cập bị từ chối</h3>
        <p className="text-gray-500 text-sm mt-1">Chỉ Super Admin mới có quyền quản lý tài khoản.</p>
      </div>
    );
  }

  // Bắt đầu quy trình tạo mới
  function startCreate() {
    setEditingAccount("new");
    setAccountForm({
      username: "",
      password: "",
      role: ROLES.STAFF,
    });
  }

  function cancelEdit() {
    setEditingAccount(null);
  }

  function handleCreate() {
    onCreate(accountForm);
    cancelEdit();
  }

  return (
    <div className="space-y-6">
      {/* --- TOOLBAR --- */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Danh sách nhân sự</h3>
        <button
          onClick={startCreate}
          className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
          Thêm tài khoản
        </button>
      </div>

      {/* --- EDITOR FORM --- */}
      {editingAccount && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl animate-fadeIn">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-display font-bold text-gray-900">Thêm nhân sự mới</h3>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cột trái: Thông tin đăng nhập */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Cột phải: Phân quyền */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Vai trò
                </label>
                <select
                  value={accountForm.role}
                  onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                >
                  <option value={ROLES.STAFF}>Nhân viên (Staff)</option>
                  <option value={ROLES.MANAGER}>Quản lý (Manager)</option>
                  <option value={ROLES.ADMIN}>Quản Trị Viên (Admin)</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  * Staff: Chỉ xem/sửa địa điểm.<br/>
                  * Manager: Quản lý địa điểm & AI.<br/>
                  * Admin: Toàn quyền hệ thống.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
            <button onClick={cancelEdit} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Hủy bỏ</button>
            <button onClick={handleCreate} className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transform hover:scale-105 transition-all">Tạo tài khoản</button>
          </div>
        </div>
      )}

      {/* --- ACCOUNTS LIST --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Đăng nhập cuối</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(accounts) && accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {acc.username}
                    {user && acc.username === user.username && (
                      <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">YOU</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider 
                      ${acc.role === ROLES.ADMIN ? "bg-purple-100 text-purple-800" : 
                        acc.role === ROLES.MANAGER ? "bg-blue-100 text-blue-800" : 
                        "bg-gray-100 text-gray-800"}`}>
                      {acc.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                    {acc.lastLogin ? new Date(acc.lastLogin).toLocaleString("vi-VN") : "Chưa đăng nhập"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Không cho phép xóa chính mình hoặc tài khoản admin gốc */}
                    {user && acc.username !== "admin" && acc.username !== user.username && (
                      <button
                        onClick={() => onDelete(acc.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa tài khoản"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
