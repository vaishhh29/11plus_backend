const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

// Helpers mapping to correct subject tables
async function getQuestionById(questionId, subjectId) {
  let model;
  switch (subjectId) {
    case 1: model = prisma.mathsQuestion; break;
    case 2: model = prisma.englishQuestion; break;
    case 3: model = prisma.vRQuestion; break;
    case 4: model = prisma.nVRQuestion; break;
    default: return null;
  }
  let include;
  switch (subjectId) {
    case 1: include = { syllabus: true }; break;
    case 2: include = { syllabus: true }; break;
    case 3: include = { syllabus: true }; break;
    case 4: include = { syllabus: true }; break;
    default: include = {};
  }
  return model.findUnique({
    where: { id: questionId },
    include
  });
}

async function main() {
  const students = await prisma.studentProfile.findMany({
    include: {
      studentTests: {
        include: {
          test: {
            include: {
              subject: true,
              testQuestions: true
            }
          }
        }
      }
    }
  });

  let output = `Students read count: ${students.length}\n`;
  for (const s of students) {
    output += `Student: ${s.name} (${s.email})\n`;
    output += `Tests assigned: ${s.studentTests.length}\n`;
    
    for (const st of s.studentTests) {
      output += `  Test: "${st.test.title}" - Status: ${st.status} - Score: ${st.obtainedMarks}/${st.totalMarks} (${st.percentage}%)\n`;
      
      const topics = [];
      for (const tq of st.test.testQuestions) {
        const q = await getQuestionById(tq.questionId, tq.subjectId);
        if (q && q.syllabus) {
          topics.push(q.syllabus.topic);
        }
      }
      output += `    Questions Syllabus Topics: ${JSON.stringify([...new Set(topics)])}\n`;
    }
  }

  fs.writeFileSync('output.txt', output);
}

main().catch(console.error).finally(() => prisma.$disconnect());