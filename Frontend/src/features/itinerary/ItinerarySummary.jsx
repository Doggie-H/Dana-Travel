/**
 * =================================================================================================
 * FILE: ItinerarySummary.jsx
 * MỤC ĐÍCH: Tổng kết chi phí chuyến đi.
 * NGƯỜI TẠO: Team DanaTravel (AI Support)
 * 
 * MÔ TẢ CHI TIẾT (BEGINNER GUIDE):
 * Đây là "Bảng kê khai tài chính" sau khi tính toán.
 * 1. Tổng tiền: Hết bao nhiêu?
 * 2. Chia đầu người: Mỗi người góp bao nhiêu?
 * 3. So sánh: Có lố ngân sách dự kiến không? (Màu đỏ là lố, Màu xanh là dư).
 * 4. Lời khuyên: AI sẽ mách nước cách tiết kiệm nếu thấy bạn tiêu hoang quá.
 * =================================================================================================
 */

import { formatCurrency } from "../../utils/format.utils";

export default function ItinerarySummary({ summary }) {
  if (!summary) return null;

  const { estimatedTotal, perPerson, variancePercent, tips } = summary;

  // --- XÁC ĐỊNH TRẠNG THÁI NGÂN SÁCH (STATUS LOGIC) ---
  let statusColor = "text-green-600";
  let statusBg = "bg-green-50 border-green-100";
  let statusIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  );
  let statusText = "Hợp lý";

  // Logic: Nếu vượt quá 10% ngân sách
  if (variancePercent > 10) {
    statusColor = "text-red-600";
    statusBg = "bg-red-50 border-red-100";
    statusIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    );
    statusText = "Vượt dự kiến";
  } 
  // Logic: Nếu tiết kiệm hơn 15% ngân sách
  else if (variancePercent < -15) {
    statusColor = "text-accent-600";
    statusBg = "bg-accent-50 border-accent-100";
    statusIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    );
    statusText = "Dư nhiều";
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center text-accent-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        </div>
        <h5 className="text-lg font-bold text-gray-900">
          Tóm Tắt Ngân Sách
        </h5>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Tổng Ước Tính */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-sm">
            <small className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Tổng Ước Tính
            </small>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(estimatedTotal)}
            </h3>
          </div>

          {/* 2. Chi Phí/Người */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-sm">
            <small className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Chi Phí/Người
            </small>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(perPerson)}
            </h3>
          </div>

          {/* 3. So Với Dự Kiến (Variance) */}
          <div className={`p-5 rounded-2xl border transition-all hover:shadow-sm ${statusBg}`}>
            <small className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block opacity-75">
              So Với Dự Kiến
            </small>
            <div className="flex items-end justify-between">
              <h3 className={`text-2xl font-bold tracking-tight ${statusColor}`}>
                {variancePercent > 0 ? "+" : ""}
                {variancePercent}%
              </h3>
              <div className={`flex items-center gap-1.5 text-sm font-bold ${statusColor} bg-white/50 px-2 py-1 rounded-lg`}>
                {statusIcon}
                <span>{statusText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TIPS SECTION (GỢI Ý) --- */}
        {tips && tips.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <h6 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Gợi Ý Tối Ưu
              </h6>
              <ul className="space-y-2 pl-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
