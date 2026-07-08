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

  /**
   * GET /api/admin/parent-teachers
   * Returns parent-teacher connections auto-created from student-teacher links.
   */
  static async getParentTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getParentTeachers();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/questions/bulk
   * Bulk uploads parsed questions into a subject.
   */
  static async bulkCreateQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { subject, questions } = req.body;
      if (!subject || !Array.isArray(questions)) {
        res.status(400).json({ message: 'Subject and questions array are required fields.' });
        return;
      }
      const data = await AdminService.bulkCreateQuestions(subject, questions);
      res.status(201).json({
        message: `Successfully uploaded ${data.count} questions under ${subject}.`,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/syllabus
   * Returns subjects, their syllabus topics, and the count of questions per topic.
   */
  static async getSyllabusOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminService.getSyllabusOverview();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/questions/topic
   * Fetches all questions for a specific topic and subject.
   */
  static async getQuestionsByTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, subject } = req.query;
      if (!topic) {
        res.status(400).json({ message: 'Topic query parameter is required.' });
        return;
      }
      const data = await AdminService.getQuestionsByTopic(String(topic), subject ? String(subject) : undefined);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

