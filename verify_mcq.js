const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const ids = [32, 33, 34, 35];
  let log = "=== MCQ DATABASE VERIFICATION REPORT ===\n\n";

  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });

    log += `==========================================\n`;
    log += `Subtopic (ID ${id}): "${topic.subTopic}" | Total: ${topic.questions.length}\n`;
    log += `==========================================\n`;

    const sample = topic.questions.slice(0, 5); // first 5
    for (const q of sample) {
      log += `ID: ${q.id}\n`;
      log += `Question: "${q.questionText}"\n`;
      log += `Type: ${q.questionType}\n`;
      log += `Options: ${JSON.stringify(q.options)}\n`;
      log += `Correct Answer: "${q.correctAnswer}"\n`;
      
      const containsCorrect = Array.isArray(q.options) && q.options.includes(q.correctAnswer);
      log += `Contains Correct Answer inside Options: ${containsCorrect}\n`;
      log += `Options Length: ${Array.isArray(q.options) ? q.options.length : 0}\n`;
      log += `Are Options Unique: ${Array.isArray(q.options) && new Set(q.options).size === q.options.length}\n`;
      log += `------------------------------------------\n`;
    }
  }

  // Let's also check a general stats summary
  log += "\n=== SUMMARY STATS ===\n";
  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });
    
    let ok = 0;
    for (const q of topic.questions) {
      if (Array.isArray(q.options) && q.options.length === 4 && q.options.includes(q.correctAnswer) && new Set(q.options).size === 4 && q.questionType === "TEXT") {
        ok++;
      }
    }
    log += `Topic ID ${id} (${topic.subTopic}): ${ok} / ${topic.questions.length} questions perfectly valid.\n`;
  }

  fs.writeFileSync('verify_out.txt', log);
  console.log("Verification written to verify_out.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
