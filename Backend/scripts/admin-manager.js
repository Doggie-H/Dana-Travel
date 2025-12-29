import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs'; // REMOVED

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
Hướng dẫn sử dụng CLI Quản trị:
-------------------------------------------------------
1. Xem danh sách:    npm run admin:list
2. Tạo tài khoản:    npm run admin:create <user> <role> <pass>
3. Đổi mật khẩu:     npm run admin:reset <user> <new_pass>
4. Xóa tài khoản:    npm run admin:delete <user>
-------------------------------------------------------
`);
    return;
  }

  try {
    switch (command) {
      case 'list':
        await listAdmins();
        break;
      case 'create':
        await createAdmin(args[1], args[2], args[3]);
        break;
      case 'reset':
        await resetPassword(args[1], args[2]);
        break;
      case 'delete':
        await deleteAdmin(args[1]);
        break;
      case 'config':
        await listConfig();
        break;
      default:
        console.log("Lệnh không hợp lệ!");
    }
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// ... existing listConfig ...
async function listConfig() {
  console.log("\n=== CẤU HÌNH HỆ THỐNG ===");
  const settings = await prisma.systemSetting.findMany();
  console.table(settings.map(s => ({ Key: s.key, Value: s.value, Desc: s.description })));

  console.log("\n=== LỜI NHẮC AI (AI PROMPTS) ===");
  const prompts = await prisma.aIPrompt.findMany();
  prompts.forEach(p => {
    console.log(`\n[${p.key}]: ${p.description}`);
    console.log(`Content Preview: ${p.content.substring(0, 100)}...`);
  });
}

async function listAdmins() {
  const admins = await prisma.admin.findMany();
  console.log("\n=== DANH SÁCH TÀI KHOẢN (CHẾ ĐỘ KHÔNG BẢO MẬT) ===");
  console.table(admins.map(a => ({
    ID: a.id,
    Username: a.username,
    Role: a.role,
    'Mật khẩu (Rõ)': a.passwordHash 
  })));
}

async function createAdmin(username, role, password) {
  if (!username || !role || !password) {
    console.log("❌ Thiếu thông tin! Cú pháp: npm run admin:create <user> <role> <pass>");
    return;
  }

  // Generate ID: Get last ID -> increment
  const lastAdmin = await prisma.admin.findFirst({
    orderBy: { id: 'desc' }
  });
  
  let newId = 'TK_01';
  if (lastAdmin && lastAdmin.id.startsWith('TK_')) {
    const num = parseInt(lastAdmin.id.split('_')[1]);
    newId = `TK_${String(num + 1).padStart(2, '0')}`;
  }

  const user = await prisma.admin.create({
    data: {
      id: newId,
      username,
      role,
      passwordHash: password,
      email: `${username}@danatravel.local`
    }
  });
  console.log(`\n✅ Đã tạo thành công: ${user.username} (${user.role}) - ID: ${user.id} - Pass: ${password}`);
}

async function resetPassword(username, newPassword) {
  // ... (No ID usage needed, search by username)
  if (!username || !newPassword) {
    console.log("❌ Thiếu thông tin! Cú pháp: npm run admin:reset <user> <new_pass>");
    return;
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (!existing) {
    console.log(`❌ Không tìm thấy tài khoản: ${username}`);
    return;
  }

  await prisma.admin.update({
    where: { username },
    data: { passwordHash: newPassword }
  });
  console.log(`\n✅ Đã đổi mật khẩu cho: ${username} -> ${newPassword}`);
}

async function deleteAdmin(username) {
  if (!username) {
    console.log("❌ Thiếu user! Cú pháp: npm run admin:delete <user>");
    return;
  }
  
  if (username === 'admin') {
    console.log("❌ Không thể xóa tài khoản gốc 'admin'!");
    return;
  }

  try {
    await prisma.admin.delete({ where: { username } });
    console.log(`\n✅ Đã xóa tài khoản: ${username}`);
  } catch (e) {
    console.log(`❌ Lỗi khi xóa (Có thể không tồn tại): ${username}`);
  }
}

main();
