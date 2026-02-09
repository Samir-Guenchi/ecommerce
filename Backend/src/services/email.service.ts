import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

// Email transporter configuration
let transporter: nodemailer.Transporter | null = null;

/**
 * In development without SMTP credentials, use Ethereal (free test inbox).
 * In production, use the configured SMTP server.
 */
const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  const hasSmtpCreds = process.env.SMTP_USER && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD);

  if (!hasSmtpCreds && isDev) {
    // Create an Ethereal test account on-the-fly
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal test email account created:');
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(`   Web:  https://ethereal.email/login`);

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
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
      const transport = await getTransporter();
      const fromAddr = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@algeriepost.dz';

      const mailOptions = {
        from: fromAddr,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await transport.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);

      // In dev, show the Ethereal preview URL so you can read the email
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📬 Preview email at:', previewUrl);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}

export const emailService = new EmailService();








