import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || 'Dayflow HRMS <noreply@dayflow.app>';

export class EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Verify your Dayflow HRMS Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
              <h2 style="color: #0284c7;">Welcome to Dayflow HRMS</h2>
              <p>Please click the button below to verify your email address and activate your account:</p>
              <div style="margin: 25px 0;">
                <a href="${verifyUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
              </div>
              <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request this email, please ignore it.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('[EmailService] Resend send error:', err);
      }
    } else {
      console.log(`[EmailService DEV] Verification email for ${email}: ${verifyUrl}`);
    }

    return verifyUrl;
  }
}

export const emailService = new EmailService();
