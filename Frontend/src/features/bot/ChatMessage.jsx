/**
 * Component hiển thị tin nhắn trong khung chat.
 * Hỗ trợ hiển thị tin nhắn của User (phải) và Bot (trái) cùng với các gợi ý (quick replies).
 */

export default function ChatMessage({ message, onQuickReply }) {
  // Xác định người gửi là User hay Bot
  const isUser = message.sender === "user";

  return (
    // Container chính: Flexbox để căn chỉnh vị trí (Trái/Phải)
    <div className={`flex items-end gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* --- 1. AVATAR (CHỈ DÀNH CHO BOT) --- */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
      )}

      {/* --- 2. CHAT BUBBLE (NỘI DUNG TIN NHẮN) --- */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-gray-900 text-white rounded-br-none" // Style User: Nền tối, bo góc đặc biệt
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // Style Bot: Nền trắng, viền nhẹ
        }`}
      >
        {/* Text Content: Hỗ trợ xuống dòng (whitespace-pre-line) */}
        <div className="whitespace-pre-line">{message.text}</div>

        {/* --- 3. QUICK REPLIES (GỢI Ý TRẢ LỜI) --- */}
        {/* Chỉ hiển thị cho Bot và khi có danh sách gợi ý */}
        {!isUser && message.quickReplies && message.quickReplies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onQuickReply && onQuickReply(reply)}
                className="px-3 py-1.5 rounded-lg border border-accent-200 text-accent-700 bg-accent-50/50 hover:bg-accent-100 hover:border-accent-300 text-xs font-medium transition-all duration-200"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* --- 4. TIMESTAMP (THỜI GIAN) --- */}
        <div className={`text-[10px] mt-2 font-medium ${isUser ? "text-gray-400" : "text-gray-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
