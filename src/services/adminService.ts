import prisma from '../config/database';

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
   * Columns: student name, student grade, teacher name, teacher email, connected date.
   * Returns one row per student-teacher link.
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
      teacherId: link.teacher.id,
      teacherName: link.teacher.name,
      teacherEmail: link.teacher.email,
      teacherCode: link.teacher.teacherCode,
      teacherSubjects: link.teacher.subjects,
      connectedAt: link.linkedAt,
    }));
  }

  /**
   * All students list — shows parent name instead of parentId.
   */
  static async getAllStudents() {
    const students = await prisma.studentProfile.findMany({
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
}
