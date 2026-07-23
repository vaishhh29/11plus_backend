const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const topics = await prisma.mathsSyllabus.findMany({
    orderBy: { displayOrder: 'asc' }
  });
  
  let output = '=== Checking for prefix patterns in correct answers ===\n';
  for (const t of topics) {
    const sample = await prisma.mathsQuestion.findFirst({
      where: { syllabusId: t.id }
    });
    if (!sample) {
      output += `Topic: "${t.topic}" | Subtopic: "${t.subTopic || 'None'}" | No questions found\n`;
      continue;
    }
    output += `Topic: "${t.topic}" | Subtopic: "${t.subTopic || 'None'}" | Sample CorrectAnswer: "${sample.correctAnswer}" | Sample Options: ${JSON.stringify(sample.options)}\n`;
  }
  
  fs.writeFileSync('prefixes_out.txt', output);
  console.log('Saved to prefixes_out.txt');
}

main().catch(console.error).finally(() => prisma.$disconnect());
