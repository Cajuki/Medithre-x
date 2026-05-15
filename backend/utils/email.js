import nodemailer from 'nodemailer';
import { createHash } from 'crypto';

/**
 * Hash token (stored in DB)
 */
export const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Verify token
 */
export const verifyToken = (plainToken, storedHash) => {
  const hashed = createHash('sha256').update(plainToken).digest('hex');
  return hashed === storedHash;
};

/**
 * Create reusable transporter (IMPORTANT: outside function for performance)
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    // optional debug (remove in production if you want)
    await transporter.verify();

    const mailOptions = {
      from: `"Medithre-x" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      text: `Reset your password using this link: ${resetUrl}. This link expires in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          <p>
            <a href="${resetUrl}" style="
              display:inline-block;
              padding:10px 15px;
              background:#000;
              color:#fff;
              text-decoration:none;
              border-radius:5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ Password reset email sent to:', email);

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};