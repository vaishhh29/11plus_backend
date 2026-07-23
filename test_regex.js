const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const topic = await prisma.englishSyllabus.findUnique({
    where: { id: 32 },
    include: { questions: true }
  });

  let matched = 0;
  let unmatched = [];

  // Regex to match passive sentences
  // e.g. "The ball was kicked by the boy."
  // or "The meeting is being organised by the committee."
  const regex = /^Change to active voice:\s+(The|A|My|Both|Millions|Millions of)?\s+(.*?)\s+(was|were|has been|had been|will be|is being|was being)\s+(.*?)\s+by\s+(the|my|a|an|both|our|their)?\s+(.*?)(?:\s+(yesterday|tomorrow|next week|for weeks|since 2020|last week|by next month|before the police arrived|throughout the week|next month|daily|for five years|by mistake|by Friday))?\.$/i;

  for (const q of topic.questions) {
    const text = q.questionText.trim();
    const match = text.match(regex);
    if (match) {
      matched++;
    } else {
      unmatched.push({ id: q.id, text });
    }
  }

  console.log(`Matched: ${matched} / ${topic.questions.length}`);
  console.log("Unmatched examples:", unmatched.slice(0, 10));
}

main().catch(console.error).finally(() => prisma.$disconnect());
