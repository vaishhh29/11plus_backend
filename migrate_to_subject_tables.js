/**
 * Optimized and Verbose Migration Script: Shared tables → Subject-specific tables
 * 
 * Uses in-memory lookups and batch operations (createMany) to complete
 * the migration in seconds.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

console.log('Connecting to database via Prisma...');
const prisma = new PrismaClient();

// Subject ID to table name mapping
const SUBJECT_MAP = {
  1: { name: 'Maths',   syllabusTable: 'maths_syllabus',   questionTable: 'maths_questions',   model: 'mathsQuestion',   sylModel: 'mathsSyllabus' },
  2: { name: 'English', syllabusTable: 'english_syllabus', questionTable: 'english_questions', model: 'englishQuestion', sylModel: 'englishSyllabus' },
  3: { name: 'VR',      syllabusTable: 'vr_syllabus',      questionTable: 'vr_questions',      model: 'vrQuestion',      sylModel: 'vrSyllabus' },
  4: { name: 'NVR',     syllabusTable: 'nvr_syllabus',     questionTable: 'nvr_questions',     model: 'nvrQuestion',     sylModel: 'nvrSyllabus' },
};

async function main() {
  console.log('Main migration function started...');
  let log = '';
  const logLine = (msg) => {
    console.log(msg);
    log += msg + '\n';
  };

  logLine('=== Optimized Migration: Shared → Subject-Specific Tables ===');
  logLine(`Started at: ${new Date().toISOString()}`);
  logLine('');

  // ──────────────────────────────────────────────
  // Step 1: Read all data from OLD shared tables
  // ──────────────────────────────────────────────
  logLine('Step 1: Reading old shared tables...');

  const oldSyllabus = await prisma.$queryRaw`SELECT * FROM "syllabus" ORDER BY id`;
  const oldQuestions = await prisma.$queryRaw`SELECT * FROM "questions" ORDER BY id`;

  logLine(`  Old syllabus rows fetched: ${oldSyllabus.length}`);
  logLine(`  Old question rows fetched: ${oldQuestions.length}`);

  // Group by subjectId
  const syllabusBySubject = {};
  const questionsBySubject = {};

  for (const s of oldSyllabus) {
    const sid = s.subjectId || s.subject_id;
    if (!syllabusBySubject[sid]) syllabusBySubject[sid] = [];
    syllabusBySubject[sid].push(s);
  }

  for (const q of oldQuestions) {
    const sid = q.subjectId || q.subject_id;
    if (!questionsBySubject[sid]) questionsBySubject[sid] = [];
    questionsBySubject[sid].push(q);
  }

  // ──────────────────────────────────────────────
  // Step 2: Migrate Syllabus Entries
  // ──────────────────────────────────────────────
  logLine('\nStep 2: Migrating syllabus entries...');
  const syllabusIdMap = {}; // { oldSyllabusId: newSyllabusId }

  for (const [sidStr, config] of Object.entries(SUBJECT_MAP)) {
    const sid = parseInt(sidStr);
    const entries = syllabusBySubject[sid] || [];
    if (entries.length === 0) continue;

    logLine(`  Processing syllabus for ${config.name} (${entries.length} entries)...`);
    for (const s of entries) {
      const topic = s.topic;
      const subTopic = s.subTopic || s.sub_topic || null;
      const description = s.description || null;
      const displayOrder = s.displayOrder || s.display_order || 0;
      const estimatedDuration = s.estimatedDuration || s.estimated_duration || null;
      const status = s.status || 'ACTIVE';

      // Check if already exists in target table
      const existing = await prisma[config.sylModel].findFirst({
        where: { topic, subTopic }
      });

      let newId;
      if (existing) {
        newId = existing.id;
        logLine(`    Syllabus "${topic}" exists -> id=${newId}`);
      } else {
        const created = await prisma[config.sylModel].create({
          data: { topic, subTopic, description, displayOrder, estimatedDuration, status }
        });
        newId = created.id;
        logLine(`    Syllabus "${topic}" created -> id=${newId}`);
      }
      syllabusIdMap[s.id] = newId;
    }
  }

  // ──────────────────────────────────────────────
  // Step 3: Migrate Questions in Batches
  // ──────────────────────────────────────────────
  logLine('\nStep 3: Migrating questions in batches...');

  for (const [sidStr, config] of Object.entries(SUBJECT_MAP)) {
    const sid = parseInt(sidStr);
    const questions = questionsBySubject[sid] || [];
    if (questions.length === 0) continue;

    logLine(`  Migrating ${questions.length} questions for ${config.name}...`);

    // Fetch existing questions in the new table to prevent duplicates
    const existingQs = await prisma[config.model].findMany({
      select: { questionText: true, correctAnswer: true }
    });
    logLine(`    Found ${existingQs.length} existing questions in ${config.name} table.`);
    const existingKeys = new Set(existingQs.map(eq => `${eq.questionText}|||${eq.correctAnswer}`));

    const toInsert = [];
    for (const q of questions) {
      const key = `${q.questionText}|||${q.correctAnswer}`;
      if (existingKeys.has(key)) {
        continue; // skip duplicate
      }

      const oldSyllabusId = q.syllabusId || q.syllabus_id || null;
      const newSyllabusId = oldSyllabusId ? (syllabusIdMap[oldSyllabusId] || null) : null;
      const options = q.options || null;

      toInsert.push({
        syllabusId: newSyllabusId,
        questionType: q.questionType || q.question_type || 'TEXT',
        questionText: q.questionText,
        questionImage: q.questionImage || q.question_image || null,
        options: options,
        correctAnswer: q.correctAnswer || q.correct_answer || '',
        explanation: q.explanation || null,
        difficulty: q.difficulty || 'MEDIUM',
        marks: q.marks || 1,
        isActive: q.isActive !== undefined ? q.isActive : (q.is_active !== undefined ? q.is_active : true),
      });
    }

    logLine(`    ${toInsert.length} questions to insert for ${config.name}.`);
    if (toInsert.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const chunk = toInsert.slice(i, i + batchSize);
        logLine(`    Inserting chunk ${i/batchSize + 1} of ${Math.ceil(toInsert.length/batchSize)}...`);
        await prisma[config.model].createMany({ data: chunk });
      }
      logLine(`    Inserted ${toInsert.length} questions successfully.`);
    } else {
      logLine(`    All questions already migrated.`);
    }
  }

  // ──────────────────────────────────────────────
  // Step 4: Build Question ID Map (oldID -> newID)
  // ──────────────────────────────────────────────
  logLine('\nStep 4: Mapping old question IDs to new question IDs...');
  const questionIdMap = {}; // { oldQuestionId: newQuestionId }

  for (const [sidStr, config] of Object.entries(SUBJECT_MAP)) {
    const sid = parseInt(sidStr);
    const oldQs = questionsBySubject[sid] || [];
    if (oldQs.length === 0) continue;

    const newQs = await prisma[config.model].findMany({
      select: { id: true, questionText: true, correctAnswer: true }
    });

    const newQsLookup = new Map();
    for (const nq of newQs) {
      newQsLookup.set(`${nq.questionText}|||${nq.correctAnswer}`, nq.id);
    }

    let mappedCount = 0;
    for (const oq of oldQs) {
      const key = `${oq.questionText}|||${oq.correctAnswer}`;
      const newId = newQsLookup.get(key);
      if (newId) {
        questionIdMap[oq.id] = { newId, subjectId: sid };
        mappedCount++;
      }
    }
    logLine(`  Mapped ${mappedCount} / ${oldQs.length} question IDs for ${config.name}`);
  }

  // ──────────────────────────────────────────────
  // Step 5: Update TestQuestion references in DB
  // ──────────────────────────────────────────────
  logLine('\nStep 5: Updating TestQuestion references...');
  const testQuestions = await prisma.$queryRaw`SELECT * FROM "test_questions" ORDER BY id`;
  logLine(`  Found ${testQuestions.length} test_question rows to update.`);

  let tqUpdated = 0;
  for (const tq of testQuestions) {
    const oldQId = tq.questionId || tq.question_id;
    const mapping = questionIdMap[oldQId];

    if (mapping) {
      await prisma.$executeRawUnsafe(
        `UPDATE "test_questions" SET "questionId" = $1, "subjectId" = $2 WHERE id = $3`,
        mapping.newId, mapping.subjectId, tq.id
      );
      tqUpdated++;
    }
  }
  logLine(`  Updated ${tqUpdated} test_question rows.`);

  // ──────────────────────────────────────────────
  // Step 6: Update StudentTestAnswer references in DB
  // ──────────────────────────────────────────────
  logLine('\nStep 6: Updating StudentTestAnswer references...');
  const staRows = await prisma.$queryRaw`SELECT * FROM "student_test_answers" ORDER BY id`;
  logLine(`  Found ${staRows.length} student_test_answer rows to update.`);

  let staUpdated = 0;
  for (const sta of staRows) {
    const oldQId = sta.questionId || sta.question_id;
    const mapping = questionIdMap[oldQId];

    if (mapping) {
      await prisma.$executeRawUnsafe(
        `UPDATE "student_test_answers" SET "questionId" = $1, "subjectId" = $2 WHERE id = $3`,
        mapping.newId, mapping.subjectId, sta.id
      );
      staUpdated++;
    }
  }
  logLine(`  Updated ${staUpdated} student_test_answer rows.`);

  // ──────────────────────────────────────────────
  // Step 7: Final Summary
  // ──────────────────────────────────────────────
  logLine('\n=== Migration Completed ===');
  logLine(`Syllabus mapped: ${Object.keys(syllabusIdMap).length}`);
  logLine(`Questions mapped: ${Object.keys(questionIdMap).length}`);
  logLine(`TestQuestion updated: ${tqUpdated}`);
  logLine(`StudentTestAnswer updated: ${staUpdated}`);
  logLine(`Ended at: ${new Date().toISOString()}`);

  // Write log file
  fs.writeFileSync('migration_log_verbose.txt', log);
  logLine('\nFull log saved to migration_log_verbose.txt');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
