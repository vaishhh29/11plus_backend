import { Router } from 'express';
import { TeacherController } from '../controllers/teacherController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { teacherMiddleware } from '../middlewares/teacherMiddleware';

const router = Router();

// Secure all endpoints under this router
router.use(authMiddleware as any);
router.use(teacherMiddleware as any);

router.get('/students', TeacherController.getStudents);
router.get('/syllabus', TeacherController.getSyllabus);
router.get('/questions', TeacherController.getQuestions);
router.post('/tests', TeacherController.createTest);
router.get('/tests', TeacherController.getTests);
router.delete('/students/:studentId', TeacherController.unlinkStudent);

export default router;
