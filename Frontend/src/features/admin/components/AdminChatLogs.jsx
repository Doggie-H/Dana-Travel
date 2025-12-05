/**
 * =================================================================================================
 * FILE: AdminChatLogs.jsx
 * MỤC ĐÍCH: Kiểm tra lịch sử trò chuyện (Chat History).
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Camera giám sát" phòng Chat.
 * 1. Theo dõi: Xem khách và Bot đang nói chuyện gì với nhau.
 * 2. Đánh giá: Xem Bot trả lời có ngu ngơ không?
 * 3. Huấn luyện thực chiến: Nếu thấy Bot trả lời sai, bấm nút "Dạy AI" để sửa lưng nó ngay lập tức.
 * =================================================================================================
 */

import { can, PERMISSIONS } from "../utils/permissions";

export default function AdminChatLogs({ chatLogs, user, onClearLogs, onFlagEdit }) {
  // Kiểm tra quyền xem logs
  if (!can(user, PERMISSIONS.VIEW_LOGS)) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Truy cập bị từ chối</h3>
        <p className="text-gray-500 text-sm mt-1">Bạn không có quyền xem nhật ký chat.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header & Actions */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Lịch sử trò chuyện</h3>
        
        {/* Nút xóa logs (Chỉ hiện nếu có quyền) */}
        {can(user, PERMISSIONS.DELETE_LOGS) && (
          <button
            onClick={onClearLogs}
            className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-lg hover:bg-red-100 transition-colors"
          >
            Xóa toàn bộ
          </button>
        )}
      </div>
      
      {/* Logs List */}
      <div className="divide-y divide-gray-100">
        {chatLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Chưa có dữ liệu chat nào được ghi lại.
          </div>
        ) : (
          chatLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors group">
              {/* User Info & Timestamp */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                    {log.userId ? "U" : "G"}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      User #{log.userId || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Quick Action: Teach AI */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {can(user, PERMISSIONS.MANAGE_KNOWLEDGE) && (
                    <button
                      onClick={() =>
                        onFlagEdit({
                          idx: log.id,
                          pattern: log.message,
                          reply: log.response,
                        })
                      }
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Dạy AI câu này
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Content */}
              <div className="space-y-3 pl-11">
                {/* User Message */}
                <div className="bg-gray-50 p-3 rounded-xl rounded-tl-none text-sm text-gray-700">
                  <span className="font-bold text-gray-900 block mb-1 text-xs uppercase tracking-wider">User</span>
                  {log.message}
                </div>
                
                {/* Bot Response */}
                <div className="bg-blue-50 p-3 rounded-xl rounded-tr-none text-sm text-gray-700 border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1 text-xs uppercase tracking-wider">Bot Response</span>
                  {log.response}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
