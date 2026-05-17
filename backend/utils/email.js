import { createHash } from 'crypto';

/**
 * Hash token (stored in DB)
 */
export const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Verify a plain token against its stored hash.
 */
export const verifyToken = (plainToken, storedHash) => {
  const hashed = createHash('sha256').update(plainToken).digest('hex');
  return hashed === storedHash;
};

// Mock transporter for when email credentials are not set or email sending is disabled
const mockTransporter = {
  verify: async () => {
    console.log('📧 [MOCK] SMTP transporter verified (email sending disabled)');
    return true;
  },
  sendMail: async (mailOptions) => {
    console.log('📧 [MOCK] Password reset email sent (simulated):');
    console.log('   to       :', mailOptions.to);
    console.log('   subject  :', mailOptions.subject);
    console.log('   resetUrl :', mailOptions.text.match(/https?:\/\/[^\s]+/)[0]);
    return { messageId: `mock-${Date.now()}` };
  }
};

// Use real transporter only if credentials are explicitly set, otherwise use mock
const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS) 
  ? (() => {
      const nodemailer = require('nodemailer');
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: String(process.env.EMAIL_PORT) === '465', // true for 465 (SSL), false for 587 (STARTTLS)
        auth: {
          user: process.env.EMAIL_USER ?? process.env.EMAIL_USERNAME ?? '',
          pass: process.env.EMAIL_PASS ?? process.env.EMAIL_PASSWORD ?? '',
        },
      });
    })()
  : mockTransporter;

/**
 * Lightweight preflight check — never throws, always logs its result.
 */
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    if (transporter === mockTransporter) {
      console.log('📧 [MOCK] SMTP transporter verified (email sending disabled)');
    } else {
      console.log('✅ SMTP transporter verified');
    }
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
  console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — password reset emails will be simulated (no actual sending).');
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

    if (transporter === mockTransporter) {
      console.log('📧 [MOCK] Password reset email sent (simulated):');
      console.log('   to       :', email);
      console.log('   messageId:', info.messageId);
    } else {
      console.log('✅ Password reset email sent');
      console.log('   to       :', email);
      console.log('   messageId:', info.messageId);
    }

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

    // Throw the full SMTP summary so auth.js catch block can log
    // and forward it to the client in every environment.
    throw new TypeError(summary);
  }
};