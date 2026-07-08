const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: {
          syllabus: true,
          questions: true
        }
      }
    }
  });
  console.log("Subjects:");
  console.log(JSON.stringify(subjects, null, 2));

  const syllabus = await prisma.syllabus.findMany({
    include: {
      subject: true,
      _count: {
        select: {
          questions: true
        }
      }
    }
  });
  console.log("\nSyllabus count:", syllabus.length);
  console.log("Syllabus entries (first 10):");
  console.log(JSON.stringify(syllabus.slice(0, 10), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
