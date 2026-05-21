import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const defaultFrom = 'MedithreX <noreply@medithrex.com>';
const publicEmailDomains = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
];

const getEmailAddress = (from) => {
  const match = String(from || '').match(/<([^>]+)>/);
  return (match ? match[1] : from || '').trim().toLowerCase();
};

const isPublicEmailSender = (from) => {
  const address = getEmailAddress(from);
  const domain = address.split('@')[1];
  return publicEmailDomains.includes(domain);
};

const getFromAddress = () => (process.env.EMAIL_FROM || defaultFrom).trim();

const hasSmtpConfig = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

let smtpTransporter;

const getSmtpTransporter = () => {
  if (!hasSmtpConfig()) return null;

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return smtpTransporter;
};

export const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

export const verifyToken = (plainToken, storedHash) => {
  const hashed = createHash('sha256').update(plainToken).digest('hex');
  return hashed === storedHash;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) throw new Error('sendEmail: to is required');
  if (!subject) throw new Error('sendEmail: subject is required');
  if (!html && !text) throw new Error('sendEmail: html or text is required');

  const from = getFromAddress();

  if (resend && !isPublicEmailSender(from)) {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Resend failed to send email');
    }

    console.log('Password/email sent via Resend:', {
      to,
      subject,
      id: response.data?.id,
    });

    return response.data;
  }

  const smtp = getSmtpTransporter();
  if (smtp) {
    const info = await smtp.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    console.log('Password/email sent via SMTP:', {
      to,
      subject,
      messageId: info.messageId,
    });

    return info;
  }

  if (resend && isPublicEmailSender(from)) {
    throw new Error(
      'EMAIL_FROM must use a verified domain when RESEND_API_KEY is configured. Use a verified sender such as noreply@your-domain.com, or configure EMAIL_HOST, EMAIL_USER and EMAIL_PASS for SMTP.'
    );
  }

  throw new Error(
    'Email is not configured. Set RESEND_API_KEY with a verified EMAIL_FROM, or configure EMAIL_HOST, EMAIL_USER and EMAIL_PASS for SMTP.'
  );
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!email) throw new Error('sendPasswordResetEmail: email is required');
  if (!resetUrl) throw new Error('sendPasswordResetEmail: resetUrl is required');

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    text: `Reset your password using this link:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:520px;margin:0 auto">
        <h2 style="color:#111;margin:0 0 16px">Password Reset Request</h2>
        <p>You asked to reset your MedithreX password. Click the button below to set a new one:</p>
        <p style="margin:24px 0">
          <a
            href="${resetUrl}"
            style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;border-radius:6px;font-size:16px"
          >Reset Password</a>
        </p>
        <p style="font-size:13px;color:#666">
          This link expires in <strong>1 hour</strong> and can only be used once.
        </p>
        <p style="font-size:13px;color:#666">
          If you did not request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
        <p style="font-size:11px;color:#999">
          MedithreX &copy; ${new Date().getFullYear()}
        </p>
      </div>
    `,
  });
};
