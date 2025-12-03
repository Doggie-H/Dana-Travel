/**
 * SYSTEM VERIFICATION SCRIPT
 * 
 * Script tự động kiểm tra trạng thái hoạt động của hệ thống.
 * 
 * Các bước kiểm tra:
 * 1. Backend Health Check: Đảm bảo server đang chạy.
 * 2. Database Check: Đảm bảo đã có dữ liệu (Locations, Knowledge).
 * 3. Chatbot Check: Gửi tin nhắn test để xem AI có phản hồi không.
 * 4. Frontend Build Check: Kiểm tra xem đã build frontend chưa.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình
const API_URL = 'http://localhost:3001/api';
const FRONTEND_BUILD_PATH = path.join(__dirname, '../../Frontend/dist');

// Màu sắc cho console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m"
};

function log(type, message) {
  const color = type === 'SUCCESS' ? colors.green : type === 'ERROR' ? colors.red : type === 'INFO' ? colors.blue : colors.reset;
  console.log(`${color}[${type}] ${message}${colors.reset}`);
}

async function verifySystem() {
  console.log(`${colors.bold}=== BẮT ĐẦU KIỂM TRA HỆ THỐNG ===${colors.reset}\n`);
  let hasError = false;

  // 1. CHECK BACKEND HEALTH
  try {
    log('INFO', 'Đang kiểm tra Backend Health...');
    const healthRes = await fetch(`${API_URL}/ping`); // Sử dụng /api/ping thay vì /api/health
    if (healthRes.ok) {
      const data = await healthRes.json();
      log('SUCCESS', `Backend hoạt động tốt. Message: ${data.message}`);
    } else {
      throw new Error(`Status: ${healthRes.status}`);
    }
    
    // Check Database via Location Search
    log('INFO', 'Đang kiểm tra Database (Locations)...');
    const locRes = await fetch(`${API_URL}/location/search?q=`);
    if (locRes.ok) {
        const locData = await locRes.json();
        // locData có thể là array hoặc object { data: [...] } tùy vào controller
        const count = Array.isArray(locData) ? locData.length : (locData.data ? locData.data.length : 0);
        log('SUCCESS', `Database kết nối tốt. Tìm thấy ${count} địa điểm.`);
    } else {
        throw new Error(`Location API Status: ${locRes.status}`);
    }

  } catch (err) {
    log('ERROR', `Không thể kết nối Backend: ${err.message}`);
    log('INFO', 'Gợi ý: Hãy đảm bảo bạn đã chạy "npm start" ở thư mục Backend.');
    hasError = true;
  }

  // 2. CHECK CHATBOT
  if (!hasError) {
    try {
      log('INFO', 'Đang kiểm tra Chatbot AI...');
      const chatRes = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Xin chào, bạn là ai?', userId: 'system-test' })
      });
      
      if (chatRes.ok) {
        const data = await chatRes.json();
        log('SUCCESS', `Chatbot phản hồi: "${data.reply}"`);
      } else {
        throw new Error(`Status: ${chatRes.status}`);
      }
    } catch (err) {
      log('ERROR', `Lỗi Chatbot: ${err.message}`);
      hasError = true;
    }
  }

  // 3. CHECK FRONTEND BUILD
  try {
    log('INFO', 'Đang kiểm tra Frontend Build...');
    if (fs.existsSync(FRONTEND_BUILD_PATH) && fs.existsSync(path.join(FRONTEND_BUILD_PATH, 'index.html'))) {
      log('SUCCESS', 'Frontend Build đã tồn tại (dist/index.html).');
    } else {
      log('ERROR', 'Không tìm thấy Frontend Build.');
      log('INFO', 'Gợi ý: Chạy "npm run build" ở thư mục Frontend.');
      hasError = true;
    }
  } catch (err) {
    log('ERROR', `Lỗi kiểm tra Frontend: ${err.message}`);
    hasError = true;
  }

  console.log(`\n${colors.bold}=== KẾT THÚC KIỂM TRA ===${colors.reset}`);
  if (hasError) {
    console.log(`${colors.red}Hệ thống có lỗi. Vui lòng kiểm tra lại.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}Toàn bộ hệ thống hoạt động bình thường!${colors.reset}`);
    process.exit(0);
  }
}

verifySystem();
