import { Router } from 'express';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import connectionRoutes from './connectionRoutes';
import teacherRoutes from './teacherRoutes';
import studentRoutes from './studentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/connections', connectionRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);

export default router;
