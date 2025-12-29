/**
 * =================================================================================================
 * CHAT PAGE
 * =================================================================================================
 * 
 * Trang Chatbot AI - Trợ lý du lịch ảo.
 * 
 * Flow:
 * 1. Load History & Context từ LocalStorage.
 * 2. Render Chat UI.
 * 3. User gửi tin -> Gọi API -> Nhận phản hồi -> Update History.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../features/bot/ChatMessage";
import { sendChatMessage } from "../services/api-service.js";
import {
  loadItinerary,
  loadUserRequest,
  saveChatHistory,
  loadChatHistory,
} from "../services/storage-service.js";

/**
 * =================================================================================================
 * MAIN COMPONENT
 * =================================================================================================
 */
export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // --- STATE ---
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState({});

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    // A. Load Context
    const itinerary = loadItinerary();
    const userRequest = loadUserRequest();
    setContext({ itinerary, userRequest });

    // B. Load History
    let history = loadChatHistory();
    
    // Cleanup Legacy "Robotic" Messages (Migration Logic)
    if (history.some(msg => msg.text.includes("Xin chào! Tôi có thể giúp bạn"))) {
      history = [];
      localStorage.removeItem("chatHistory");
    }

    // C. Set Initial State
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  }, []);

  // --- 2. AUTO-SCROLL & AUTO-SAVE ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) saveChatHistory(messages);
  }, [messages]);

  // --- 3. HANDLE SEND MESSAGE (CORE LOGIC) ---
  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    // A. Add User Message (Optimistic UI)
    const userMsg = { sender: "user", text: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // B. Call API
      const response = await sendChatMessage(text, context);

      // C. Process Response
      const botMsg = {
        sender: "bot",
        text: response.reply,
        timestamp: new Date().toISOString(),
        quickReplies: response.quickReplies || [],
      };
      setMessages(prev => [...prev, botMsg]);

      // D. Update Context (if Bot changed something)
      if (response.context) {
        setContext(prev => ({ ...prev, ...response.context }));
      }

    } catch (error) {
      const errorMsg = {
        sender: "bot",
        text: "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại giúp mình nhé.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // --- RENDER ---
  return (
    <div className="min-h-screen bg-white pt-24 pb-10 px-6 lg:px-12 flex flex-col items-center">
      <div className="w-full container mx-auto max-w-screen-lg flex-1 flex flex-col">
        
        {/* Header */}
        <Header navigate={navigate} />

        {/* Main Chat Area */}
        <div className="flex-1 bg-gray-50 border border-gray-100 flex flex-col relative overflow-hidden rounded-md">
          
          <MessageList 
            messages={messages} 
            isLoading={isLoading} 
            onQuickReply={handleSend} 
            endRef={messagesEndRef} 
          />

          <InputArea 
            value={inputText} 
            onChange={setInputText} 
            onSubmit={() => handleSend(inputText)} 
            disabled={isLoading} 
          />
        
        </div>

        {/* Footer */}
        <FooterDescription />

      </div>
    </div>
  );
}

/**
 * =================================================================================================
 * CONSTANTS & SUB-COMPONENTS
 * =================================================================================================
 */

const DEFAULT_WELCOME_MESSAGE = {
  sender: "bot",
  text: "Chào bạn, mình là trợ lý du lịch riêng của bạn tại Đà Nẵng.\n\nMình ở đây để giúp chuyến đi của bạn trở nên hoàn hảo nhất. Bạn đang băn khoăn điều gì không?\n\n• Bạn muốn tìm quán cafe đẹp hay nhà hàng chuẩn vị?\n• Cần phương án dự phòng khi trời mưa?\n• Hay muốn thay đổi lịch trình cho phù hợp hơn?\n\nCứ thoải mái chia sẻ với mình nhé!",
  timestamp: new Date().toISOString(),
  quickReplies: [],
};

function Header({ navigate }) {
  return (
    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
      <div>
        <h2 className="font-display text-3xl text-gray-900">Trợ Lý Du Lịch</h2>
        <p className="text-sm text-gray-500 font-light mt-1">Luôn sẵn sàng hỗ trợ 24/7</p>
      </div>
      <button 
        className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
        onClick={() => navigate("/results")}
      >
        Quay Lại
      </button>
    </div>
  );
}

function MessageList({ messages, isLoading, onQuickReply, endRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-hide">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} onQuickReply={onQuickReply} />
      ))}

      {isLoading && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

function InputArea({ value, onChange, onSubmit, disabled }) {
  return (
    <div className="p-6 bg-white border-t border-gray-100">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="relative">
        <input
          type="text"
          className="w-full pl-6 pr-16 py-4 bg-gray-50 border-none focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder-gray-400 font-light transition-all rounded-xl"
          placeholder="Nhập câu hỏi của bạn..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
          disabled={disabled || !value.trim()}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </form>
    </div>
  );
}

function FooterDescription() {
  return (
    <div className="mt-6 text-center">
      <p className="text-xs text-gray-400 font-light tracking-wide">
        <span className="font-bold text-gray-600 uppercase tracking-wider mr-2">Gợi ý:</span> 
        Hỏi về địa điểm tránh mưa, quán ăn ngon, hoặc thay đổi lịch trình.
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-100 px-6 py-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
}
