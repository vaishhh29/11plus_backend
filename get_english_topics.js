const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.englishSyllabus.findMany({
    include: {
      questions: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  let output = "=== ENGLISH SYLLABUS TOPICS ===\n";
  for (const t of topics) {
    output += `ID: ${t.id} | Topic: "${t.topic}" | Subtopic: "${t.subTopic}" | Count: ${t.questions.length}\n`;
  }

  fs.writeFileSync('all_english_topics.txt', output);
  console.log("Topics written to all_english_topics.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
