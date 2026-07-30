import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { studentMiddleware } from '../middlewares/studentMiddleware';

const router = Router();

// Secure all endpoints under this router
router.use(authMiddleware as any);
router.use(studentMiddleware as any);

router.get('/questions/practice', StudentController.getPracticeQuestions);
router.get('/tests/pending', StudentController.getPendingTests);
router.get('/tests/completed', StudentController.getCompletedTests);
router.post('/tests/:id/submit', StudentController.submitTest);

export default router;
