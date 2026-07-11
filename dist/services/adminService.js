"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AdminService {
    /**
     * Student-Parent table view.
     * Columns: parent name, parent email, child's grade, child's name, prep strategy (targetedSchool).
     * Returns one row per parent-child link.
     */
    static async getStudentParents() {
        const parents = await database_1.default.parentProfile.findMany({
            include: {
                students: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentCode: true,
                        grade: true,
                        targetedSchool: true,
                    },
                },
            },
            orderBy: { id: 'asc' },
        });
        // Flatten: one row per parent-child link
        const rows = [];
        for (const parent of parents) {
            if (parent.students.length === 0) {
                // Parent with no linked child
                rows.push({
                    parentId: parent.id,
                    parentName: parent.name,
                    parentEmail: parent.email,
                    parentContact: parent.contactInfo,
                    childId: null,
                    childName: null,
                    childGrade: null,
                    childCode: null,
                    childTargetedSchool: null,
                });
            }
            else {
                for (const child of parent.students) {
                    rows.push({
                        parentId: parent.id,
                        parentName: parent.name,
                        parentEmail: parent.email,
                        parentContact: parent.contactInfo,
                        childId: child.id,
                        childName: child.name,
                        childEmail: child.email,
                        childCode: child.studentCode,
                        childGrade: child.grade,
                        childTargetedSchool: child.targetedSchool,
                    });
                }
            }
        }
        return rows;
    }
    /**
     * Student-Teacher table view.
     * Columns: student name, student grade, teacher name, teacher email, connected date.
     * Returns one row per student-teacher link.
     */
    static async getStudentTeachers() {
        const links = await database_1.default.studentTeacher.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentCode: true,
                        grade: true,
                        targetedSchool: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        teacherCode: true,
                        subjects: true,
                    },
                },
            },
            orderBy: { linkedAt: 'desc' },
        });
        return links.map((link) => ({
            studentId: link.student.id,
            studentName: link.student.name,
            studentEmail: link.student.email,
            studentCode: link.student.studentCode,
            studentGrade: link.student.grade,
            studentTargetedSchool: link.student.targetedSchool,
            teacherId: link.teacher.id,
            teacherName: link.teacher.name,
            teacherEmail: link.teacher.email,
            teacherCode: link.teacher.teacherCode,
            teacherSubjects: link.teacher.subjects,
            subject: link.teacher.subjects.length > 0 ? link.teacher.subjects[0] : null,
            connectedAt: link.linkedAt,
        }));
    }
    /**
     * All students list — shows parent name instead of parentId.
     */
    static async getAllStudents() {
        const students = await database_1.default.studentProfile.findMany({
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                teachers: {
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                teacherCode: true,
                            },
                        },
                    },
                },
            },
            orderBy: { id: 'asc' },
        });
        return students.map((s) => ({
            id: s.id,
            userId: s.userId,
            studentCode: s.studentCode,
            name: s.name,
            email: s.email,
            grade: s.grade,
            targetedSchool: s.targetedSchool,
            parentName: s.parent?.name || null,
            parentEmail: s.parent?.email || null,
            teachers: s.teachers.map((t) => ({
                id: t.teacher.id,
                name: t.teacher.name,
                email: t.teacher.email,
                teacherCode: t.teacher.teacherCode,
                connectedAt: t.linkedAt,
            })),
        }));
    }
    /**
     * Get all parents from the database with their linked children.
     */
    static async getParents() {
        const parents = await database_1.default.parentProfile.findMany({
            include: {
                students: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        studentCode: true,
                        grade: true,
                        targetedSchool: true,
                    },
                },
            },
            orderBy: { id: 'asc' },
        });
        return parents;
    }
    /**
     * Get all teachers from the database with their linked students.
     */
    static async getTeachers() {
        const teachers = await database_1.default.teacherProfile.findMany({
            include: {
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                studentCode: true,
                                grade: true,
                                targetedSchool: true,
                            },
                        },
                    },
                },
            },
            orderBy: { id: 'asc' },
        });
        return teachers.map((t) => ({
            id: t.id,
            userId: t.userId,
            teacherCode: t.teacherCode,
            subjects: t.subjects,
            contactInfo: t.contactInfo,
            name: t.name,
            email: t.email,
            students: t.students.map((st) => st.student),
        }));
    }
    /**
     * Parent-Teacher table view (auto-generated from student-teacher links).
     * Columns: parent name, teacher name, child name, grade, subject, targeted school.
     */
    static async getParentTeachers() {
        const links = await database_1.default.parentTeacher.findMany({
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        teacherCode: true,
                        subjects: true,
                    },
                },
            },
            orderBy: { linkedAt: 'desc' },
        });
        // Enrich with student details by querying student_teachers
        const enrichedLinks = await Promise.all(links.map(async (link) => {
            // Get all students linked to both parent and teacher
            const studentTeachers = await database_1.default.studentTeacher.findMany({
                where: {
                    teacherId: link.teacher.id,
                    student: {
                        parentId: link.parent.id,
                    },
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            grade: true,
                            targetedSchool: true,
                        },
                    },
                },
            });
            // Return one row per student (could be multiple students per parent-teacher)
            return studentTeachers.map((st) => ({
                parentId: link.parent.id,
                parentName: link.parent.name,
                parentEmail: link.parent.email,
                teacherId: link.teacher.id,
                teacherName: link.teacher.name,
                teacherEmail: link.teacher.email,
                teacherCode: link.teacher.teacherCode,
                subject: link.teacher.subjects.length > 0 ? link.teacher.subjects[0] : null,
                teacherSubjects: link.teacher.subjects,
                childId: st.student.id,
                childName: st.student.name,
                childGrade: st.student.grade,
                childTargetedSchool: st.student.targetedSchool,
                linkedAt: link.linkedAt,
            }));
        }));
        // Flatten the array of arrays
        return enrichedLinks.flat();
    }
    /**
     * Bulk upload parsed questions into a subject and syllabus category.
     */
    static async bulkCreateQuestions(subjectName, questions) {
        let mappedName = subjectName;
        const lowerName = subjectName.toLowerCase();
        if (['math', 'maths', 'mathematics'].includes(lowerName)) {
            mappedName = 'Maths';
        }
        else if (['english'].includes(lowerName)) {
            mappedName = 'English';
        }
        else if (['verbal', 'verbal reasoning', 'vr'].includes(lowerName)) {
            mappedName = 'Verbal Reasoning';
        }
        else if (['non-verbal', 'non-verbal reasoning', 'nvr'].includes(lowerName)) {
            mappedName = 'Non-Verbal Reasoning';
        }
        // Find the subject
        let subject = await database_1.default.subject.findFirst({
            where: {
                name: {
                    equals: mappedName,
                    mode: 'insensitive'
                }
            }
        });
        if (!subject) {
            subject = await database_1.default.subject.create({
                data: {
                    name: mappedName,
                    description: `${mappedName} academic area.`
                }
            });
        }
        const createdQuestions = [];
        for (const q of questions) {
            let syllabusId = null;
            if (q.topic) {
                let syllabus = await database_1.default.syllabus.findFirst({
                    where: {
                        subjectId: subject.id,
                        topic: {
                            equals: q.topic,
                            mode: 'insensitive'
                        },
                        subTopic: q.subTopic ? {
                            equals: q.subTopic,
                            mode: 'insensitive'
                        } : null
                    }
                });
                if (!syllabus) {
                    syllabus = await database_1.default.syllabus.create({
                        data: {
                            subjectId: subject.id,
                            topic: q.topic,
                            subTopic: q.subTopic || null,
                            description: q.topicDescription || null
                        }
                    });
                }
                syllabusId = syllabus.id;
            }
            // Check if duplicate question exists under this subject
            const existingQuestion = await database_1.default.question.findFirst({
                where: {
                    subjectId: subject.id,
                    questionText: q.questionText
                }
            });
            if (existingQuestion) {
                // Skip duplicate
                continue;
            }
            const created = await database_1.default.question.create({
                data: {
                    subjectId: subject.id,
                    syllabusId: syllabusId,
                    questionType: q.questionType || 'TEXT',
                    questionText: q.questionText,
                    questionImage: q.questionImage || null,
                    options: q.options || null,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || null,
                    difficulty: q.difficulty || 'MEDIUM',
                    marks: q.marks !== undefined ? parseInt(String(q.marks)) : 1,
                    isActive: q.isActive !== undefined ? q.isActive : true
                }
            });
            createdQuestions.push(created);
        }
        return {
            subjectId: subject.id,
            count: createdQuestions.length,
            questions: createdQuestions
        };
    }
    static async getSyllabusOverview() {
        const lastQuestion = await database_1.default.question.findFirst({
            orderBy: { updatedAt: 'desc' },
            select: { updatedAt: true }
        });
        const lastReviseTime = lastQuestion ? lastQuestion.updatedAt : null;
        const subjects = await database_1.default.subject.findMany({
            include: {
                syllabus: {
                    include: {
                        _count: {
                            select: { questions: true }
                        }
                    },
                    orderBy: { displayOrder: 'asc' }
                }
            },
            orderBy: { id: 'asc' }
        });
        // Format to return structure
        return subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            description: subject.description,
            lastReviseTime: lastReviseTime ? lastReviseTime.toISOString() : null,
            topics: subject.syllabus.map(topic => ({
                id: topic.id,
                name: topic.topic,
                subTopic: topic.subTopic,
                description: topic.description,
                dbCount: topic._count.questions
            }))
        }));
    }
    /**
     * Get all questions for a topic.
     */
    static async getQuestionsByTopic(topicName, subjectName) {
        const whereClause = {
            syllabus: {
                topic: {
                    equals: topicName,
                    mode: 'insensitive'
                }
            }
        };
        if (subjectName) {
            whereClause.subject = {
                name: {
                    equals: subjectName,
                    mode: 'insensitive'
                }
            };
        }
        const questionRows = await database_1.default.question.findMany({
            where: whereClause,
            orderBy: { id: 'asc' }
        });
        return questionRows;
    }
}
exports.AdminService = AdminService;
