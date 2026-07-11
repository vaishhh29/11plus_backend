"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const database_1 = __importDefault(require("../config/database"));
const subjectResolver_1 = require("../utils/subjectResolver");
class StudentController {
    /**
     * Get random practice questions from the DB for student self-study modes.
     * Query params: subjectId (optional), syllabusId (optional), topic (optional), limit (default 5)
     */
    static async getPracticeQuestions(req, res, next) {
        try {
            const subjectId = req.query.subjectId ? parseInt(req.query.subjectId, 10) : undefined;
            const syllabusId = req.query.syllabusId ? parseInt(req.query.syllabusId, 10) : undefined;
            const topic = req.query.topic;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
            // If subjectId is provided, query that specific table
            if (subjectId) {
                const questionModel = (0, subjectResolver_1.getQuestionModel)(subjectId);
                const syllabusModel = (0, subjectResolver_1.getSyllabusModel)(subjectId);
                const where = { isActive: true };
                if (syllabusId)
                    where.syllabusId = syllabusId;
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
                const subject = await database_1.default.subject.findUnique({ where: { id: subjectId } });
                const mapped = selected.map((q) => ({
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
                }));
                res.status(200).json(mapped);
                return;
            }
            // If no subjectId, query all 4 tables and combine
            const allQuestions = [];
            const subjectNames = {};
            for (const sid of [subjectResolver_1.SUBJECT_IDS.MATHS, subjectResolver_1.SUBJECT_IDS.ENGLISH, subjectResolver_1.SUBJECT_IDS.VR, subjectResolver_1.SUBJECT_IDS.NVR]) {
                try {
                    const questionModel = (0, subjectResolver_1.getQuestionModel)(sid);
                    const where = { isActive: true };
                    if (topic) {
                        const syllabusModel = (0, subjectResolver_1.getSyllabusModel)(sid);
                        const syllabusEntry = await syllabusModel.findFirst({
                            where: { topic: { contains: topic, mode: 'insensitive' } }
                        });
                        if (syllabusEntry) {
                            where.syllabusId = syllabusEntry.id;
                        }
                        else {
                            continue; // No matching topic in this subject
                        }
                    }
                    const questions = await questionModel.findMany({
                        where,
                        include: { syllabus: true },
                    });
                    if (!subjectNames[sid]) {
                        const subject = await database_1.default.subject.findUnique({ where: { id: sid } });
                        subjectNames[sid] = subject?.name || 'General';
                    }
                    for (const q of questions) {
                        allQuestions.push({ ...q, _subjectId: sid, _subjectName: subjectNames[sid] });
                    }
                }
                catch (e) {
                    // skip unknown subjects
                }
            }
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, limit);
            const mapped = selected.map((q) => ({
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
            }));
            res.status(200).json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get pending tests assigned to the logged-in student.
     * Resolves questions from subject-specific tables.
     */
    static async getPendingTests(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const studentProfile = await database_1.default.studentProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!studentProfile) {
                res.status(404).json({ message: 'Student profile not found.' });
                return;
            }
            const studentTests = await database_1.default.studentTest.findMany({
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
            const mapped = await Promise.all(studentTests.map(async (st) => {
                const subjectId = st.test.subjectId;
                const questionIds = st.test.testQuestions.map((tq) => tq.questionId);
                let questionsData = [];
                try {
                    questionsData = await (0, subjectResolver_1.getQuestionsByIds)(questionIds, subjectId);
                }
                catch (e) {
                    console.error(`Failed to resolve questions for test ${st.test.id}:`, e);
                }
                const questionMap = new Map();
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
            }));
            res.status(200).json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get completed tests for the logged-in student.
     * Resolves questions from subject-specific tables.
     */
    static async getCompletedTests(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const studentProfile = await database_1.default.studentProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!studentProfile) {
                res.status(404).json({ message: 'Student profile not found.' });
                return;
            }
            const studentTests = await database_1.default.studentTest.findMany({
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
            const mapped = await Promise.all(studentTests.map(async (st) => {
                const subjectId = st.test.subjectId;
                const questionIds = st.test.testQuestions.map((tq) => tq.questionId);
                let questionsData = [];
                try {
                    questionsData = await (0, subjectResolver_1.getQuestionsByIds)(questionIds, subjectId);
                }
                catch (e) {
                    console.error(`Failed to resolve questions for test ${st.test.id}:`, e);
                }
                const questionMap = new Map();
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
                    };
                });
                const answersMap = st.answers.reduce((acc, ans) => {
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
            }));
            res.status(200).json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Submit and auto-grade student's answers for a test.
     * Resolves questions from subject-specific tables for grading.
     */
    static async submitTest(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const studentProfile = await database_1.default.studentProfile.findUnique({
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
            const studentTest = await database_1.default.studentTest.findUnique({
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
            const questionsData = await (0, subjectResolver_1.getQuestionsByIds)(questionIds, subjectId);
            const questionMap = new Map();
            for (const q of questionsData) {
                questionMap.set(q.id, q);
            }
            let correctCount = 0;
            const testQuestions = studentTest.test.testQuestions;
            const answerRecords = [];
            for (const tq of testQuestions) {
                const q = questionMap.get(tq.questionId);
                if (!q)
                    continue;
                const studentSelected = answers[String(q.id)] || '';
                const isCorrect = studentSelected.trim() === q.correctAnswer.trim();
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
            await database_1.default.$transaction(async (tx) => {
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudentController = StudentController;
