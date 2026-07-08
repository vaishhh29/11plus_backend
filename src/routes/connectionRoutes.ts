import { Router } from 'express';
import { ConnectionController } from '../controllers/connectionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Apply authentication guard to all connection endpoints
router.use(authMiddleware as any);

router.post('/student/join-teacher', ConnectionController.joinTeacher);
router.post('/parent/link-child', ConnectionController.linkChild);
router.post('/parent/request-teacher', ConnectionController.requestTeacher);
router.get('/parent/pending-requests', ConnectionController.getParentPendingRequests);
router.get('/teacher/requests', ConnectionController.getPendingRequests);
router.post('/teacher/requests/:id/respond', ConnectionController.respondToRequest);
router.get('/teachers', ConnectionController.getAllTeachers);

export default router;
