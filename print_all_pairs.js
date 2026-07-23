const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const ids = [32, 33, 34, 35];
  
  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (topic) {
      let log = "";
      for (const q of topic.questions) {
        log += `${q.id}|${q.questionText}|${q.correctAnswer}\n`;
      }
      fs.writeFileSync(`all_pairs_${id}.txt`, log);
      console.log(`Saved topic ${id} to all_pairs_${id}.txt`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
