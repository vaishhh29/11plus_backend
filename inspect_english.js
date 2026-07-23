const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  let log = "";
  const appendLog = (str) => {
    log += str + "\n";
  };

  const topics = await prisma.englishSyllabus.findMany({
    include: {
      questions: true
    }
  });

  appendLog("=== ALL ENGLISH SYLLABUS TOPICS AND QUESTION COUNT ===");
  for (const topic of topics) {
    const activePassiveDirectIndirect = 
      /active|passive|direct|indirect|speech|voice/i.test(topic.topic) || 
      /active|passive|direct|indirect|speech|voice/i.test(topic.subTopic || '');
    
    if (activePassiveDirectIndirect || topic.questions.some(q => /active|passive|direct|indirect|speech/i.test(q.questionText))) {
      appendLog(`Topic ID: ${topic.id} | Topic: "${topic.topic}" | Subtopic: "${topic.subTopic}" | Count: ${topic.questions.length}`);
      
      const sample = topic.questions.slice(0, 15);
      for (const q of sample) {
        appendLog(`  - Question [ID ${q.id}]: "${q.questionText}"`);
        appendLog(`    Type: ${q.questionType}`);
        appendLog(`    Options: ${JSON.stringify(q.options)}`);
        appendLog(`    Correct Answer: "${q.correctAnswer}"`);
      }
    }
  }

  const matchingQns = await prisma.englishQuestion.findMany({
    where: {
      OR: [
        { questionText: { contains: 'active', mode: 'insensitive' } },
        { questionText: { contains: 'passive', mode: 'insensitive' } },
        { questionText: { contains: 'indirect', mode: 'insensitive' } },
        { questionText: { contains: 'direct', mode: 'insensitive' } }
      ]
    },
    take: 30
  });

  appendLog(`\n=== GENERAL MATCHING QUESTIONS IN DATABASE (COUNT: ${matchingQns.length}) ===`);
  for (const q of matchingQns) {
    appendLog(`Question [ID ${q.id}] (Syllabus ID: ${q.syllabusId}): "${q.questionText}"`);
    appendLog(`  Type: ${q.questionType}`);
    appendLog(`  Options: ${JSON.stringify(q.options)}`);
    appendLog(`  Correct Answer: "${q.correctAnswer}"`);
  }

  fs.writeFileSync('inspect_out.txt', log, 'utf-8');
  console.log("Details written to inspect_out.txt");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
