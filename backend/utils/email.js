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
 * Create reusable transporter (created once at module load, reused for every email)
 *
 * Uses EMAIL_USER / EMAIL_PASS (NOT EMAIL_USERNAME / EMAIL_PASSWORD)
 * to match the variable names in .env and .env.example.
 *
 * On Cloud Run the same env vars are set via Variables & Secrets in the
 * service configuration.  If they are missing the transporter is still
 * created — errors are surfaced at send time instead of killing the process
 * at import time.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: String(process.env.EMAIL_PORT) === '465', // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    /**
     * Accept both EMAIL_USERNAME / EMAIL_PASSWORD (legacy)
     * and EMAIL_USER / EMAIL_PASS (canonical, matches .env).
     * Backend wins so a correctly-set old env var always has precedence.
     */
    user: process.env.EMAIL_USER ?? process.env.EMAIL_USERNAME ?? '',
    pass: process.env.EMAIL_PASS ?? process.env.EMAIL_PASSWORD ?? '',
  },
});

/**
 * Lightweight preflight check — never throws, always logs its result.
 */
const verifyTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS is not set — transporter verification skipped');
    return;
  }
  try {
    await transporter.verify();
    console.log('✅ SMTP transporter verified');
  } catch (err) {
    console.error('❌ SMTP transporter verification failed:', err.message);
  }
};
verifyTransporter();

/**
 * Smoke-test the transporter at module load.
 * If credentials or host are bad this is the single noisy line in logs
 * that tells you "email is broken" before any user request arrives.
 */
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const hostLabel = process.env.EMAIL_HOST || 'smtp.gmail.com:587';
  console.log(`📧 SMTP ready → ${hostLabel} (user: ${process.env.EMAIL_USER})`);
} else {
  console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — password reset emails will fail silently on send.');
}

/**
 * Send password reset email.
 *
 * @param {string} email      Recipient e-mail address
 * @param {string} resetUrl   Full URL the user clicks to reset their password
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!email)    throw new Error('sendPasswordResetEmail: email is required');
  if (!resetUrl) throw new Error('sendPasswordResetEmail: resetUrl is required');

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Medithre-x" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
    to: email,
    subject: 'Reset Your Password',
    text: `Reset your password using this link:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:500px;margin:0 auto">
        <h2 style="color:#111">Password Reset Request</h2>
        <p>You asked to reset your password. Click the button below to set a new one:</p>
        <p>
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 24px;
              background:#2563eb;
              color:#fff;
              text-decoration:none;
              font-weight:700;
              border-radius:6px;
              font-size:16px;"
          >Reset Password</a>
        </p>
        <p style="font-size:13px;color:#666">
          This link expires in <strong>1 hour</strong> and can only be used once.
        </p>
        <p style="font-size:13px;color:#666">
          If you did not request this, you can safely ignore this email — your account
          is not at risk.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
        <p style="font-size:11px;color:#999">
          Medithre-x &copy; ${new Date().getFullYear()}
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Password reset email sent');
    console.log('   to       :', email);
    console.log('   messageId:', info.messageId);

  } catch (err) {
    // Nodemailer wraps the SMTP server's response inside err.response
    const code    = err.code    ?? '(no code)';
    const command = err.command ?? '(no command)';
    const resp    = err.response ?? '(no response body)';
    const summary = `[${code}] ${command}: ${String(resp).substring(0, 140)}`;

    console.error('❌ Email send failed —', summary);
    console.error('   SMTP code   :', code);
    console.error('   SMTP command:', command);
    console.error('   SMTP reply  :', resp);
    console.error('   recipient   :', email);

    // Pass the full SMTP summary through so auth.js catch block can log
    // and forward it to the client in development mode.
    throw new TypeError(summary);
  }
};