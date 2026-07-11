import prisma from '../config/database';
import {
  resolveSubjectId,
  resolveSubjectName,
  getSyllabusModel,
  getQuestionModel,
  SUBJECT_IDS,
} from '../utils/subjectResolver';

export class AdminService {
  /**
   * Student-Parent table view.
   * Columns: parent name, parent email, child's grade, child's name, prep strategy (targetedSchool).
   * Returns one row per parent-child link.
   */
  static async getStudentParents() {
    const parents = await prisma.parentProfile.findMany({
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
    const rows: any[] = [];
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
      } else {
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
   */
  static async getStudentTeachers() {
    const links = await prisma.studentTeacher.findMany({
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
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            createdAt: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
            contactInfo: true,
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
                subjects: true,
                contactInfo: true,
              },
            },
          },
        },
        progress: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        studentTests: {
          include: {
            test: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                totalMarks: true,
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
      parentPhone: s.parent?.contactInfo || null,
      joinedDate: s.user?.createdAt || null,
      teachers: s.teachers.map((t) => ({
        id: t.teacher.id,
        name: t.teacher.name,
        email: t.teacher.email,
        teacherCode: t.teacher.teacherCode,
        subjects: t.teacher.subjects,
        contactInfo: t.teacher.contactInfo,
        connectedAt: t.linkedAt,
      })),
      progress: s.progress.map((p) => ({
        id: p.id,
        subjectId: p.subjectId,
        subjectName: p.subject.name,
        level: p.level,
        progressPercentage: p.progressPercentage,
        assignedQuestions: p.assignedQuestions,
        completedQuestions: p.completedQuestions,
        status: p.status,
        updatedAt: p.updatedAt,
      })),
      studentTests: s.studentTests.map((st) => ({
        id: st.id,
        testId: st.testId,
        testTitle: st.test.title,
        testType: st.test.type,
        duration: st.test.duration,
        obtainedMarks: st.obtainedMarks,
        totalMarks: st.totalMarks,
        percentage: st.percentage,
        grade: st.grade,
        status: st.status,
        submittedAt: st.submittedAt,
      })),
    }));
  }

