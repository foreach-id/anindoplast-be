import nodemailer from 'nodemailer';
import { Logger } from '@utils/index';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const Mailer = {
  /**
   * Kirim Email Verifikasi saat Register
   */
  sendVerificationEmail: async (to: string, token: string) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const htmlContent = `
      <h3>Selamat Datang di FotoGenie!</h3>
      <p>Terima kasih telah mendaftar. Silakan klik link di bawah untuk memverifikasi akun Anda:</p>
      <a href="${verificationLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verifikasi Email</a>
      <p>Atau copy link ini: ${verificationLink}</p>
    `;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: 'Verifikasi Email FotoGenie',
        html: htmlContent,
      });
      Logger.info(`Verification email sent to ${to}`);
    } catch (error) {
      Logger.error('Error sending verification email', error);
    }
  },

  /**
   * Kirim Email Reset Password
   */
  sendResetPasswordEmail: async (to: string, token: string) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const htmlContent = `
      <h3>Permintaan Reset Password</h3>
      <p>Anda meminta untuk mereset password akun FotoGenie.</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #008CBA; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Link ini berlaku selama 1 jam.</p>
      <p>Jika bukan Anda, abaikan email ini.</p>
    `;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: 'Reset Password FotoGenie',
        html: htmlContent,
      });
      Logger.info(`Reset password email sent to ${to}`);
    } catch (error) {
      Logger.error('Error sending reset password email', error);
    }
  },
};