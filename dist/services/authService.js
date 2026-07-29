"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const codeGenerator_1 = require("../utils/codeGenerator");
const email_1 = require("../utils/email");
class AuthService {
    /**
     * Log in user and return JWT + user profile details including linking relations.
     */
    static async login(data) {
        const { username, password } = data;
        const user = await database_1.default.user.findUnique({
            where: { username },
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
            const error = new Error('Invalid username or password');
            error.statusCode = 401;
            throw error;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid username or password');
            error.statusCode = 401;
            throw error;
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            username: user.username,
            role: user.role,
        });
        let profile = null;
        if (user.role === client_1.Role.TEACHER && user.teacherProfile) {
            profile = {
                teacherCode: user.teacherProfile.teacherCode,
                subjects: user.teacherProfile.subjects,
                contactInfo: user.teacherProfile.contactInfo,
                name: user.teacherProfile.name,
                email: user.teacherProfile.email,
                students: user.teacherProfile.students.map((st) => ({
                    id: st.student.id,
                    userId: st.student.userId,
                    studentCode: st.student.studentCode,
                    name: st.student.name,
                    email: st.student.email,
                    grade: st.student.grade,
                    targetedSchool: st.student.targetedSchool,
                })),
            };
        }
        else if (user.role === client_1.Role.STUDENT && user.studentProfile) {
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
                teachers: user.studentProfile.teachers.map((st) => ({
                    id: st.teacher.id,
                    userId: st.teacher.userId,
                    teacherCode: st.teacher.teacherCode,
                    name: st.teacher.name,
                    email: st.teacher.email,
                    subjects: st.teacher.subjects,
                    contactInfo: st.teacher.contactInfo,
                })),
            };
        }
        else if (user.role === client_1.Role.PARENT && user.parentProfile) {
            profile = {
                name: user.parentProfile.name,
                email: user.parentProfile.email,
                contactInfo: user.parentProfile.contactInfo,
                children: user.parentProfile.students.map((child) => ({
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
                username: user.username,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
            },
            profile,
            token,
        };
    }
    static async validateEmailForRole(email, role, currentUserId) {
        const normalizedEmail = email.toLowerCase().trim();
        // 1. Check Teacher Profiles
        const teacherWithEmail = await database_1.default.teacherProfile.findFirst({
            where: {
                email: { equals: normalizedEmail, mode: 'insensitive' },
                ...(currentUserId ? { userId: { not: currentUserId } } : {})
            }
        });
        if (teacherWithEmail) {
            const error = new Error('Email is already registered by a teacher');
            error.statusCode = 400;
            throw error;
        }
        if (role === client_1.Role.TEACHER) {
            // Teachers cannot share email with anyone
            const parentWithEmail = await database_1.default.parentProfile.findFirst({
                where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
            });
            if (parentWithEmail) {
                const error = new Error('Email is already registered by a parent');
                error.statusCode = 400;
                throw error;
            }
            const studentWithEmail = await database_1.default.studentProfile.findFirst({
                where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
            });
            if (studentWithEmail) {
                const error = new Error('Email is already registered by a student');
                error.statusCode = 400;
                throw error;
            }
        }
        else if (role === client_1.Role.PARENT) {
            // Parents cannot share email with another parent
            const parentWithEmail = await database_1.default.parentProfile.findFirst({
                where: {
                    email: { equals: normalizedEmail, mode: 'insensitive' },
                    ...(currentUserId ? { userId: { not: currentUserId } } : {})
                }
            });
            if (parentWithEmail) {
                const error = new Error('Email is already registered by another parent');
                error.statusCode = 400;
                throw error;
            }
        }
        else if (role === client_1.Role.STUDENT) {
            // Students can share email with their parent, but not with other students of different parents
            const parentWithEmail = await database_1.default.parentProfile.findFirst({
                where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
            });
            if (!parentWithEmail) {
                // If there is no parent owning this email, it must be unique among student profiles
                const studentWithEmail = await database_1.default.studentProfile.findFirst({
                    where: {
                        email: { equals: normalizedEmail, mode: 'insensitive' },
                        ...(currentUserId ? { userId: { not: currentUserId } } : {})
                    }
                });
                if (studentWithEmail) {
                    const error = new Error('Email is already registered by another student');
                    error.statusCode = 400;
                    throw error;
                }
            }
        }
    }
    /**
     * Admin creating user accounts for Teacher, Student, Parent, or another Admin.
     * Can optionally connect them upon account creation.
     */
    static async createUserByAdmin(data) {
        const { username, email, password, name, role, grade, subjects, contactInfo, targetedSchool } = data;
        if (!Object.values(client_1.Role).includes(role)) {
            const error = new Error(`Invalid role. Must be one of: ${Object.values(client_1.Role).join(', ')}`);
            error.statusCode = 400;
            throw error;
        }
        const existingUser = await database_1.default.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            const error = new Error('Username is already registered');
            error.statusCode = 400;
            throw error;
        }
        // Role-specific email uniqueness validation
        if (email) {
            await this.validateEmailForRole(email, role);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user and associated profile in a transaction
        const result = await database_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    name,
                    password: hashedPassword,
                    role: role,
                },
            });
            let profile = null;
            if (role === client_1.Role.TEACHER) {
                const teacherCode = await (0, codeGenerator_1.generateTeacherCode)();
                // Resolve studentIds if studentCodes provided
                const studentIds = [];
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
                        email: email,
                        subjects: subjects || [],
                        contactInfo: contactInfo || null,
                        students: {
                            create: studentIds.map(sid => ({ studentId: sid })),
                        },
                    },
                });
            }
            else if (role === client_1.Role.STUDENT) {
                const studentCode = await (0, codeGenerator_1.generateStudentCode)();
                // Resolve parentId if parentEmail provided
                let resolvedParentId = null;
                let resolvedParentName = null;
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
                const teacherIds = [];
                const teacherData = [];
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
                        email: email,
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
            }
            else if (role === client_1.Role.PARENT) {
                // Resolve studentIds if studentCodes provided
                const studentIds = [];
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
                        email: email,
                        contactInfo: contactInfo || null,
                        students: {
                            connect: studentIds.map(sid => ({ id: sid })),
                        },
                    },
                });
            }
            return { user, profile };
        });
        console.log(`[AuthService] Successfully created user "${result.user.username}" (${result.user.role}) in database.`);
        // Send welcome email asynchronously to not block return
        email_1.EmailService.sendWelcomeEmail(email, result.user.name, result.user.role, result.user.username, password)
            .then(() => {
            console.log(`[EmailService] Welcome email validation & delivery succeeded for parent/student: ${email}`);
        })
            .catch(err => {
            console.error(`[EmailService] Failed to send welcome email to ${email}:`, err);
        });
        return {
            id: result.user.id,
            username: result.user.username,
            name: result.user.name,
            role: result.user.role,
            createdAt: result.user.createdAt,
            profile: result.profile,
        };
    }
    /**
     * Get user profile by userId including linked profiles.
     */
    static async getUserProfile(userId) {
        const user = await database_1.default.user.findUnique({
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
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        let profileDetails = null;
        if (user.role === client_1.Role.TEACHER && user.teacherProfile) {
            profileDetails = {
                teacherCode: user.teacherProfile.teacherCode,
                subjects: user.teacherProfile.subjects,
                contactInfo: user.teacherProfile.contactInfo,
                name: user.teacherProfile.name,
                email: user.teacherProfile.email,
                students: user.teacherProfile.students.map((st) => ({
                    id: st.student.id,
                    userId: st.student.userId,
                    studentCode: st.student.studentCode,
                    name: st.student.name,
                    email: st.student.email,
                    grade: st.student.grade,
                    targetedSchool: st.student.targetedSchool,
                })),
            };
        }
        else if (user.role === client_1.Role.STUDENT && user.studentProfile) {
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
                teachers: user.studentProfile.teachers.map((st) => ({
                    id: st.teacher.id,
                    userId: st.teacher.userId,
                    teacherCode: st.teacher.teacherCode,
                    name: st.teacher.name,
                    email: st.teacher.email,
                    subjects: st.teacher.subjects,
                    contactInfo: st.teacher.contactInfo,
                })),
            };
        }
        else if (user.role === client_1.Role.PARENT && user.parentProfile) {
            profileDetails = {
                name: user.parentProfile.name,
                email: user.parentProfile.email,
                contactInfo: user.parentProfile.contactInfo,
                children: user.parentProfile.students.map((child) => ({
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
            username: user.username,
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
    static async updateUserProfile(userId, data) {
        const { name, username, email, password, grade, targetedSchool, subjects, contactInfo } = data;
        // Get current user details
        const currentUser = await database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!currentUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        // Validate username uniqueness if it's changing
        if (username && username !== currentUser.username) {
            const usernameTaken = await database_1.default.user.findUnique({
                where: { username },
            });
            if (usernameTaken) {
                const error = new Error('Username is already in use by another account');
                error.statusCode = 400;
                throw error;
            }
        }
        // Validate email according to the user's role on profile update
        if (email) {
            await this.validateEmailForRole(email, currentUser.role, userId);
        }
        // Build user update object
        const userUpdateData = {};
        if (name)
            userUpdateData.name = name;
        if (username)
            userUpdateData.username = username;
        if (email)
            userUpdateData.email = email;
        if (password && password.trim() !== '') {
            userUpdateData.password = await bcryptjs_1.default.hash(password, 10);
        }
        // Run updates in transaction
        await database_1.default.$transaction(async (tx) => {
            // 1. Update primary User table
            await tx.user.update({
                where: { id: userId },
                data: userUpdateData,
            });
            // 2. Synchronize role profile metadata
            if (currentUser.role === client_1.Role.TEACHER) {
                const teacherProfileData = {};
                if (name)
                    teacherProfileData.name = name;
                if (email)
                    teacherProfileData.email = email;
                if (subjects)
                    teacherProfileData.subjects = subjects;
                if (contactInfo !== undefined)
                    teacherProfileData.contactInfo = contactInfo;
                await tx.teacherProfile.update({
                    where: { userId },
                    data: teacherProfileData,
                });
            }
            else if (currentUser.role === client_1.Role.STUDENT) {
                const studentProfileData = {};
                if (name)
                    studentProfileData.name = name;
                if (email)
                    studentProfileData.email = email;
                if (grade !== undefined)
                    studentProfileData.grade = grade;
                if (targetedSchool !== undefined)
                    studentProfileData.targetedSchool = targetedSchool;
                await tx.studentProfile.update({
                    where: { userId },
                    data: studentProfileData,
                });
            }
            else if (currentUser.role === client_1.Role.PARENT) {
                const parentProfileData = {};
                if (name)
                    parentProfileData.name = name;
                if (email)
                    parentProfileData.email = email;
                if (contactInfo !== undefined)
                    parentProfileData.contactInfo = contactInfo;
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
exports.AuthService = AuthService;
