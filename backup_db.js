const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const syllabus = await prisma.vRSyllabus.findMany();
  const questions = await prisma.vRQuestion.findMany();

  const backup = {
    timestamp: new Date().toISOString(),
    vRSyllabus: syllabus,
    vRQuestion: questions,
  };

  const backupPath = path.join(__dirname, 'vr_backup_before_coding_decoding.json');
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

  console.log(`Backup completed successfully! Saved to: ${backupPath}`);
  console.log(`Syllabus count: ${syllabus.length}`);
  console.log(`Question count: ${questions.length}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
