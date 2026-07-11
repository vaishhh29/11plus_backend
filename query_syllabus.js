const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const subjects = await prisma.subject.findMany({
    include: {
      syllabus: true
    }
  });

  let output = '';
  for (const sub of subjects) {
    output += `Subject ID: ${sub.id}, Name: ${sub.name}\n`;
    output += `Topics count: ${sub.syllabus.length}\n`;
    for (const syl of sub.syllabus) {
      output += `  Topic: "${syl.topic}" - Subtopic: "${syl.subTopic}" (ID: ${syl.id})\n`;
    }
  }

  // Also query StudentProgress table
  const progressList = await prisma.studentSubjectProgress.findMany({
    include: {
      student: true,
      subject: true
    }
  });
  output += `\n--- Progress List ---\n`;
  for (const prog of progressList) {
    output += `Student: ${prog.student.name}, Subject: ${prog.subject.name}, Level: ${prog.level}, Progress: ${prog.progressPercentage}%\n`;
  }

  fs.writeFileSync('output_syllabus.txt', output);
}

main().catch(console.error).finally(() => prisma.$disconnect());
