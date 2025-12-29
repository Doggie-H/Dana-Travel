
import prisma from "./src/config/prisma.client.js";

async function checkData() {
    try {
        const logCount = await prisma.accessLog.count();
        const searchCount = await prisma.searchQuery.count();
        console.log(`AccessLog Count: ${logCount}`);
        console.log(`SearchQuery Count: ${searchCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
