/**
 * =================================================================================================
 * FILE: AdminLocations.jsx
 * MỤC ĐÍCH: Quản lý danh sách địa điểm ăn chơi.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Cuốn sổ tay địa điểm". Quy định đi đâu, ăn gì.
 * 1. Danh sách: Liệt kê tất cả quán xá, danh lam thắng cảnh.
 * 2. Bộ lọc: Tìm nhanh xem quán nào bán mỳ quảng, quán nào có máy lạnh (Indoor).
 * 3. Thêm/Sửa: Nhập thông tin chi tiết (Giá vé, Giờ mở cửa, Tọa độ bản đồ).
 * 4. Lịch sử: Ai lỡ tay xóa nhầm thì có thể xem lại bản cũ (Versioning).
 * =================================================================================================
 */

import { useRef, useState } from "react";
import { can, PERMISSIONS } from "../utils/permissions";

export default function AdminLocations({
  locations,
  user,
  onSave,
  onDelete,
  onFetchVersions,
  loading,
}) {
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // State lưu trữ dữ liệu form
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "attraction",
    area: "",
    lat: "",
    lng: "",
    ticket: "",
    indoor: false,
    priceLevel: "",
    tags: "",
  });

  // --- FILTER LOGIC ---
  const filteredLocations = locations.filter((loc) => {
    const matchSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "all" || loc.type === filterType;
    return matchSearch && matchType;
  });

  // --- HANDLERS ---
  function startCreate() {
    setEditing("new");
    setForm({
      id: "",
      name: "",
      type: "attraction",
      area: "",
      lat: "",
      lng: "",
      ticket: "",
      indoor: false,
      priceLevel: "",
      tags: "",
    });
  }

  function startEdit(loc) {
    setEditing(loc.id);
    setForm({ ...loc, tags: (loc.tags || []).join(",") });
  }

  function cancelEdit() {
    setEditing(null);
  }

  function handleSave() {
    onSave(form, editing);
    cancelEdit();
  }

  return (
    <div className="space-y-6">
      {/* --- TOOLBAR (SEARCH & FILTER) --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div className="flex gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-0 outline-none transition-all"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:border-gray-900 outline-none cursor-pointer"
          >
            <option value="all">Tất cả loại</option>
            <option value="attraction">Tham quan</option>
            <option value="restaurant">Ăn uống</option>
            <option value="beach">Biển</option>
          </select>
        </div>

        {/* Add Button (Permission Check) */}
        {can(user, PERMISSIONS.CREATE_LOCATION) && (
          <button
            onClick={startCreate}
            className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Thêm địa điểm
          </button>
        )}
      </div>

      {/* --- EDIT FORM --- */}
      {editing && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl animate-fadeIn">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-display font-bold text-gray-900">
              {editing === "new" ? "Thêm địa điểm mới" : "Chỉnh sửa thông tin"}
            </h3>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cột trái: Thông tin cơ bản */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Tên địa điểm
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Loại hình
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  >
                    <option value="attraction">Tham quan</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="beach">Biển</option>
                    <option value="theme-park">Vui chơi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Khu vực
                  </label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Giá vé (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={form.ticket}
                    onChange={(e) =>
                      setForm({ ...form, ticket: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Mức giá
                  </label>
                  <select
                    value={form.priceLevel}
                    onChange={(e) =>
                      setForm({ ...form, priceLevel: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="cheap">Bình dân</option>
                    <option value="moderate">Trung bình</option>
                    <option value="expensive">Sang trọng</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cột phải: Tags & Thuộc tính */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  placeholder="vd: nature, outdoor, family"
                />
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      form.indoor
                        ? "bg-gray-900 border-gray-900"
                        : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {form.indoor && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={form.indoor}
                    onChange={(e) =>
                      setForm({ ...form, indoor: e.target.checked })
                    }
                    className="hidden"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Địa điểm trong nhà (Indoor)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={cancelEdit}
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transform hover:scale-105 transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* --- LOCATIONS TABLE --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Tên địa điểm</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Khu vực</th>
                <th className="px-6 py-4">Giá vé</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLocations.map((loc) => (
                <tr
                  key={loc.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {loc.name}
                    {loc.indoor && (
                      <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                        INDOOR
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        loc.type === "attraction"
                          ? "bg-emerald-50 text-emerald-700"
                          : loc.type === "restaurant"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {loc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{loc.area}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">
                    {loc.ticket ? loc.ticket.toLocaleString() : "Miễn phí"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* View Versions Button */}
                      <button
                        onClick={() => onFetchVersions(loc.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        title="Lịch sử thay đổi"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </button>
                      
                      {/* Edit Button */}
                      {can(user, PERMISSIONS.EDIT_LOCATION) && (
                        <button
                          onClick={() => startEdit(loc)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                      )}

                      {/* Delete Button */}
                      {can(user, PERMISSIONS.DELETE_LOCATION) && (
                        <button
                          onClick={() => onDelete(loc.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                    </div>
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