  /**
   * Get all parents from the database with their linked children.
   */
  static async getParents() {
    const parents = await prisma.parentProfile.findMany({
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
    const teachers = await prisma.teacherProfile.findMany({
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
   */
  static async getParentTeachers() {
    const links = await prisma.parentTeacher.findMany({
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
    const enrichedLinks = await Promise.all(
      links.map(async (link: any) => {
        const studentTeachers = await prisma.studentTeacher.findMany({
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
      })
    );

    return enrichedLinks.flat();
  }

  /**
   * Bulk upload parsed questions into a subject-specific question table.
   * Routes to the correct table based on subject name.
   */
  static async bulkCreateQuestions(subjectName: string, questions: any[]) {
    const mappedName = resolveSubjectName(subjectName);
    const subjectId = resolveSubjectId(subjectName);

    // Ensure the subject registry entry exists
    let subject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: mappedName,
          mode: 'insensitive'
        }
      }
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: mappedName,
          description: `${mappedName} academic area.`
        }
      });
    }

    const syllabusModel = getSyllabusModel(subjectId);
    const questionModel = getQuestionModel(subjectId);

    const createdQuestions = [];
    const skippedQuestions = [];

    for (const q of questions) {
      let syllabusId: number | null = null;

      if (q.topic) {
        // Find or create syllabus entry in subject-specific table
        let syllabus = await syllabusModel.findFirst({
          where: {
            topic: {
              equals: q.topic,
              mode: 'insensitive'
            },
            ...(q.subTopic ? {
              subTopic: {
                equals: q.subTopic,
                mode: 'insensitive'
              }
            } : { subTopic: null })
          }
        });

        if (!syllabus) {
          syllabus = await syllabusModel.create({
            data: {
              topic: q.topic,
              subTopic: q.subTopic || null,
              description: q.topicDescription || null
            }
          });
        }
        syllabusId = syllabus.id;
      }

      // Duplicate check in subject-specific question table
      const existingQuestions = await questionModel.findMany({
        where: {
          questionText: q.questionText
        }
      });

      let isDuplicate = false;
      for (const eq of existingQuestions) {
        if (eq.correctAnswer !== q.correctAnswer) {
          continue;
        }

        const eqOptions = Array.isArray(eq.options) ? eq.options : [];
        const qOptions = Array.isArray(q.options) ? q.options : [];
        if (eqOptions.length !== qOptions.length) {
          continue;
        }

        let optionsMatch = true;
        for (let idx = 0; idx < eqOptions.length; idx++) {
          if (String(eqOptions[idx]) !== String(qOptions[idx])) {
            optionsMatch = false;
            break;
          }
        }

        if (optionsMatch) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate) {
        skippedQuestions.push({
          questionText: q.questionText,
          correctAnswer: q.correctAnswer
        });
        continue;
      }

      const created = await questionModel.create({
        data: {
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
      questions: createdQuestions,
      skippedCount: skippedQuestions.length,
      skippedQuestions
    };
  }

  /**
   * Get all subjects with their syllabus topics and question counts.
   * Queries all 4 subject-specific syllabus/question tables and aggregates results.
   */
  static async getSyllabusOverview() {
    // Get all subjects from registry
    const subjects = await prisma.subject.findMany({
      orderBy: { id: 'asc' }
    });

    const result = [];

    for (const subject of subjects) {
      const subjectId = subject.id;
      let topics: any[] = [];

      try {
        const syllabusModel = getSyllabusModel(subjectId);
        const questionModel = getQuestionModel(subjectId);

        const syllabusEntries = await syllabusModel.findMany({
          orderBy: { displayOrder: 'asc' }
        });

        topics = await Promise.all(
          syllabusEntries.map(async (entry: any) => {
            const count = await questionModel.count({
              where: { syllabusId: entry.id }
            });
            return {
              id: entry.id,
              name: entry.topic,
              subTopic: entry.subTopic,
              description: entry.description,
              dbCount: count
            };
          })
        );
      } catch (e) {
        // If subjectId doesn't map to a known table (e.g. future subjects), skip
        topics = [];
      }

      // Get last updated timestamp from questions
      let lastReviseTime: string | null = null;
      try {
        const questionModel = getQuestionModel(subjectId);
        const lastQ = await questionModel.findFirst({
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true }
        });
        lastReviseTime = lastQ ? lastQ.updatedAt.toISOString() : null;
      } catch (e) {
        // ignore
      }

      result.push({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        lastReviseTime,
        topics
      });
    }

    return result;
  }

  /**
   * Get all questions for a topic from the correct subject-specific table.
   */
  static async getQuestionsByTopic(topicName: string, subjectName?: string) {
    // If subject is provided, query only that subject's table
    if (subjectName) {
      const subjectId = resolveSubjectId(subjectName);
      const questionModel = getQuestionModel(subjectId);
      const syllabusModel = getSyllabusModel(subjectId);

      // Find syllabus entry
      const syllabus = await syllabusModel.findFirst({
        where: {
          topic: {
            equals: topicName,
            mode: 'insensitive'
          }
        }
      });

      if (!syllabus) return [];

      const questions = await questionModel.findMany({
        where: { syllabusId: syllabus.id },
        orderBy: { id: 'asc' }
      });

      return questions.map((q: any) => ({
        ...q,
        subjectId: subjectId,
        topic: syllabus.topic
      }));
    }

    // If no subject specified, search across all 4 tables
    const allQuestions: any[] = [];
    for (const sid of [SUBJECT_IDS.MATHS, SUBJECT_IDS.ENGLISH, SUBJECT_IDS.VR, SUBJECT_IDS.NVR]) {
      try {
        const syllabusModel = getSyllabusModel(sid);
        const questionModel = getQuestionModel(sid);

        const syllabus = await syllabusModel.findFirst({
          where: {
            topic: {
              equals: topicName,
              mode: 'insensitive'
            }
          }
        });

        if (syllabus) {
          const questions = await questionModel.findMany({
            where: { syllabusId: syllabus.id },
            orderBy: { id: 'asc' }
          });

          allQuestions.push(...questions.map((q: any) => ({
            ...q,
            subjectId: sid,
            topic: syllabus.topic
          })));
        }
      } catch (e) {
        // skip
      }
    }

    return allQuestions;
  }
}
