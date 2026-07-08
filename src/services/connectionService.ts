import prisma from '../config/database';
import { RequestStatus } from '@prisma/client';

export class ConnectionService {
  /**
   * Flow 1: Student enters a teacher code to link to them.
   */
  static async joinTeacher(userId: number, teacherCode: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      const error: any = new Error('Student profile not found. Only students can perform this action.');
      error.statusCode = 403;
      throw error;
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { teacherCode },
    });

    if (!teacher) {
      const error: any = new Error('Invalid teacher code. Teacher not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if already linked
    const existingLink = await prisma.studentTeacher.findUnique({
      where: {
        studentId_teacherId: {
          studentId: student.id,
          teacherId: teacher.id,
        },
      },
    });

    if (existingLink) {
      return { message: 'You are already linked to this teacher.' };
    }

    // Connect with denormalized data
    await prisma.studentTeacher.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        grade: student.grade,
        targetedSchool: student.targetedSchool,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
      },
    });

    return {
      message: 'Successfully connected to teacher.',
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        subjects: teacher.subjects,
      },
    };
  }

  /**
   * Flow 2: Parent enters a student code to link to their child.
   */
  static async linkChild(userId: number, studentCode: string) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId },
    });

    if (!parent) {
      const error: any = new Error('Parent profile not found. Only parents can link children.');
      error.statusCode = 403;
      throw error;
    }

    const student = await prisma.studentProfile.findUnique({
      where: { studentCode },
    });

    if (!student) {
      const error: any = new Error('Invalid student code. Child profile not found.');
      error.statusCode = 404;
      throw error;
    }

    if (student.parentId === parent.id) {
      return { message: 'This child is already linked to your profile.' };
    }

    if (student.parentId !== null) {
      const error: any = new Error('This student is already linked to another parent.');
      error.statusCode = 400;
      throw error;
    }

    // Connect child — updates the student's parentId and parentName
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: { 
        parentId: parent.id,
        parentName: parent.name,
      },
    });

    // Re-fetch the parent profile with all linked children
    const updatedParent = await prisma.parentProfile.findUnique({
      where: { id: parent.id },
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
    });

    return {
      message: 'Child successfully linked to your profile.',
      parent: {
        id: updatedParent!.id,
        name: updatedParent!.name,
        email: updatedParent!.email,
        contactInfo: updatedParent!.contactInfo,
        linkedChildren: updatedParent!.students,
      },
    };
  }

  /**
   * Flow 4: Parent requests a connection to a teacher.
   */
  static async requestTeacher(userId: number, studentId: number, teacherId: number) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId },
    });

    if (!parent) {
      const error: any = new Error('Parent profile not found.');
      error.statusCode = 403;
      throw error;
    }

    // Validate that student belongs to this parent
    const student = await prisma.studentProfile.findFirst({
      where: { id: studentId, parentId: parent.id },
    });

    if (!student) {
      const error: any = new Error('Unauthorized. The student must be linked to your profile.');
      error.statusCode = 403;
      throw error;
    }

    // Validate teacher exists
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      const error: any = new Error('Teacher not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if already linked
    const alreadyLinked = await prisma.studentTeacher.findUnique({
      where: {
        studentId_teacherId: {
          studentId,
          teacherId,
        },
      },
    });

    if (alreadyLinked) {
      const error: any = new Error('This student is already connected to this teacher.');
      error.statusCode = 400;
      throw error;
    }

    // Check if pending request exists
    const existingRequest = await prisma.teacherRequest.findFirst({
      where: {
        studentId,
        teacherId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      return { message: 'A pending request has already been sent to this teacher.' };
    }

    // Create Request with denormalized data
    const request = await prisma.teacherRequest.create({
      data: {
        studentId,
        studentName: student.name,
        grade: student.grade,
        parentId: parent.id,
        parentName: parent.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
      },
    });

    return {
      message: 'Request sent to teacher successfully.',
      request,
    };
  }

  /**
   * Flow 4: Teacher views pending requests.
   */
  static async getPendingRequests(userId: number) {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      const error: any = new Error('Teacher profile not found.');
      error.statusCode = 403;
      throw error;
    }

    const requests = await prisma.teacherRequest.findMany({
      where: {
        teacherId: teacher.id,
        status: RequestStatus.PENDING,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentCode: true,
            grade: true,
            targetedSchool: true,
            parentName: true,
          },
        },
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests.map((request) => ({
      ...request,
      studentName: request.student.name,
      grade: request.student.grade,
      parentName: request.parent.name,
      teacherName: request.teacher.name,
    }));
  }

  /**
   * Flow 4: Teacher accepts or rejects a request.
   */
  static async respondToRequest(userId: number, requestId: number, status: 'ACCEPTED' | 'REJECTED') {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacher) {
      const error: any = new Error('Teacher profile not found.');
      error.statusCode = 403;
      throw error;
    }

    const request = await prisma.teacherRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.teacherId !== teacher.id) {
      const error: any = new Error('Request not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    if (request.status !== RequestStatus.PENDING) {
      const error: any = new Error('This request has already been processed.');
      error.statusCode = 400;
      throw error;
    }

    // Process Response in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.teacherRequest.update({
        where: { id: requestId },
        data: { status: status as RequestStatus },
      });

      if (status === 'ACCEPTED') {
        // Get student and teacher data for denormalization
        const student = await tx.studentProfile.findUnique({
          where: { id: request.studentId },
          select: { 
            name: true,
            grade: true,
            targetedSchool: true,
            parentId: true 
          },
        });

        const teacher = await tx.teacherProfile.findUnique({
          where: { id: request.teacherId },
          select: { name: true, email: true },
        });

        // Create student-teacher connection with denormalized data
        await tx.studentTeacher.create({
          data: {
            studentId: request.studentId,
            studentName: student?.name,
            grade: student?.grade,
            targetedSchool: student?.targetedSchool,
            teacherId: request.teacherId,
            teacherName: teacher?.name,
            teacherEmail: teacher?.email,
          },
        });

        // Auto-create parent-teacher link if student has a parent
        if (student?.parentId) {
          await tx.parentTeacher.upsert({
            where: {
              parentId_teacherId: {
                parentId: student.parentId,
                teacherId: request.teacherId,
              },
            },
            update: {}, // No update needed, already exists
            create: {
              parentId: student.parentId,
              teacherId: request.teacherId,
            },
          });
        }
      }

      return updatedRequest;
    });

    return {
      message: `Request successfully ${status.toLowerCase()}.`,
      request: result,
    };
  }

  /**
   * Flow 4: Parents browse all teachers
   */
  static async getAllTeachers() {
    return prisma.teacherProfile.findMany({
      select: {
        id: true,
        teacherCode: true,
        name: true,
        email: true,
        subjects: true,
        contactInfo: true,
      },
    });
  }

  /**
   * Flow 4: Parent views their pending teacher requests
   */
  static async getParentPendingRequests(userId: number) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId },
    });

    if (!parent) {
      const error: any = new Error('Parent profile not found.');
      error.statusCode = 403;
      throw error;
    }

    const requests = await prisma.teacherRequest.findMany({
      where: {
        parentId: parent.id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentCode: true,
            grade: true,
            targetedSchool: true,
            parentName: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            subjects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests.map((request) => ({
      ...request,
      studentName: request.student.name,
      grade: request.student.grade,
      parentName: request.student.parentName || '',
      teacherName: request.teacher.name,
    }));
  }
}
