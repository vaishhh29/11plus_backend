"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const connectionRoutes_1 = __importDefault(require("./connectionRoutes"));
const teacherRoutes_1 = __importDefault(require("./teacherRoutes"));
const studentRoutes_1 = __importDefault(require("./studentRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/connections', connectionRoutes_1.default);
router.use('/teacher', teacherRoutes_1.default);
router.use('/student', studentRoutes_1.default);
exports.default = router;
