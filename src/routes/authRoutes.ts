import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', authMiddleware as any, AuthController.getProfile);
router.put('/profile', authMiddleware as any, AuthController.updateProfile);

export default router;
