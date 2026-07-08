"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connectionController_1 = require("../controllers/connectionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication guard to all connection endpoints
router.use(authMiddleware_1.authMiddleware);
router.post('/student/join-teacher', connectionController_1.ConnectionController.joinTeacher);
router.post('/parent/link-child', connectionController_1.ConnectionController.linkChild);
router.post('/parent/request-teacher', connectionController_1.ConnectionController.requestTeacher);
router.get('/parent/pending-requests', connectionController_1.ConnectionController.getParentPendingRequests);
router.get('/teacher/requests', connectionController_1.ConnectionController.getPendingRequests);
router.post('/teacher/requests/:id/respond', connectionController_1.ConnectionController.respondToRequest);
router.get('/teachers', connectionController_1.ConnectionController.getAllTeachers);
exports.default = router;
