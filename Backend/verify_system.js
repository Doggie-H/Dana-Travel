import { PrismaClient } from '@prisma/client';
import { processChatMessage } from './src/services/chatbot.service.js';
import { verifyAdmin } from './src/services/admin.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting System Verification...\n');
  let errors = [];

  // 1. Verify Admin
  console.log('👤 Checking Admin Account...');
  const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });
  if (admin) {
    console.log('✅ Admin account exists.');
    const validLogin = await verifyAdmin('admin', 'admin123');
    if (validLogin) {
      console.log('✅ Admin login (password verify) successful.');
    } else {
      console.error('❌ Admin password verification failed!');
      errors.push('Admin password verification failed');
    }
  } else {
    console.error('❌ Admin account MISSING!');
    errors.push('Admin account missing');
  }

  // 2. Verify Knowledge Base (No Emojis)
  console.log('\n📚 Checking Knowledge Base for Emojis...');
  const knowledge = await prisma.knowledge.findMany();
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  const emojiErrors = knowledge.filter(k => emojiRegex.test(k.answer));
  if (emojiErrors.length === 0) {
    console.log('✅ Knowledge Base is clean (No emojis).');
  } else {
    console.error(`❌ Found ${emojiErrors.length} entries with emojis!`);
    errors.push(`Found ${emojiErrors.length} knowledge entries with emojis`);
  }

  // 3. Verify Chatbot Response
  console.log('\n🤖 Testing Chatbot Response...');
  const testQueries = [
    "thời tiết đà nẵng",
    "ăn gì ngon",
    "đổi tiền ở đâu"
  ];
  
  for (const query of testQueries) {
    const response = await processChatMessage(query);
    if (emojiRegex.test(response.reply)) {
      console.error(`❌ Chatbot reply for "${query}" contains emojis!`);
      errors.push(`Chatbot reply for "${query}" contains emojis`);
    } else {
      console.log(`✅ Chatbot reply for "${query}" is clean.`);
    }
  }

  // 4. Verify Access Log (Simulate)
  console.log('\n📝 Testing Access Log...');
  const initialLogs = await prisma.accessLog.count();
  // Create a dummy log
  await prisma.accessLog.create({
    data: {
      ip: '127.0.0.1',
      endpoint: '/test-verification',
      method: 'TEST',
      role: 'system'
    }
  });
  const newLogs = await prisma.accessLog.count();
  if (newLogs > initialLogs) {
    console.log('✅ Access Log recording is working.');
  } else {
    console.error('❌ Access Log failed to record!');
    errors.push('Access Log recording failed');
  }

  console.log('\n---------------------------------');
  if (errors.length === 0) {
    console.log('🎉 SYSTEM VERIFICATION PASSED! All checks green.');
  } else {
    console.error('⚠️ SYSTEM VERIFICATION FAILED with errors:');
    errors.forEach(e => console.error(`- ${e}`));
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error('❌ Script Error:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
