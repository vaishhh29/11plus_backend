"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherController_1 = require("../controllers/teacherController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const teacherMiddleware_1 = require("../middlewares/teacherMiddleware");
const router = (0, express_1.Router)();
// Secure all endpoints under this router
router.use(authMiddleware_1.authMiddleware);
router.use(teacherMiddleware_1.teacherMiddleware);
router.get('/students', teacherController_1.TeacherController.getStudents);
router.get('/syllabus', teacherController_1.TeacherController.getSyllabus);
router.get('/questions', teacherController_1.TeacherController.getQuestions);
router.post('/tests', teacherController_1.TeacherController.createTest);
router.get('/tests', teacherController_1.TeacherController.getTests);
router.delete('/students/:studentId', teacherController_1.TeacherController.unlinkStudent);
exports.default = router;
