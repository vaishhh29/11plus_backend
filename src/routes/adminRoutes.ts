import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Protect all admin routes with auth and admin middlewares
router.post('/users', authMiddleware as any, adminMiddleware, AdminController.createUser);

// Relationship table queries
router.get('/student-parents', authMiddleware as any, adminMiddleware, AdminController.getStudentParents);
router.get('/student-teachers', authMiddleware as any, adminMiddleware, AdminController.getStudentTeachers);
router.get('/students', authMiddleware as any, adminMiddleware, AdminController.getAllStudents);
router.get('/parents', authMiddleware as any, adminMiddleware, AdminController.getParents);
router.get('/teachers', authMiddleware as any, adminMiddleware, AdminController.getTeachers);

export default router;
