"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const authService_1 = require("../services/authService");
const adminService_1 = require("../services/adminService");
class AdminController {
    /**
     * Route for Admin to create Teacher, Student, Parent, or another Admin.
     */
    static async createUser(req, res, next) {
        try {
            const { username, email, password, name, role, grade, subjects, contactInfo, targetedSchool, parentEmail, teacherCodes, studentCodes } = req.body;
            if (!username || !email || !password || !name || !role) {
                res.status(400).json({ message: 'Username, email, password, name, and role are required fields.' });
                return;
            }
            const result = await authService_1.AuthService.createUserByAdmin({
                username,
                email,
                password,
                name,
                role,
                grade,
                subjects,
                contactInfo,
                targetedSchool,
                parentEmail,
                teacherCodes,
                studentCodes,
            });
            res.status(201).json({
                message: `Successfully created ${role.toLowerCase()} account.`,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/student-parents
     * Returns flattened parent↔child relationship rows.
     */
    static async getStudentParents(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getStudentParents();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/student-teachers
     * Returns student↔teacher link rows with connection timestamps.
     */
    static async getStudentTeachers(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getStudentTeachers();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/students
     * Returns all students with parent name (not ID) and linked teachers.
     */
    static async getAllStudents(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getAllStudents();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/parents
     * Returns all parent profiles with child mappings.
     */
    static async getParents(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getParents();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/teachers
     * Returns all teacher profiles.
     */
    static async getTeachers(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getTeachers();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/parent-teachers
     * Returns parent-teacher connections auto-created from student-teacher links.
     */
    static async getParentTeachers(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getParentTeachers();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/admin/questions/bulk
     * Bulk uploads parsed questions into a subject.
     */
    static async bulkCreateQuestions(req, res, next) {
        try {
            const { subject, questions } = req.body;
            if (!subject || !Array.isArray(questions)) {
                res.status(400).json({ message: 'Subject and questions array are required fields.' });
                return;
            }
            const data = await adminService_1.AdminService.bulkCreateQuestions(subject, questions);
            let message = `Successfully uploaded ${data.count} questions under ${subject}.`;
            if (data.skippedCount > 0) {
                message += ` ${data.skippedCount} duplicate question(s) were skipped.`;
            }
            res.status(201).json({
                message,
                data
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/syllabus
     * Returns subjects, their syllabus topics, and the count of questions per topic.
     */
    static async getSyllabusOverview(req, res, next) {
        try {
            const data = await adminService_1.AdminService.getSyllabusOverview();
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/admin/questions/topic
     * Fetches all questions for a specific topic and subject.
     */
    static async getQuestionsByTopic(req, res, next) {
        try {
            const { topic, subTopic, subject } = req.query;
            if (!topic) {
                res.status(400).json({ message: 'Topic query parameter is required.' });
                return;
            }
            const data = await adminService_1.AdminService.getQuestionsByTopic(String(topic), subject ? String(subject) : undefined, subTopic ? String(subTopic) : undefined);
            res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
