const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const topic = await prisma.englishSyllabus.findUnique({
    where: { id: 32 },
    include: { questions: true }
  });

  const verbs = new Set();
  const pairs = [];

  for (const q of topic.questions) {
    const active = q.correctAnswer.trim();
    // Questions are typically: "Subject verb object"
    // Let's split words and try to guess the verb.
    // e.g. "The boy kicked the ball." -> words: The, boy, kicked, the, ball.
    // simple heuristic: find the word that is not a determiner or noun, or look at the word index.
    const words = active.replace(/\.$/, "").split(/\s+/);
    pairs.push({ id: q.id, active, words });
  }

  // Let's write the first 50 words lists to inspect
  let out = "";
  for (const p of pairs) {
    out += `ID ${p.id} | Active: "${p.active}" | Words: ${JSON.stringify(p.words)}\n`;
  }
  fs.writeFileSync('active_words.txt', out);
  console.log("Written words to active_words.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
