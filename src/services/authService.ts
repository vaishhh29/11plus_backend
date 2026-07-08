import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { generateTeacherCode, generateStudentCode } from '../utils/codeGenerator';

export class AuthService {
  /**
   * Log in user and return JWT + user profile details including linking relations.
   */
  static async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacherProfile: {
          include: {
            students: {
              include: {
                student: true,
              },
            },
          },
        },
        studentProfile: {
          include: {
            parent: true,
            teachers: {
              include: {
                teacher: true,
              },
            },
          },
        },
        parentProfile: {
          include: {
            students: true,
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    let profile: any = null;

    if (user.role === Role.TEACHER && user.teacherProfile) {
      profile = {
        teacherCode: user.teacherProfile.teacherCode,
        subjects: user.teacherProfile.subjects,
        contactInfo: user.teacherProfile.contactInfo,
        name: user.teacherProfile.name,
        email: user.teacherProfile.email,
        students: user.teacherProfile.students.map((st: any) => ({
          id: st.student.id,
          userId: st.student.userId,
          studentCode: st.student.studentCode,
          name: st.student.name,
          email: st.student.email,
          grade: st.student.grade,
          targetedSchool: st.student.targetedSchool,
        })),
      };
    } else if (user.role === Role.STUDENT && user.studentProfile) {
      profile = {
        studentCode: user.studentProfile.studentCode,
        name: user.studentProfile.name,
        email: user.studentProfile.email,
        grade: user.studentProfile.grade,
        targetedSchool: user.studentProfile.targetedSchool,
        parent: user.studentProfile.parent ? {
          id: user.studentProfile.parent.id,
          userId: user.studentProfile.parent.userId,
          name: user.studentProfile.parent.name,
          email: user.studentProfile.parent.email,
        } : null,
        teachers: user.studentProfile.teachers.map((st: any) => ({
          id: st.teacher.id,
          userId: st.teacher.userId,
          teacherCode: st.teacher.teacherCode,
          name: st.teacher.name,
          email: st.teacher.email,
          subjects: st.teacher.subjects,
          contactInfo: st.teacher.contactInfo,
        })),
      };
    } else if (user.role === Role.PARENT && user.parentProfile) {
      profile = {
        name: user.parentProfile.name,
        email: user.parentProfile.email,
        contactInfo: user.parentProfile.contactInfo,
        children: user.parentProfile.students.map((child: any) => ({
          id: child.id,
          userId: child.userId,
          studentCode: child.studentCode,
          name: child.name,
          email: child.email,
          grade: child.grade,
          targetedSchool: child.targetedSchool,
        })),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile,
      token,
    };
  }

  /**
   * Admin creating user accounts for Teacher, Student, Parent, or another Admin.
   * Can optionally connect them upon account creation.
   */
  static async createUserByAdmin(data: any) {
    const { email, password, name, role, grade, subjects, contactInfo, targetedSchool } = data;

    if (!Object.values(Role).includes(role)) {
      const error: any = new Error(`Invalid role. Must be one of: ${Object.values(Role).join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and associated profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: role as Role,
        },
      });

      let profile: any = null;

      if (role === Role.TEACHER) {
        const teacherCode = await generateTeacherCode();

        // Resolve studentIds if studentCodes provided
        const studentIds: number[] = [];
        if (data.studentCodes && data.studentCodes.length > 0) {
          const students = await tx.studentProfile.findMany({
            where: { studentCode: { in: data.studentCodes } },
            select: { id: true },
          });
          studentIds.push(...students.map(s => s.id));
        }

        profile = await tx.teacherProfile.create({
          data: {
            userId: user.id,
            teacherCode,
            name: user.name,
            email: user.email,
            subjects: subjects || [],
            contactInfo: contactInfo || null,
            students: {
              create: studentIds.map(sid => ({ studentId: sid })),
            },
          },
        });
      } else if (role === Role.STUDENT) {
        const studentCode = await generateStudentCode();

        // Resolve parentId if parentEmail provided
        let resolvedParentId: number | null = null;
        let resolvedParentName: string | null = null;
        if (data.parentEmail) {
          const parent = await tx.parentProfile.findFirst({
            where: { email: data.parentEmail },
            select: { id: true, name: true },
          });
          if (parent) {
            resolvedParentId = parent.id;
            resolvedParentName = parent.name;
          }
        }

        // Resolve teacherIds if teacherCodes provided
        const teacherIds: number[] = [];
        const teacherData: any[] = [];
        if (data.teacherCodes && data.teacherCodes.length > 0) {
          const teachers = await tx.teacherProfile.findMany({
            where: { teacherCode: { in: data.teacherCodes } },
            select: { id: true, name: true, email: true },
          });
          teacherIds.push(...teachers.map(t => t.id));
          teacherData.push(...teachers);
        }

        const studentName = user.name;
        const studentGrade = grade || null;
        const studentTargetedSchool = targetedSchool || null;

        profile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentCode,
            name: user.name,
            email: user.email,
            grade: grade || null,
            targetedSchool: targetedSchool || null,
            parentId: resolvedParentId,
            parentName: resolvedParentName,
            teachers: {
              create: teacherData.map(t => ({ 
                teacherId: t.id,
                studentName,
                grade: studentGrade,
                targetedSchool: studentTargetedSchool,
                teacherName: t.name,
                teacherEmail: t.email,
              })),
            },
          },
        });
      } else if (role === Role.PARENT) {
        // Resolve studentIds if studentCodes provided
        const studentIds: number[] = [];
        if (data.studentCodes && data.studentCodes.length > 0) {
          const students = await tx.studentProfile.findMany({
            where: { studentCode: { in: data.studentCodes } },
            select: { id: true },
          });
          studentIds.push(...students.map(s => s.id));
        }

        profile = await tx.parentProfile.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            contactInfo: contactInfo || null,
            students: {
              connect: studentIds.map(sid => ({ id: sid })),
            },
          },
        });
      }

      return { user, profile };
    });

    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      createdAt: result.user.createdAt,
      profile: result.profile,
    };
  }

  /**
   * Get user profile by userId including linked profiles.
   */
  static async getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: {
          include: {
            students: {
              include: {
                student: true,
              },
            },
          },
        },
        studentProfile: {
          include: {
            parent: true,
            teachers: {
              include: {
                teacher: true,
              },
            },
          },
        },
        parentProfile: {
          include: {
            students: true,
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    let profileDetails: any = null;

    if (user.role === Role.TEACHER && user.teacherProfile) {
      profileDetails = {
        teacherCode: user.teacherProfile.teacherCode,
        subjects: user.teacherProfile.subjects,
        contactInfo: user.teacherProfile.contactInfo,
        name: user.teacherProfile.name,
        email: user.teacherProfile.email,
        students: user.teacherProfile.students.map((st: any) => ({
          id: st.student.id,
          userId: st.student.userId,
          studentCode: st.student.studentCode,
          name: st.student.name,
          email: st.student.email,
          grade: st.student.grade,
          targetedSchool: st.student.targetedSchool,
        })),
      };
    } else if (user.role === Role.STUDENT && user.studentProfile) {
      profileDetails = {
        studentCode: user.studentProfile.studentCode,
        name: user.studentProfile.name,
        email: user.studentProfile.email,
        grade: user.studentProfile.grade,
        targetedSchool: user.studentProfile.targetedSchool,
        parent: user.studentProfile.parent ? {
          id: user.studentProfile.parent.id,
          userId: user.studentProfile.parent.userId,
          name: user.studentProfile.parent.name,
          email: user.studentProfile.parent.email,
        } : null,
        teachers: user.studentProfile.teachers.map((st: any) => ({
          id: st.teacher.id,
          userId: st.teacher.userId,
          teacherCode: st.teacher.teacherCode,
          name: st.teacher.name,
          email: st.teacher.email,
          subjects: st.teacher.subjects,
          contactInfo: st.teacher.contactInfo,
        })),
      };
    } else if (user.role === Role.PARENT && user.parentProfile) {
      profileDetails = {
        name: user.parentProfile.name,
        email: user.parentProfile.email,
        contactInfo: user.parentProfile.contactInfo,
        children: user.parentProfile.students.map((child: any) => ({
          id: child.id,
          userId: child.userId,
          studentCode: child.studentCode,
          name: child.name,
          email: child.email,
          grade: child.grade,
          targetedSchool: child.targetedSchool,
        })),
      };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      profile: profileDetails,
    };
  }

  /**
   * Update current user profile.
   * Modifies the central User details, hashes password if provided, 
   * and synchronizes data with the specific profile table.
   */
  static async updateUserProfile(userId: number, data: any) {
    const { name, email, password, grade, targetedSchool, subjects, contactInfo } = data;

    // Get current user details
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate email uniqueness if it's changing
    if (email && email !== currentUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });
      if (emailTaken) {
        const error: any = new Error('Email is already in use by another account');
        error.statusCode = 400;
        throw error;
      }
    }

    // Build user update object
    const userUpdateData: any = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email;
    if (password && password.trim() !== '') {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Run updates in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update primary User table
      await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
      });

      // 2. Synchronize role profile metadata
      if (currentUser.role === Role.TEACHER) {
        const teacherProfileData: any = {};
        if (name) teacherProfileData.name = name;
        if (email) teacherProfileData.email = email;
        if (subjects) teacherProfileData.subjects = subjects;
        if (contactInfo !== undefined) teacherProfileData.contactInfo = contactInfo;

        await tx.teacherProfile.update({
          where: { userId },
          data: teacherProfileData,
        });
      } else if (currentUser.role === Role.STUDENT) {
        const studentProfileData: any = {};
        if (name) studentProfileData.name = name;
        if (email) studentProfileData.email = email;
        if (grade !== undefined) studentProfileData.grade = grade;
        if (targetedSchool !== undefined) studentProfileData.targetedSchool = targetedSchool;

        await tx.studentProfile.update({
          where: { userId },
          data: studentProfileData,
        });
      } else if (currentUser.role === Role.PARENT) {
        const parentProfileData: any = {};
        if (name) parentProfileData.name = name;
        if (email) parentProfileData.email = email;
        if (contactInfo !== undefined) parentProfileData.contactInfo = contactInfo;

        await tx.parentProfile.update({
          where: { userId },
          data: parentProfileData,
        });
      }
    });

    // Re-query the full profile using the helper method to get the correct output format with relations
    return this.getUserProfile(userId);
  }
}
