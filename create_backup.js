const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const backup = {};
  
  // Model names mapping to Prisma client properties
  const models = [
    'user',
    'teacherProfile',
    'studentProfile',
    'parentProfile',
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
    'assignment',
    'test',
    'testQuestion',
    'studentTest',
    'studentTestAnswer',
    'studentSubjectProgress',
    'report'
  ];

  console.log('====== STARTING DATABASE BACKUP PROGESS ======');
  console.log('Connecting to database...');
  
  for (const model of models) {
    try {
      if (prisma[model]) {
        console.log(`Querying records for table/model: "${model}"...`);
        const data = await prisma[model].findMany();
        backup[model] = data;
        console.log(`-> Saved ${data.length} records for "${model}"`);
      } else {
        console.warn(`[Warning] Model "${model}" is defined in schema but not accessible on Prisma client.`);
      }
    } catch (err) {
      console.error(`[Error] Failed to fetch data for "${model}":`, err.message);
    }
  }

  // Save as structured JSON
  const jsonPath = path.join(__dirname, 'db_backup_dump.json');
  fs.writeFileSync(jsonPath, JSON.stringify(backup, null, 2), 'utf-8');
  console.log(`\n[Success] Structured JSON Backup saved to: ${jsonPath}`);

  // Generate plain SQL insertions backup
  console.log('Generating plain SQL Insertions file...');
  let sqlContent = `-- Database backup generated programmatically\n`;
  sqlContent += `-- Date: ${new Date().toISOString()}\n`;
  sqlContent += `-- Server: Render Postgres\n\n`;

  // We write transactional wrap
  sqlContent += `BEGIN;\n\n`;

  // Map user model names to database table names (@@map in prisma schema)
  const tableMapping = {
    user: 'users',
    teacherProfile: 'teacher_profiles',
    studentProfile: 'student_profiles',
    parentProfile: 'parent_profiles',
    studentTeacher: 'student_teachers',
    parentTeacher: 'parent_teachers',
    teacherRequest: 'teacher_requests',
    subject: 'subjects',
    mathsSyllabus: 'maths_syllabus',
    englishSyllabus: 'english_syllabus',
    vRSyllabus: 'vr_syllabus',
    nVRSyllabus: 'nvr_syllabus',
    mathsQuestion: 'maths_questions',
    englishQuestion: 'english_questions',
    vRQuestion: 'vr_questions',
    nVRQuestion: 'nvr_questions',
    assignment: 'assignments',
    test: 'tests',
    testQuestion: 'test_questions',
    studentTest: 'student_tests',
    studentTestAnswer: 'student_test_answers',
    studentSubjectProgress: 'student_subject_progress',
    report: 'reports'
  };

  for (const model of models) {
    const list = backup[model];
    if (!list || list.length === 0) continue;

    const tableName = tableMapping[model] || model;
    sqlContent += `-- Data for table: ${tableName}\n`;
    
    for (const record of list) {
      const keys = Object.keys(record);
      const cols = keys.map(k => `"${k}"`).join(', ');
      
      const vals = keys.map(k => {
        const val = record[k];
        if (val === null || val === undefined) {
          return 'NULL';
        }
        if (typeof val === 'string') {
          // Escape single quotes for SQL insertion
          return `'${val.replace(/'/g, "''")}'`;
        }
        if (val instanceof Date) {
          return `'${val.toISOString()}'`;
        }
        if (typeof val === 'object') {
          // JSON fields
          return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        }
        if (typeof val === 'boolean') {
          return val ? 'TRUE' : 'FALSE';
        }
        return val;
      }).join(', ');

      sqlContent += `INSERT INTO "${tableName}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
    }
    sqlContent += `\n`;
  }

  sqlContent += `COMMIT;\n`;

  const sqlPath = path.join(__dirname, 'db_backup_dump.sql');
  fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
  console.log(`[Success] SQL Insertions Backup saved to: ${sqlPath}`);
  console.log('====== BACKUP PROCESS COMPLETED SUCCESSFULLY ======');
}

main()
  .catch(e => {
    console.error('Fatal backup procedure error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
