import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { getQuestionModel, getQuestionsByIds, getQuestionById, findQuestions, getSyllabusModel, SUBJECT_IDS } from '../utils/subjectResolver';

function answersMatch(ans1: string | undefined | null, ans2: string | undefined | null): boolean {
  if (ans1 === undefined || ans1 === null || ans2 === undefined || ans2 === null) return false;
  const clean1 = String(ans1).trim().toLowerCase();
  const clean2 = String(ans2).trim().toLowerCase();
  if (clean1 === clean2) return true;
  
  const parse = (val: string) => {
    const match = val.match(/^([a-d])\s*[\)|:]\s*(.*)$/);
    return match ? { letter: match[1], text: match[2].trim() } : { letter: null, text: val };
  };
  
  const p1 = parse(clean1);
  const p2 = parse(clean2);
  
  if (p1.letter && p2.letter && p1.letter === p2.letter) return true;
  if (p1.letter && clean2 === p1.letter) return true;
  if (p2.letter && clean1 === p2.letter) return true;
  if (p1.text && p2.text && p1.text === p2.text) return true;
  return false;
}

export class StudentController {
  /**
   * Get random practice questions from the DB for student self-study modes.
   * Query params: subjectId (optional), syllabusId (optional), topic (optional), limit (default 5)
   */
  static async getPracticeQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!studentProfile) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }

      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string, 10) : undefined;
      const syllabusId = req.query.syllabusId ? parseInt(req.query.syllabusId as string, 10) : undefined;
      const topic = req.query.topic as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

      // Fetch correct answers to exclude
      const correctAnswers = await prisma.studentTestAnswer.findMany({
        where: {
          studentTest: { studentId: studentProfile.id },
          isCorrect: true,
        },
        select: { questionId: true, subjectId: true },
      });

      const correctIdsBySubject: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] };
      for (const ans of correctAnswers) {
        if (correctIdsBySubject[ans.subjectId]) {
          correctIdsBySubject[ans.subjectId].push(ans.questionId);
        }
      }

      // If subjectId is provided, query that specific table
      if (subjectId) {
        const questionModel = getQuestionModel(subjectId);
        const syllabusModel = getSyllabusModel(subjectId);

        const correctIds = correctIdsBySubject[subjectId] || [];
        const where: any = { isActive: true };
        if (correctIds.length > 0) {
          where.id = { notIn: correctIds };
        }
        if (syllabusId) where.syllabusId = syllabusId;
        if (topic) {
          // Find the syllabus entry first, then filter by its ID
          const syllabusEntry = await syllabusModel.findFirst({
            where: { topic: { contains: topic, mode: 'insensitive' } }
          });
          if (syllabusEntry) {
            where.syllabusId = syllabusEntry.id;
          }
        }

        const questions = await questionModel.findMany({
          where,
          include: { syllabus: true },
        });

        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, limit);

        // Get subject name from registry
        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });

        const mapped = selected.map((q: any) => ({
          id: String(q.id),
          question: q.questionText,
          questionText: q.questionText,
          options: q.options,
          answer: q.correctAnswer,
          correctAnswer: q.correctAnswer,
          topic: q.syllabus?.topic || 'General',
          subject: subject?.name || 'General',
          difficulty: q.difficulty,
          marks: q.marks,
          questionImage: q.questionImage || null,
        }));

        res.status(200).json(mapped);
        return;
      }

      // If no subjectId, query all 4 tables and combine
      const allQuestions: any[] = [];
      const subjectNames: Record<number, string> = {};

      for (const sid of [SUBJECT_IDS.MATHS, SUBJECT_IDS.ENGLISH, SUBJECT_IDS.VR, SUBJECT_IDS.NVR]) {
        try {
          const questionModel = getQuestionModel(sid);
          const correctIds = correctIdsBySubject[sid] || [];
          const where: any = { isActive: true };
          if (correctIds.length > 0) {
            where.id = { notIn: correctIds };
          }

          if (topic) {
            const syllabusModel = getSyllabusModel(sid);
            const syllabusEntry = await syllabusModel.findFirst({
              where: { topic: { contains: topic, mode: 'insensitive' } }
            });
            if (syllabusEntry) {
              where.syllabusId = syllabusEntry.id;
            } else {
              continue; // No matching topic in this subject
            }
          }

          const questions = await questionModel.findMany({
            where,
            include: { syllabus: true },
          });

          if (!subjectNames[sid]) {
            const subject = await prisma.subject.findUnique({ where: { id: sid } });
            subjectNames[sid] = subject?.name || 'General';
          }

          for (const q of questions) {
            allQuestions.push({ ...q, _subjectId: sid, _subjectName: subjectNames[sid] });
          }
        } catch (e) {
          // skip unknown subjects
        }
      }

      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, limit);

      const mapped = selected.map((q: any) => ({
        id: String(q.id),
        question: q.questionText,
        questionText: q.questionText,
        options: q.options,
        answer: q.correctAnswer,
        correctAnswer: q.correctAnswer,
        topic: q.syllabus?.topic || 'General',
        subject: q._subjectName || 'General',
        difficulty: q.difficulty,
        marks: q.marks,
        questionImage: q.questionImage || null,
      }));

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending tests assigned to the logged-in student.
   * Resolves questions from subject-specific tables.
   */
  static async getPendingTests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!studentProfile) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }

      const studentTests = await prisma.studentTest.findMany({
        where: {
          studentId: studentProfile.id,
          status: 'STARTED',
        },
        include: {
          test: {
            include: {
              subject: true,
              teacher: true,
              testQuestions: {
                orderBy: { questionOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { test: { createdAt: 'desc' } },
      });

      const mapped = await Promise.all(
        studentTests.map(async (st) => {
          const subjectId = st.test.subjectId;
          const questionIds = st.test.testQuestions.map((tq) => tq.questionId);
          
          let questionsData: any[] = [];
          try {
            questionsData = await getQuestionsByIds(questionIds, subjectId);
          } catch (e) {
            console.error(`Failed to resolve questions for test ${st.test.id}:`, e);
          }

          const questionMap = new Map<number, any>();
          for (const q of questionsData) {
            questionMap.set(q.id, q);
          }

          const topicName = questionsData[0]?.syllabus?.topic || 'General';
          const questionsList = st.test.testQuestions.map((tq) => {
            const q = questionMap.get(tq.questionId);
            return {
              id: String(tq.questionId),
              question: q?.questionText || '',
              questionText: q?.questionText || '',
              options: q?.options || null,
              answer: q?.correctAnswer || '',
              correctAnswer: q?.correctAnswer || '',
              topic: q?.syllabus?.topic || 'General',
              difficulty: q?.difficulty || null,
              marks: q?.marks || 1,
              questionImage: q?.questionImage || null,
            };
          });

          return {
            id: String(st.id),
            testId: st.test.id,
            title: st.test.title,
            subject: st.test.subject.name,
            topic: topicName,
            duration: st.test.duration,
            createdById: st.test.teacher.email,
            assignedToId: studentProfile.email,
            completed: false,
            score: null,
            timeTaken: null,
            answers: null,
            questions: questionsList,
            postedAt: st.test.createdAt.toISOString(),
            dueTime: st.test.dueDate ? st.test.dueDate.toISOString() : null,
            completedAt: null,
          };
        })
      );

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get completed tests for the logged-in student.
   * Resolves questions from subject-specific tables.
   */
  static async getCompletedTests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!studentProfile) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }

      const studentTests = await prisma.studentTest.findMany({
        where: {
          studentId: studentProfile.id,
          status: {
            in: ['SUBMITTED', 'GRADED'],
          },
        },
        include: {
          answers: true,
          test: {
            include: {
              subject: true,
              teacher: true,
              testQuestions: {
                orderBy: { questionOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      const mapped = await Promise.all(
        studentTests.map(async (st) => {
          const subjectId = st.test.subjectId;
          const questionIds = st.test.testQuestions.map((tq) => tq.questionId);
          
          let questionsData: any[] = [];
          try {
            questionsData = await getQuestionsByIds(questionIds, subjectId);
          } catch (e) {
            console.error(`Failed to resolve questions for test ${st.test.id}:`, e);
          }

          const questionMap = new Map<number, any>();
          for (const q of questionsData) {
            questionMap.set(q.id, q);
          }

          const topicName = questionsData[0]?.syllabus?.topic || 'General';
          const questionsList = st.test.testQuestions.map((tq) => {
            const q = questionMap.get(tq.questionId);
            return {
              id: String(tq.questionId),
              question: q?.questionText || '',
              questionText: q?.questionText || '',
              options: q?.options || null,
              answer: q?.correctAnswer || '',
              correctAnswer: q?.correctAnswer || '',
              topic: q?.syllabus?.topic || 'General',
              difficulty: q?.difficulty || null,
              marks: q?.marks || 1,
              questionImage: q?.questionImage || null,
            };
          });

          const answersMap = st.answers.reduce((acc: any, ans) => {
            acc[String(ans.questionId)] = ans.selectedAnswer;
            return acc;
          }, {});

          return {
            id: String(st.id),
            testId: st.test.id,
            title: st.test.title,
            subject: st.test.subject.name,
            topic: topicName,
            duration: st.test.duration,
            createdById: st.test.teacher.email,
            assignedToId: studentProfile.email,
            completed: true,
            score: st.percentage !== null ? Math.round(st.percentage) : null,
            timeTaken: st.submittedAt ? Math.round((st.submittedAt.getTime() - st.startedAt.getTime()) / 60000) : null,
            answers: answersMap,
            questions: questionsList,
            postedAt: st.test.createdAt.toISOString(),
            dueTime: st.test.dueDate ? st.test.dueDate.toISOString() : null,
            completedAt: st.submittedAt ? st.submittedAt.toISOString() : null,
          };
        })
      );

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit and auto-grade student's answers for a test.
   * Resolves questions from subject-specific tables for grading.
   */
  static async submitTest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!studentProfile) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }

      const studentTestId = parseInt(req.params.id, 10);
      if (isNaN(studentTestId)) {
        res.status(400).json({ message: 'Valid studentTest ID is required in URL.' });
        return;
      }

      const { answers, timeTaken } = req.body;
      if (!answers) {
        res.status(400).json({ message: 'answers object is required in request body.' });
        return;
      }

      // Get the student test with test questions (no deep question include since we'll resolve from subject tables)
      const studentTest = await prisma.studentTest.findUnique({
        where: { id: studentTestId },
        include: {
          test: {
            include: {
              testQuestions: true,
            },
          },
        },
      });

      if (!studentTest) {
        res.status(404).json({ message: 'Assigned student test not found.' });
        return;
      }

      if (studentTest.studentId !== studentProfile.id) {
        res.status(403).json({ message: 'Access denied. This test is not assigned to you.' });
        return;
      }

      if (studentTest.status !== 'STARTED') {
        res.status(400).json({ message: 'This test has already been submitted or completed.' });
        return;
      }

      // Resolve question data from subject-specific tables
      const subjectId = studentTest.test.subjectId;
      const questionIds = studentTest.test.testQuestions.map((tq) => tq.questionId);
      const questionsData = await getQuestionsByIds(questionIds, subjectId);
      
      const questionMap = new Map<number, any>();
      for (const q of questionsData) {
        questionMap.set(q.id, q);
      }

      let correctCount = 0;
      const testQuestions = studentTest.test.testQuestions;
      const answerRecords: {
        questionId: number;
        subjectId: number;
        selectedAnswer: string;
        isCorrect: boolean;
        marksAwarded: number;
      }[] = [];

      for (const tq of testQuestions) {
        const q = questionMap.get(tq.questionId);
        if (!q) continue;

        const studentSelected = answers[String(q.id)] || '';
        const isCorrect = answersMatch(studentSelected, q.correctAnswer);
        if (isCorrect) {
          correctCount += 1;
        }
        answerRecords.push({
          questionId: q.id,
          subjectId: subjectId,
          selectedAnswer: studentSelected,
          isCorrect,
          marksAwarded: isCorrect ? q.marks : 0,
        });
      }

      const percentage = testQuestions.length > 0 ? (correctCount / testQuestions.length) * 100 : 0;

      await prisma.$transaction(async (tx) => {
        // 1. Update StudentTest metrics
        await tx.studentTest.update({
          where: { id: studentTest.id },
          data: {
            status: 'SUBMITTED',
            obtainedMarks: correctCount,
            percentage,
            submittedAt: new Date(),
          },
        });

        // 2. Create StudentTestAnswer records with subjectId discriminator
        await tx.studentTestAnswer.createMany({
          data: answerRecords.map((r) => ({
            studentTestId: studentTest.id,
            questionId: r.questionId,
            subjectId: r.subjectId,
            selectedAnswer: r.selectedAnswer,
            isCorrect: r.isCorrect,
            marksAwarded: r.marksAwarded,
          })),
        });
      });

      res.status(200).json({
        message: 'Successfully submitted test.',
        score: percentage,
        correctCount,
        totalQuestions: testQuestions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dynamic progress percentages for each topic based on overall correct answers.
   */
  static async getTopicProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!studentProfile) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }

      // 1. Fetch all correct questions for the student
      const correctAnswers = await prisma.studentTestAnswer.findMany({
        where: {
          studentTest: { studentId: studentProfile.id },
          isCorrect: true,
        },
        select: { questionId: true, subjectId: true },
      });

      const correctSet = new Set<string>();
      for (const ans of correctAnswers) {
        correctSet.add(`${ans.subjectId}_${ans.questionId}`);
      }

      const progressData: Record<string, any[]> = {
        "Maths": [],
        "English": [],
        "VR": [],
        "NVR": []
      };

      // 2. Query Math syllabus & questions
      const mathsList = await prisma.mathsSyllabus.findMany({
        where: { status: 'ACTIVE' },
        include: { questions: { where: { isActive: true } } },
      });
      for (const topic of mathsList) {
        const total = topic.questions.length;
        const correct = topic.questions.filter((q: any) => correctSet.has(`1_${q.id}`)).length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        progressData["Maths"].push({
          id: topic.id,
          topic: topic.topic,
          subTopic: topic.subTopic || '',
          description: topic.description || '',
          totalQuestions: total,
          correctAnswers: correct,
          percentage: percent,
        });
      }

      // 3. Query English syllabus & questions
      const englishList = await prisma.englishSyllabus.findMany({
        where: { status: 'ACTIVE' },
        include: { questions: { where: { isActive: true } } },
      });
      for (const topic of englishList) {
        const total = topic.questions.length;
        const correct = topic.questions.filter((q: any) => correctSet.has(`2_${q.id}`)).length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        progressData["English"].push({
          id: topic.id,
          topic: topic.topic,
          subTopic: topic.subTopic || '',
          description: topic.description || '',
          totalQuestions: total,
          correctAnswers: correct,
          percentage: percent,
        });
      }

      // 4. Query VR syllabus & questions
      const vrList = await prisma.vRSyllabus.findMany({
        where: { status: 'ACTIVE' },
        include: { questions: { where: { isActive: true } } },
      });
      for (const topic of vrList) {
        const total = topic.questions.length;
        const correct = topic.questions.filter((q: any) => correctSet.has(`3_${q.id}`)).length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        progressData["VR"].push({
          id: topic.id,
          topic: topic.topic,
          subTopic: topic.subTopic || '',
          description: topic.description || '',
          totalQuestions: total,
          correctAnswers: correct,
          percentage: percent,
        });
      }

      // 5. Query NVR syllabus & questions
      const nvrList = await prisma.nVRSyllabus.findMany({
        where: { status: 'ACTIVE' },
        include: { questions: { where: { isActive: true } } },
      });
      for (const topic of nvrList) {
        const total = topic.questions.length;
        const correct = topic.questions.filter((q: any) => correctSet.has(`4_${q.id}`)).length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
        progressData["NVR"].push({
          id: topic.id,
          topic: topic.topic,
          subTopic: topic.subTopic || '',
          description: topic.description || '',
          totalQuestions: total,
          correctAnswers: correct,
          percentage: percent,
        });
      }

      res.status(200).json(progressData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get 60 random questions for standard mock test (no exclusion filters).
   * Pulls 15 questions from each subject table. If a table has fewer, backfills from others.
   */
  static async getMockTestQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjectPools: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [] };
      const subjectNames: Record<number, string> = {
        1: 'Maths',
        2: 'English',
        3: 'Verbal Reasoning',
        4: 'Non-Verbal Reasoning'
      };

      // 1. Fetch active questions from all subjects
      for (const sid of [1, 2, 3, 4]) {
        const model = getQuestionModel(sid);
        const questions = await model.findMany({
          where: { isActive: true },
          include: { syllabus: true },
        });
        subjectPools[sid] = questions;
      }

      const selectedQuestions: any[] = [];
      const targetCountPerSubject = 15;
      
      // Select random 15 from each subject pool first
      const remainderPools: any[] = [];
      
      for (const sid of [1, 2, 3, 4]) {
        const pool = subjectPools[sid];
        const shuffled = pool.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, targetCountPerSubject);
        const remainder = shuffled.slice(targetCountPerSubject);
        
        for (const q of selected) {
          selectedQuestions.push({ ...q, _subjectId: sid, _subjectName: subjectNames[sid] });
        }
        for (const q of remainder) {
          remainderPools.push({ ...q, _subjectId: sid, _subjectName: subjectNames[sid] });
        }
      }

      // If we don't have 60 total questions due to small pools, fill from the remainders
      if (selectedQuestions.length < 60 && remainderPools.length > 0) {
        const shuffledRemainders = remainderPools.sort(() => 0.5 - Math.random());
        const extraNeeded = 60 - selectedQuestions.length;
        const extras = shuffledRemainders.slice(0, extraNeeded);
        for (const q of extras) {
          selectedQuestions.push(q);
        }
      }

      // Finally, shuffle the combined mock test questions list
      const finalShuffled = selectedQuestions.sort(() => 0.5 - Math.random());

      const mapped = finalShuffled.map((q: any) => ({
        id: String(q.id),
        question: q.questionText,
        questionText: q.questionText,
        options: q.options,
        answer: q.correctAnswer,
        correctAnswer: q.correctAnswer,
        topic: q.syllabus?.topic || 'General',
        subject: q._subjectName || 'General',
        difficulty: q.difficulty,
        marks: q.marks,
        questionImage: q.questionImage || null,
      }));

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }
}
