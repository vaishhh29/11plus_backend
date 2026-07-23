"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = process.env.SMTP_HOST ? nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null;
class EmailService {
    /**
     * Sends welcome email containing credentials to newly created user
     */
    static async sendWelcomeEmail(to, name, role, username, temporaryPassword) {
        console.log(`[EmailService] Preparing welcome email for ${name} (${to}): Role=${role}, Username=${username}, temporaryPassword=${temporaryPassword}`);
        if (!transporter) {
            console.log(`[EmailService] SMTP_HOST is not configured. Logging details to console fallback:\nTo: ${to}\nName: ${name}\nRole: ${role}\nUsername: ${username}\nTempPassword: ${temporaryPassword}`);
            return;
        }
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Tuition Admin" <no-reply@tuition.com>',
            to,
            subject: 'Welcome! Your Account Has Been Created',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Welcome to ElevenPlus, ${name}!</h2>
          <p>An administrator has created your <strong>${role.toLowerCase()}</strong> account.</p>
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Login page:</strong> <a href="http://localhost:3000/login">Go to Login</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Username:</strong> <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${username}</code></p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
          </div>
          
          <p style="color: #EF4444; font-size: 0.9em;"><strong>Important:</strong> Please log in and change your password immediately after your first sign-in.</p>
          <br/>
          <p>Best regards,<br/>The ElevenPlus Team</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
    }
}
exports.EmailService = EmailService;
