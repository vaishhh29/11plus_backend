const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const ids = [32, 33, 34, 35];
  let log = "";

  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });

    log += `Topic ID ${id} (${topic.subTopic}):\n`;
    const sortedByLen = [...topic.questions].sort((a,b) => a.questionText.length - b.questionText.length);
    log += `  Total: ${topic.questions.length}\n`;
    log += `  Shortest: "${sortedByLen[0].questionText}" -> "${sortedByLen[0].correctAnswer}"\n`;
    log += `  Longest: "${sortedByLen[sortedByLen.length-1].questionText}" -> "${sortedByLen[sortedByLen.length-1].correctAnswer}"\n`;

    log += "  Sample middle questions:\n";
    const midIndex = Math.floor(topic.questions.length / 2);
    for (let i = 0; i < 15; i++) {
        const q = topic.questions[midIndex + i];
        if (q) {
            log += `    - "${q.questionText}" -> "${q.correctAnswer}"\n`;
        }
    }
    log += "\n";
  }

  fs.writeFileSync('patterns_out.txt', log, 'utf-8');
  console.log("Written patterns to patterns_out.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
