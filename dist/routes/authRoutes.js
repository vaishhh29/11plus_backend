"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const email_1 = require("../utils/email");
router.post('/login', authController_1.AuthController.login);
router.get('/me', authMiddleware_1.authMiddleware, authController_1.AuthController.getProfile);
router.put('/profile', authMiddleware_1.authMiddleware, authController_1.AuthController.updateProfile);
router.get('/test-smtp', async (req, res) => {
    try {
        await email_1.EmailService.sendWelcomeEmail('vaishuravi29@gmail.com', 'Production Test User', 'student', 'prod_test_username', 'prod_test123');
        res.json({ success: true, message: "Test welcome email sent successfully from production backend!" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error?.message || "Unknown SMTP error",
            code: error?.code,
            stack: error?.stack,
            env: {
                SMTP_HOST: process.env.SMTP_HOST ? `configured (${process.env.SMTP_HOST.trim()})` : "missing",
                SMTP_PORT: process.env.SMTP_PORT,
                SMTP_USER: process.env.SMTP_USER ? `configured (${process.env.SMTP_USER.trim()})` : "missing",
                SMTP_PASS: process.env.SMTP_PASS ? `configured (length: ${process.env.SMTP_PASS.trim().length})` : "missing",
            }
        });
    }
});
exports.default = router;
