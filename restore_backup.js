const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, 'db_backup_dump.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[Error] Backup file not found at: ${jsonPath}`);
    console.error(`Please run "node create_backup.js" first.`);
    return;
  }

  console.log('====== STARTING DATABASE RESTORE PROCESS ======');
  console.log('Reading database backup file...');
  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const backup = JSON.parse(fileData);

  // Exact dependency order to avoid foreign key constraint violations
  const restoreOrder = [
    'user',
    'parentProfile',
    'teacherProfile',
    'studentProfile',
    'studentTeacher',
    'parentTeacher',
    'teacherRequest',
    'subject',
    'mathsSyllabus',
    'englishSyllabus',
    'vRSyllabus',
    'nVRSyllabus',
    'mathsQuestion',
    'englishQuestion',
    'vRQuestion',
    'nVRQuestion',
    'test',
    'testQuestion',
    'studentTest',
    'studentTestAnswer',
    'assignment',
    'studentSubjectProgress',
    'report'
  ];

  console.log('Connecting to database...');
  await prisma.$connect();

  for (const model of restoreOrder) {
    const list = backup[model];
    if (!list || list.length === 0) {
      console.log(`No records to restore for model: "${model}"`);
      continue;
    }

    console.log(`Restoring ${list.length} records for model: "${model}"...`);
    
    // We parse Datetime fields correctly since they were serialized to string in JSON
    const parsedList = list.map(item => {
      const parsedItem = { ...item };
      for (const key in parsedItem) {
        const val = parsedItem[key];
        // If string matches ISO date format, convert to Date object
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)) {
          parsedItem[key] = new Date(val);
        }
      }
      return parsedItem;
    });

    try {
      if (prisma[model]) {
        // We write in chunks of 1000 to prevent query limits on Postgres
        const chunkSize = 1000;
        for (let i = 0; i < parsedList.length; i += chunkSize) {
          const chunk = parsedList.slice(i, i + chunkSize);
          await prisma[model].createMany({
            data: chunk,
            skipDuplicates: true // avoids failing if some data got partially restored
          });
        }
        console.log(`-> Successfully restored "${model}" records`);
      } else {
        console.warn(`[Warning] Model "${model}" is not accessible on Prisma client.`);
      }
    } catch (err) {
      console.error(`[Error] Failed to restore records for "${model}":`, err.message);
      
      // Fallback row-by-row insertion if createMany chunk fails
      console.log(`Attempting row-by-row fallback for "${model}"...`);
      let successCount = 0;
      for (const record of parsedList) {
        try {
          await prisma[model].create({ data: record });
          successCount++;
        } catch (singleErr) {
          // Skip if key already exists, otherwise log
          if (!singleErr.message.includes('Unique constraint')) {
            console.error(`  Row-by-row error on ID ${record.id || 'N/A'}:`, singleErr.message);
          }
        }
      }
      console.log(`-> Fallback completed. Successfully restored ${successCount} rows for "${model}".`);
    }
  }

  console.log('\n====== RESTORE PROCESS COMPLETED ======');
}

main()
  .catch(e => {
    console.error('Fatal restore procedure error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
