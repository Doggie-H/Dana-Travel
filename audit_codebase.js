import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIRS = [
  'd:\\Dana-Travel\\Backend\\src',
  'd:\\Dana-Travel\\Frontend\\src',
  'd:\\Dana-Travel\\Backend\\prisma'
];

const IGNORE_DIRS = ['node_modules', 'dist', 'coverage', '.git'];
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]/u;

let report = {
  filesScanned: 0,
  errors: [],
  warnings: []
};

function scanFile(filePath) {
  report.filesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);

  // 1. Kiểm tra Emoji (Trừ file này ra)
  if (EMOJI_REGEX.test(content) && !filePath.includes('audit_codebase.js')) {
    report.errors.push(`[EMOJI] Tìm thấy emoji trong ${filePath}`);
  }

  // 2. Kiểm tra Cú pháp (Chỉ cho file JS Backend)
  if (ext === '.js' || ext === '.jsx') {
    try {
      // Kiểm tra cú pháp cơ bản bằng node (chỉ hiệu quả với file .js thuần)
      // Đối với JSX/Frontend, việc build sẽ kiểm tra kỹ hơn.
      if (filePath.includes('Backend') && ext === '.js') {
         execSync(`node --check "${filePath}"`, { stdio: 'ignore' });
      }
    } catch (e) {
      report.errors.push(`[SYNTAX] Lỗi cú pháp trong ${filePath}`);
    }
  }

  // 3. Kiểm tra TODO/FIXME
  if (content.includes('TODO:') || content.includes('FIXME:')) {
    report.warnings.push(`[TODO] Tìm thấy TODO/FIXME trong ${filePath}`);
  }

  // 4. Kiểm tra console.log (Cảnh báo)
  // Bỏ qua server.js và seed.js vì ở đó việc log là cần thiết
  if (content.includes('console.log') && !filePath.includes('server.js') && !filePath.includes('seed.js') && !filePath.includes('audit_codebase.js')) {
    report.warnings.push(`[LOG] Tìm thấy console.log trong ${filePath}`);
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORE_DIRS.includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.js', '.jsx', '.css', '.html', '.prisma'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

console.log('--- Bắt đầu kiểm tra mã nguồn (Audit) ---');
ROOT_DIRS.forEach(dir => scanDir(dir));

fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2));
console.log('--- Hoàn tất kiểm tra. Kết quả đã lưu vào audit_report.json ---');
