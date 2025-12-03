import { useState } from "react";
import { can, PERMISSIONS } from "../utils/permissions";

export default function AdminKnowledge({
  knowledgeItems,
  user,
  onSave,
  onUpdate,
  onDelete,
}) {
  const [editingKnowledge, setEditingKnowledge] = useState(null);
  const [knowledgeForm, setKnowledgeForm] = useState({
    pattern: "",
    patternType: "contains",
    reply: "",
    tags: "",
    active: true,
    meta_threshold: 0.78,
  });

  if (!can(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Truy cập bị từ chối</h3>
        <p className="text-gray-500 text-sm mt-1">Bạn không có quyền quản lý kiến thức AI.</p>
      </div>
    );
  }

  function startCreate() {
    setEditingKnowledge("new");
    setKnowledgeForm({
      pattern: "",
      patternType: "contains",
      reply: "",
      tags: "",
      active: true,
      meta_threshold: 0.78,
    });
  }

  function startEdit(item) {
    setEditingKnowledge(item.id);
    setKnowledgeForm({
      pattern: item.pattern,
      patternType: item.patternType,
      reply: item.reply,
      tags: (item.tags || []).join(", "),
      active: item.active,
      meta_threshold: item.meta?.threshold || 0.78,
    });
  }

  function cancelEdit() {
    setEditingKnowledge(null);
  }

  function handleSave() {
    if (editingKnowledge === "new") {
      onSave(knowledgeForm);
    } else {
      onUpdate({ ...knowledgeForm, id: editingKnowledge });
    }
    cancelEdit();
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Cơ sở dữ liệu AI</h3>
        <button
          onClick={startCreate}
          className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Thêm kiến thức mới
        </button>
      </div>

      {/* Editor */}
      {editingKnowledge && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl animate-fadeIn">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-display font-bold text-gray-900">
              {editingKnowledge === "new" ? "Dạy AI kiến thức mới" : "Chỉnh sửa kiến thức"}
            </h3>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Câu hỏi mẫu / Từ khóa
                </label>
                <input
                  type="text"
                  value={knowledgeForm.pattern}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, pattern: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  placeholder="VD: quán ăn ngon, thời tiết..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Loại khớp
                  </label>
                  <select
                    value={knowledgeForm.patternType}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, patternType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  >
                    <option value="contains">Chứa từ khóa (Contains)</option>
                    <option value="exact">Chính xác (Exact)</option>
                    <option value="fuzzy">Gần đúng (Fuzzy AI)</option>
                  </select>
                </div>
                {knowledgeForm.patternType === "fuzzy" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Độ chính xác ({knowledgeForm.meta_threshold})
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.01"
                      value={knowledgeForm.meta_threshold}
                      onChange={(e) => setKnowledgeForm({ ...knowledgeForm, meta_threshold: e.target.value })}
                      className="w-full mt-3"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={knowledgeForm.tags}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium"
                  placeholder="food, weather, general..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Câu trả lời của AI
                </label>
                <textarea
                  rows="8"
                  value={knowledgeForm.reply}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, reply: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 outline-none transition-all font-medium resize-none"
                  placeholder="Nhập câu trả lời..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${knowledgeForm.active ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-gray-400"}`}>
                    {knowledgeForm.active && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                  </div>
                  <input
                    type="checkbox"
                    checked={knowledgeForm.active}
                    onChange={(e) => setKnowledgeForm({ ...knowledgeForm, active: e.target.checked })}
                    className="hidden"
                  />
                  <span className="text-sm font-bold text-gray-700">Kích hoạt ngay</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
            <button onClick={cancelEdit} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Hủy bỏ</button>
            <button onClick={handleSave} className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transform hover:scale-105 transition-all">Lưu kiến thức</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Pattern (Input)</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Câu trả lời (Output)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {knowledgeItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={item.pattern}>
                    {item.pattern}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      {item.patternType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-md truncate" title={item.reply}>
                    {item.reply}
                  </td>
                  <td className="px-6 py-4">
                    {item.active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
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
