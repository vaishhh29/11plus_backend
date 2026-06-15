import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AdminService } from '../services/adminService';

export class AdminController {
  /**
   * Route for Admin to create Teacher, Student, Parent, or another Admin.
   */
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role, grade, subjects, contactInfo, targetedSchool, parentEmail, teacherCodes, studentCodes } = req.body;

      if (!email || !password || !name || !role) {
        res.status(400).json({ message: 'Email, password, name, and role are required fields.' });
        return;
      }

      const result = await AuthService.createUserByAdmin({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/student-parents
   * Returns flattened parent↔child relationship rows.
   */
  static async getStudentParents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getStudentParents();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/student-teachers
   * Returns student↔teacher link rows with connection timestamps.
   */
  static async getStudentTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getStudentTeachers();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/students
   * Returns all students with parent name (not ID) and linked teachers.
   */
  static async getAllStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getAllStudents();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/parents
   * Returns all parent profiles with child mappings.
   */
  static async getParents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getParents();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/teachers
   * Returns all teacher profiles.
   */
  static async getTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getTeachers();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}
