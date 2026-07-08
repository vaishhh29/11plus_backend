"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const studentMiddleware_1 = require("../middlewares/studentMiddleware");
const router = (0, express_1.Router)();
// Secure all endpoints under this router
router.use(authMiddleware_1.authMiddleware);
router.use(studentMiddleware_1.studentMiddleware);
router.get('/questions/practice', studentController_1.StudentController.getPracticeQuestions);
router.get('/tests/pending', studentController_1.StudentController.getPendingTests);
router.get('/tests/completed', studentController_1.StudentController.getCompletedTests);
router.post('/tests/:id/submit', studentController_1.StudentController.submitTest);
exports.default = router;
