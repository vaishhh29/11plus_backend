const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany({
    include: {
      syllabus: true,
      questions: {
        select: {
          id: true,
          questionText: true,
          syllabusId: true,
        }
      }
    }
  });

  let report = '=== SUBJECTS, SYLLABUS & QUESTIONS ===\n';
  for (const s of subjects) {
    report += `Subject: ${s.name} (id: ${s.id})\n`;
    report += `  Syllabus Topic count: ${s.syllabus.length}\n`;
    for (const syl of s.syllabus) {
      report += `    - Topic ID: ${syl.id}, topic name: "${syl.topic}", subTopic: "${syl.subTopic}"\n`;
    }
    report += `  Question count: ${s.questions.length}\n`;
    const unlinked = s.questions.filter(q => !q.syllabusId);
    report += `    - Unlinked Questions (missing syllabusId): ${unlinked.length}\n`;
    if (unlinked.length > 0) {
      report += `      Sample unlinked qns:\n`;
      unlinked.slice(0, 3).forEach(q => {
        report += `        * "${q.questionText}"\n`;
      });
    }
  }

  const allSyllabusRecs = await prisma.syllabus.findMany();
  report += `\nTotal Syllabus records in database: ${allSyllabusRecs.length}\n`;

  fs.writeFileSync('db_log.txt', report, 'utf-8');
  console.log('Saved to db_log.txt successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
