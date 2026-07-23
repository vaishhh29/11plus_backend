import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

import { EmailService } from '../utils/email';

router.post('/login', AuthController.login);
router.get('/me', authMiddleware as any, AuthController.getProfile);
router.put('/profile', authMiddleware as any, AuthController.updateProfile);

router.get('/test-smtp', async (req, res) => {
  try {
    await EmailService.sendWelcomeEmail(
      'vaishuravi29@gmail.com',
      'Production Test User',
      'student',
      'prod_test_username',
      'prod_test123'
    );
    res.json({ success: true, message: "Test welcome email sent successfully from production backend!" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || "Unknown SMTP error",
      code: error?.code,
      stack: error?.stack,
      env: {
        SMTP_HOST: process.env.SMTP_HOST ? `configured (${process.env.SMTP_HOST.trim()})` : "missing",
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER ? `configured (${process.env.SMTP_USER.trim()})` : "missing",
        SMTP_PASS: process.env.SMTP_PASS ? `configured (length: ${process.env.SMTP_PASS.trim().length})` : "missing",
      }
    });
  }
});

export default router;
