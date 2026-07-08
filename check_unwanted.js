const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const badSyllabus = await prisma.syllabus.findMany({
    where: {
      id: { in: [77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89] }
    },
    include: {
      questions: true
    }
  });

  for (const s of badSyllabus) {
    console.log(`\nSyllabus ID ${s.id}: Topic="${s.topic}", subTopic="${s.subTopic}"`);
    console.log(`Linked Questions Count: ${s.questions.length}`);
    if (s.questions.length > 0) {
      console.log('First question linked:');
      console.log('Text:', s.questions[0].questionText);
      console.log('Options:', s.questions[0].options);
      console.log('Answer:', s.questions[0].correctAnswer);
      console.log('Topic (from question model):', s.questions[0].topic); // wait, model does not have topic
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
