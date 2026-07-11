const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function getQuestionById(questionId, subjectId) {
  let model;
  switch (subjectId) {
    case 1: model = prisma.mathsQuestion; break;
    case 2: model = prisma.englishQuestion; break;
    case 3: model = prisma.vRQuestion; break;
    case 4: model = prisma.nVRQuestion; break;
    default: return null;
  }
  return model.findUnique({
    where: { id: questionId },
    include: { syllabus: true }
  });
}

async function main() {
  const student = await prisma.studentProfile.findFirst({
    where: { email: 'jenny@gmail.com' },
    include: {
      studentTests: {
        include: {
          test: {
            include: {
              subject: true,
              testQuestions: true
            }
          },
          answers: true
        }
      }
    }
  });

  if (!student) {
    fs.writeFileSync('test_output_good.txt', "Jenny not found.");
    return;
  }

  // Get total Maths topics in database from subject-specific syllabus
  const mathsTopics = await prisma.mathsSyllabus.findMany();
  
  let output = `Total Maths syllabus topics in DB: ${mathsTopics.length}\n`;

  // Let's analyze completed tests
  const completed = student.studentTests.filter(st => st.status === 'SUBMITTED' || st.status === 'GRADED');
  output += `Completed tests count: ${completed.length}\n`;

  const topicMap = {}; // topic => { total: 0, correct: 0 }

  for (const st of completed) {
    for (const ans of st.answers) {
      // Find matching question
      const tq = st.test.testQuestions.find(x => x.questionId === ans.questionId && x.subjectId === ans.subjectId);
      if (tq) {
        const q = await getQuestionById(tq.questionId, tq.subjectId);
        if (q) {
          const topic = q.syllabus?.topic || 'General';
          if (!topicMap[topic]) {
            topicMap[topic] = { total: 0, correct: 0 };
          }
          topicMap[topic].total++;
          if (ans.isCorrect) {
            topicMap[topic].correct++;
          }
        }
      }
    }
  }

  output += "Topic Breakdown of completed questions:\n" + JSON.stringify(topicMap, null, 2) + "\n\n";

  let learntCount = 0;
  for (const [topic, stats] of Object.entries(topicMap)) {
    const accuracy = stats.correct / stats.total;
    const isLearnt = stats.correct > 0;
    if (isLearnt) {
      learntCount++;
      output += `Topic "${topic}" is learnt (${stats.correct}/${stats.total} correct)\n`;
    } else {
      output += `Topic "${topic}" NOT learnt (${stats.correct}/${stats.total} correct)\n`;
    }
  }

  output += `Total learnt topics: ${learntCount}\n`;
  output += `Percentage of Maths syllabus learnt: ${(learntCount / mathsTopics.length) * 100}%\n`;

  fs.writeFileSync('test_output_good.txt', output);
}

main().catch(console.error).finally(() => prisma.$disconnect());
