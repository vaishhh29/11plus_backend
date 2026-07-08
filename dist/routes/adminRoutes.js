"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
// Protect all admin routes with auth and admin middlewares
router.post('/users', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.createUser);
router.post('/questions/bulk', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.bulkCreateQuestions);
router.get('/questions/topic', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getQuestionsByTopic);
router.get('/syllabus', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getSyllabusOverview);
// Relationship table queries
router.get('/student-parents', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getStudentParents);
router.get('/student-teachers', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getStudentTeachers);
router.get('/parent-teachers', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getParentTeachers);
router.get('/students', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getAllStudents);
router.get('/parents', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getParents);
router.get('/teachers', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.AdminController.getTeachers);
exports.default = router;
