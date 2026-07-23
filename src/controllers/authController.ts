import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  /**
   * Log in a user and return their JWT token + user details + role-specific profile details.
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      const result = await AuthService.login({ username, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve the profile of the currently logged-in user.
   */
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getUserProfile(req.user.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update the profile of the currently logged-in user.
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const updatedUser = await AuthService.updateUserProfile(req.user.userId, req.body);
      res.status(200).json({
        message: 'Profile successfully updated.',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
