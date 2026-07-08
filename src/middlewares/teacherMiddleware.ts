import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const teacherMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized. Login required.' });
    return;
  }

  if (req.user.role !== 'TEACHER') {
    res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
    return;
  }

  next();
};
