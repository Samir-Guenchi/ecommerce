import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter = createTransporter();

  async sendVerificationCode(email: string, code: string, userName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f5f5f5; padding: 30px; border-radius: 8px;">
            <h2 style="color: #000; margin-bottom: 20px;">Email Verification</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for signing up for Algerie Post. Please use the following verification code to verify your email address:</p>
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; border-radius: 6px; margin: 30px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 4px;">${code}</h1>
            </div>
            <p>Enter this code in the app to complete your registration.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This code will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Email Verification
      
      Hello ${userName},
      
      Thank you for signing up for Algerie Post. Please use the following verification code to verify your email address:
      
      ${code}
      
      Enter this code in the app to complete your registration.
      
      This code will expire in 15 minutes.
      If you didn't request this code, please ignore this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Algerie Post - Email Verification Code',
      html,
      text,
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"Algerie Post" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}

export const emailService = new EmailService();








