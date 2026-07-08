import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class StudentController {
  /**
   * Get random practice questions from the DB for student self-study modes.
   * Query params: subjectId (optional), syllabusId (optional), topic (optional), limit (default 5)
   */
  static async getPracticeQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string, 10) : undefined;
      const syllabusId = req.query.syllabusId ? parseInt(req.query.syllabusId as string, 10) : undefined;
      const topic = req.query.topic as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

      const where: any = { isActive: true };
      if (subjectId) where.subjectId = subjectId;
      if (syllabusId) where.syllabusId = syllabusId;
      if (topic) {
        where.syllabus = { topic: { contains: topic, mode: 'insensitive' } };
      }

      const questions = await prisma.question.findMany({
        where,
        include: { syllabus: true, subject: true },
      });

      // Shuffle and take limit
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, limit);

      const mapped = selected.map((q) => ({
        id: String(q.id),
        question: q.questionText,
        questionText: q.questionText,
        options: q.options,
        answer: q.correctAnswer,
        correctAnswer: q.correctAnswer,
        topic: q.syllabus?.topic || 'General',
        subject: q.subject?.name || 'General',
        difficulty: q.difficulty,
        marks: q.marks,
      }));

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }


  /**
   * Get pending tests assigned to the logged-in student.
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
                include: {
                  question: {
                    include: {
                      syllabus: true,
                    },
                  },
                },
                orderBy: {
                  questionOrder: 'asc'
                }
              },
            },
          },
        },
        orderBy: { test: { createdAt: 'desc' } },
      });

      const mapped = studentTests.map((st) => {
        const topicName = st.test.testQuestions[0]?.question.syllabus?.topic || 'General';
        const questionsList = st.test.testQuestions.map((tq) => ({
          id: String(tq.question.id),
          question: tq.question.questionText,
          questionText: tq.question.questionText,
          options: tq.question.options,
          answer: tq.question.correctAnswer,
          correctAnswer: tq.question.correctAnswer,
          topic: tq.question.syllabus?.topic || 'General',
          difficulty: tq.question.difficulty,
          marks: tq.question.marks,
        }));

        return {
          id: String(st.id), // Use studentTest ID as the frontend test ID
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
      });

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get completed tests for the logged-in student.
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
                include: {
                  question: {
                    include: {
                      syllabus: true,
                    },
                  },
                },
                orderBy: {
                  questionOrder: 'asc'
                }
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      const mapped = studentTests.map((st) => {
        const topicName = st.test.testQuestions[0]?.question.syllabus?.topic || 'General';
        const questionsList = st.test.testQuestions.map((tq) => ({
          id: String(tq.question.id),
          question: tq.question.questionText,
          questionText: tq.question.questionText,
          options: tq.question.options,
          answer: tq.question.correctAnswer,
          correctAnswer: tq.question.correctAnswer,
          topic: tq.question.syllabus?.topic || 'General',
          difficulty: tq.question.difficulty,
          marks: tq.question.marks,
        }));

        const answersMap = st.answers.reduce((acc: any, ans) => {
          acc[String(ans.questionId)] = ans.selectedAnswer;
          return acc;
        }, {});

        return {
          id: String(st.id), // Use studentTest ID as the frontend test ID
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
      });

      res.status(200).json(mapped);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit and auto-grade student's answers for a test.
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

      const studentTest = await prisma.studentTest.findUnique({
        where: { id: studentTestId },
        include: {
          test: {
            include: {
              testQuestions: {
                include: {
                  question: true,
                },
              },
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

      let correctCount = 0;
      const testQuestions = studentTest.test.testQuestions;
      const answerRecords: {
        questionId: number;
        selectedAnswer: string;
        isCorrect: boolean;
        marksAwarded: number;
      }[] = [];

      for (const tq of testQuestions) {
        const q = tq.question;
        const studentSelected = answers[String(q.id)] || '';
        // Exact match with correct answer
        const isCorrect = studentSelected.trim() === q.correctAnswer.trim();
        if (isCorrect) {
          correctCount += 1;
        }
        answerRecords.push({
          questionId: q.id,
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

        // 2. Create StudentTestAnswer records
        await tx.studentTestAnswer.createMany({
          data: answerRecords.map((r) => ({
            studentTestId: studentTest.id,
            questionId: r.questionId,
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
}
