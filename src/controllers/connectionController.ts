import { Response, NextFunction } from 'express';
import { ConnectionService } from '../services/connectionService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class ConnectionController {
  static async joinTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherCode } = req.body;
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (!teacherCode) {
        res.status(400).json({ message: 'Teacher code is required.' });
        return;
      }

      const result = await ConnectionService.joinTeacher(req.user.userId, teacherCode);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async linkChild(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentCode } = req.body;
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (!studentCode) {
        res.status(400).json({ message: 'Student code is required.' });
        return;
      }

      const result = await ConnectionService.linkChild(req.user.userId, studentCode);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async requestTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, teacherId } = req.body;
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (!studentId || !teacherId) {
        res.status(400).json({ message: 'Student ID and Teacher ID are required.' });
        return;
      }

      const result = await ConnectionService.requestTeacher(req.user.userId, studentId, teacherId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getPendingRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await ConnectionService.getPendingRequests(req.user.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async respondToRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (isNaN(requestId) || !status) {
        res.status(400).json({ message: 'Valid Request ID in URL and response status are required.' });
        return;
      }
      if (status !== 'ACCEPTED' && status !== 'REJECTED') {
        res.status(400).json({ message: "Status must be either 'ACCEPTED' or 'REJECTED'." });
        return;
      }

      const result = await ConnectionService.respondToRequest(req.user.userId, requestId, status);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllTeachers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ConnectionService.getAllTeachers();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
