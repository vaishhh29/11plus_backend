const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const ids = [32, 33, 34, 35];
  let log = "";
  let totalWithAlt = 0;

  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });

    log += `==========================================\n`;
    log += `Topic ID ${id}: ${topic.subTopic}\n`;
    log += `==========================================\n`;

    for (const q of topic.questions) {
      const options = q.options;
      if (!Array.isArray(options)) continue;

      const hasAlt = options.some(opt => opt.includes('Alt') || opt.includes('modified') || opt.includes('incorrect'));
      const unique = new Set(options);
      
      if (unique.size < 4) {
        log += `- Question [ID ${q.id}]: "Has database duplicates! Options: ${JSON.stringify(options)}\n`;
      }
      
      if (hasAlt) {
        log += `- Question [ID ${q.id}]: "Uses fallback option! Correct: "${q.correctAnswer}" | Options: ${JSON.stringify(options)}\n`;
        totalWithAlt++;
      }
    }
  }
  log += `Total questions with fallback values: ${totalWithAlt}\n`;
  fs.writeFileSync('db_duplicates_out.txt', log);
  console.log("Written report to db_duplicates_out.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
