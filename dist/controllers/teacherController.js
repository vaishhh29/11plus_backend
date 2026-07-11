"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const database_1 = __importDefault(require("../config/database"));
const adminService_1 = require("../services/adminService");
const subjectResolver_1 = require("../utils/subjectResolver");
class TeacherController {
    /**
     * Get students connected to the logged-in teacher.
     */
    static async getStudents(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const teacherProfile = await database_1.default.teacherProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!teacherProfile) {
                res.status(404).json({ message: 'Teacher profile not found.' });
                return;
            }
            const studentTeachers = await database_1.default.studentTeacher.findMany({
                where: { teacherId: teacherProfile.id },
                include: {
                    student: true,
                },
            });
            const students = studentTeachers.map((st) => ({
                id: st.student.id,
                userId: st.student.userId,
                name: st.student.name,
                email: st.student.email,
                studentCode: st.student.studentCode,
                grade: st.student.grade,
                targetedSchool: st.student.targetedSchool,
            }));
            res.status(200).json(students);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get syllabus overview (subjects and topics with question counts).
     */
    static async getSyllabus(req, res, next) {
        try {
            const syllabusOverview = await adminService_1.AdminService.getSyllabusOverview();
            res.status(200).json(syllabusOverview);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get questions for test creator preview.
     * Queries the subject-specific question table based on subjectId.
     */
    static async getQuestions(req, res, next) {
        try {
            const subjectId = req.query.subjectId ? parseInt(req.query.subjectId, 10) : undefined;
            const syllabusId = req.query.syllabusId ? parseInt(req.query.syllabusId, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            if (!subjectId) {
                res.status(400).json({ message: 'subjectId is a required query parameter.' });
                return;
            }
            const questionModel = (0, subjectResolver_1.getQuestionModel)(subjectId);
            const where = { isActive: true };
            if (syllabusId)
                where.syllabusId = syllabusId;
            const questions = await questionModel.findMany({
                where,
                include: { syllabus: true },
            });
            // Shuffle and take limit
            const shuffled = questions.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, limit);
            const mapped = selected.map((q) => ({
                id: q.id,
                question: q.questionText,
                questionText: q.questionText,
                options: q.options,
                answer: q.correctAnswer,
                correctAnswer: q.correctAnswer,
                topic: q.syllabus?.topic || 'General',
                difficulty: q.difficulty,
                marks: q.marks,
                isActive: q.isActive,
            }));
            res.status(200).json(mapped);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create a new test template and assign to students.
     */
    static async createTest(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const teacherProfile = await database_1.default.teacherProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!teacherProfile) {
                res.status(404).json({ message: 'Teacher profile not found.' });
                return;
            }
            const { studentIds, subjectId, title, type, duration, questionIds, dueDate } = req.body;
            if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
                res.status(450).json({ message: 'studentIds array is required.' });
                return;
            }
            if (!subjectId) {
                res.status(450).json({ message: 'subjectId is required.' });
                return;
            }
            if (!title) {
                res.status(450).json({ message: 'title is required.' });
                return;
            }
            if (!type) {
                res.status(450).json({ message: 'type is required.' });
                return;
            }
            if (!duration) {
                res.status(450).json({ message: 'duration is required.' });
                return;
            }
            if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
                res.status(450).json({ message: 'questionIds array is required.' });
                return;
            }
            const result = await database_1.default.$transaction(async (tx) => {
                // Create test template
                const test = await tx.test.create({
                    data: {
                        teacherId: teacherProfile.id,
                        subjectId,
                        title,
                        type,
                        duration,
                        totalMarks: questionIds.length,
                        assignedDate: new Date(),
                        dueDate: dueDate ? new Date(dueDate) : null,
                    },
                });
                // Link questions with subjectId discriminator
                await tx.testQuestion.createMany({
                    data: questionIds.map((qid, idx) => ({
                        testId: test.id,
                        questionId: qid,
                        subjectId: subjectId,
                        questionOrder: idx,
                    })),
                });
                // Assign to students
                const studentTests = [];
                for (const sid of studentIds) {
                    const st = await tx.studentTest.create({
                        data: {
                            studentId: sid,
                            testId: test.id,
                            totalMarks: questionIds.length,
                            status: 'STARTED',
                        },
                    });
                    studentTests.push(st);
                }
                return { test, studentTests };
            });
            res.status(201).json({
                message: 'Successfully assigned test to students.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get tests created by the teacher.
     * Resolves questions from subject-specific tables using the discriminator.
     */
    static async getTests(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const teacherProfile = await database_1.default.teacherProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!teacherProfile) {
                res.status(404).json({ message: 'Teacher profile not found.' });
                return;
            }
            const tests = await database_1.default.test.findMany({
                where: { teacherId: teacherProfile.id },
                include: {
                    subject: true,
                    testQuestions: {
                        orderBy: { questionOrder: 'asc' },
                    },
                    studentTests: {
                        include: {
                            student: true,
                            answers: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            // Flatten to the format storage.getMockTests expects
            const flattenedAssigns = [];
            for (const t of tests) {
                // Resolve actual question data from subject-specific tables
                const subjectId = t.subjectId;
                const questionIds = t.testQuestions.map((tq) => tq.questionId);
                let questionsData = [];
                try {
                    questionsData = await (0, subjectResolver_1.getQuestionsByIds)(questionIds, subjectId);
                }
                catch (e) {
                    console.error(`Failed to resolve questions for test ${t.id}:`, e);
                }
                // Build a lookup map: questionId -> question data
                const questionMap = new Map();
                for (const q of questionsData) {
                    questionMap.set(q.id, q);
                }
                const topicName = questionsData[0]?.syllabus?.topic || 'General';
                const questionsList = t.testQuestions.map((tq) => {
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
                for (const st of t.studentTests) {
                    const answersMap = st.answers.reduce((acc, ans) => {
                        acc[String(ans.questionId)] = ans.selectedAnswer;
                        return acc;
                    }, {});
                    flattenedAssigns.push({
                        id: String(st.id),
                        testId: t.id,
                        title: t.title,
                        subject: t.subject.name,
                        topic: topicName,
                        duration: t.duration,
                        createdById: teacherProfile.email,
                        assignedToId: st.student.email,
                        completed: st.status === 'SUBMITTED' || st.status === 'GRADED',
                        score: st.percentage !== null ? Math.round(st.percentage) : null,
                        timeTaken: st.submittedAt ? Math.round((st.submittedAt.getTime() - st.startedAt.getTime()) / 60000) : null,
                        answers: st.status === 'SUBMITTED' || st.status === 'GRADED' ? answersMap : null,
                        questions: questionsList,
                        postedAt: t.createdAt.toISOString(),
                        dueTime: t.dueDate ? t.dueDate.toISOString() : null,
                        completedAt: st.submittedAt ? st.submittedAt.toISOString() : null,
                    });
                }
            }
            res.status(200).json(flattenedAssigns);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Unlink a student from the teacher.
     */
    static async unlinkStudent(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const teacherProfile = await database_1.default.teacherProfile.findUnique({
                where: { userId: req.user.userId },
            });
            if (!teacherProfile) {
                res.status(404).json({ message: 'Teacher profile not found.' });
                return;
            }
            const studentId = parseInt(req.params.studentId, 10);
            if (isNaN(studentId)) {
                res.status(400).json({ message: 'Valid studentId is required.' });
                return;
            }
            await database_1.default.studentTeacher.deleteMany({
                where: {
                    teacherId: teacherProfile.id,
                    studentId,
                },
            });
            res.status(200).json({ message: 'Student unlinked successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeacherController = TeacherController;
