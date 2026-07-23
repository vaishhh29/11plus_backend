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

    if (topic) {
      log += `==========================================\n`;
      log += `ID: ${topic.id} | Topic: "${topic.topic}" | Subtopic: "${topic.subTopic}" | Count: ${topic.questions.length}\n`;
      log += `==========================================\n`;

      const sample = topic.questions.slice(0, 10);
      for (const q of sample) {
        log += `ID ${q.id} | Type: ${q.questionType}\n`;
        log += `Question: "${q.questionText}"\n`;
        log += `Options: ${JSON.stringify(q.options)}\n`;
        log += `Correct Answer: "${q.correctAnswer}"\n`;
        log += `------------------------------------------\n`;
      }
    } else {
      log += `Topic ID ${id} not found.\n`;
    }
  }

  fs.writeFileSync('english_inspect_voice_speech.txt', log);
  console.log("Written log to english_inspect_voice_speech.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
