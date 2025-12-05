
import { knowledgeData } from '../data/knowledge.js';
import { randomUUID } from 'crypto';

export const seedKnowledge = async (prisma) => {
  console.log('Seeding Knowledge Base...');
  
  for (const kb of knowledgeData) {
    await prisma.knowledge.create({
      data: {
        id: `KB_${randomUUID()}`,
        question: kb.question,
        answer: kb.answer,
        keywords: kb.keywords,
      },
    });

  }
  console.log(`Seeded ${knowledgeData.length} knowledge entries\n`);
};
