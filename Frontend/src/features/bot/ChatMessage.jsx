// file: frontend/src/features/bot/ChatMessage.jsx

/**
 * ChatMessage Component - Hiển thị một tin nhắn trong đoạn chat
 * 
 * Vai trò: 
 * - Hiển thị bong bóng chat (bubble) cho người dùng hoặc bot.
 * - Hiển thị avatar của bot.
 * - Hiển thị các gợi ý nhanh (Quick Replies) nếu có.
 * 
 * Style: Minimalist Luxury (Tailwind CSS)
 */

// import botAvatar from "../../assets/chatbot-avatar.png"; // Removed: Using SVG icon instead

export default function ChatMessage({ message, onQuickReply }) {
  // Kiểm tra xem tin nhắn này là của User hay Bot
  const isUser = message.sender === "user";

  return (
    // Container chính: Flexbox để căn trái (Bot) hoặc phải (User)
    <div className={`flex items-end gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* 1. Avatar (Chỉ hiển thị cho Bot) */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
        </div>
      )}

      {/* 2. Bong bóng chat (Chat Bubble) */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-gray-900 text-white rounded-br-none" // Style cho User: Màu tối, bo góc
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // Style cho Bot: Màu trắng, viền nhẹ
        }`}
      >
        {/* Nội dung tin nhắn */}
        <div className="whitespace-pre-line">{message.text}</div>

        {/* 3. Quick Replies (Gợi ý trả lời nhanh - Chỉ dành cho Bot) */}
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

        {/* 4. Thời gian gửi */}
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
