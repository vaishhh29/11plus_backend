const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parseAnswer = (val) => {
  if (!val) return { letter: null, text: '' };
  const clean = val.trim();
  const match = clean.match(/^([a-d])\s*[).:]\s*(.*)$/i);
  return match ? { letter: match[1].toUpperCase(), separator: match[0].substring(match[1].length, match[0].length - match[2].trim().length), text: match[2].trim() } : { letter: null, separator: '', text: clean };
};

async function run() {
  try {
    const vrCount = await prisma.vRQuestion.count();
    const engCount = await prisma.englishQuestion.count();
    const mathsCount = await prisma.mathsQuestion.count();
    
    console.log(`VR questions: ${vrCount}`);
    console.log(`English questions: ${engCount}`);
    console.log(`Maths questions: ${mathsCount}`);
    
    // Sample a few to see correct answers
    const vrSample = await prisma.vRQuestion.findMany({ take: 5 });
    console.log('\nVR Sample correct answers:', vrSample.map(q => q.correctAnswer));
    
    const engSample = await prisma.englishQuestion.findMany({ take: 5 });
    console.log('Eng Sample correct answers:', engSample.map(q => q.correctAnswer));
    
    const mathsSample = await prisma.mathsQuestion.findMany({ take: 5 });
    console.log('Maths Sample correct answers:', mathsSample.map(q => q.correctAnswer));
    
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
