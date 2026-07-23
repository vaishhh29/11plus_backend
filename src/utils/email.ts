import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : '';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';

const transporter = smtpHost ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  connectionTimeout: 10000, // Prevent hanging requests if SMTP is blocked
  greetingTimeout: 10000,
  socketTimeout: 10000,
}) : null;

export class EmailService {
  /**
   * Sends welcome email containing credentials to newly created user
   */
  static async sendWelcomeEmail(to: string, name: string, role: string, username: string, temporaryPassword: string): Promise<void> {
    console.log(`[EmailService] Preparing welcome email for ${name} (${to}): Role=${role}, Username=${username}, temporaryPassword=${temporaryPassword}`);
    
    if (!transporter) {
      console.log(`[EmailService] SMTP_HOST is not configured. Logging details to console fallback:\nTo: ${to}\nName: ${name}\nRole: ${role}\nUsername: ${username}\nTempPassword: ${temporaryPassword}`);
      return;
    }

    const fromEmail = process.env.SMTP_USER || 'no-reply@tuition.com';
    const fromField = process.env.EMAIL_FROM && process.env.EMAIL_FROM.includes('@')
      ? process.env.EMAIL_FROM
      : `"${(process.env.EMAIL_FROM || '11Plus Academy').replace(/"/g, '')}" <${fromEmail}>`;

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: fromField,
      to,
      subject: 'Welcome! Your Account Has Been Created',
      html: `
        <div style="background-color: #F3F4F6; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; min-height: 100%;">
          <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border: 1px solid #E2E8F0;">
            
            <!-- Header Banner -->
            <div style="background-color: #2563EB; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Welcome to 11Plus Academy</h1>
            </div>

            <!-- Body Content -->
            <div style="padding: 30px 25px;">
              <p style="font-size: 15px; line-height: 1.5; color: #475569; margin-top: 0;">Hello <strong>${name}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.5; color: #475569;">Your account details are ready. Below are your credentials for accessing the platform.</p>
              
              <!-- Credentials Panel -->
              <div style="margin: 24px 0; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px;">
                <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 15px; color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Login Credentials</h3>
                
                 <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #64748B; width: 100px;">Username:</td>
                    <td style="padding: 6px 0; font-size: 14px; font-family: 'Times New Roman', Times, serif; color: #1E293B; font-weight: 600;">${username}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #64748B;">Password:</td>
                    <td style="padding: 6px 0; font-size: 14px; font-family: 'Times New Roman', Times, serif; color: #1E293B; font-weight: 600;">${temporaryPassword}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Button -->
              <div style="text-align: center; margin: 30px 0 20px;">
                <a href="${loginUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 2px 5px rgba(37, 99, 235, 0.25);">Login to Portal</a>
              </div>

              <hr style="border: 0; border-top: 1px solid #F1F5F9; margin: 25px 0;" />
              
              <p style="font-size: 13px; color: #94A3B8; margin-bottom: 0;">Best regards,<br/>The 11Plus Team</p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
