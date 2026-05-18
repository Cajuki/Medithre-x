import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { protect } from '../middleware/auth.js';
import { sendPasswordResetEmail, hashToken, verifyToken } from '../utils/email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medithrex_secret_2024';

const makeToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const safeUser = ({ password, ...u }) => u;

// ── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, company, county, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const emailLower = email.toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length)
      return res.status(409).json({ message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, phone, company, county, password, role)
       VALUES ($1,$2,$3,$4,$5,$6,'user') RETURNING *`,
      [name.trim(), emailLower, phone || '', company || '', county || '', hashed]
    );
    const user = result.rows[0];
    return res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (!result.rows.length)
      return res.status(401).json({ message: 'No account found with this email' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Incorrect password' });

    return res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    const emailLower = email.toLowerCase().trim();
    const result = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (!result.rows.length) {
      // Don't reveal whether email exists
      return res.status(200).json({ message: 'If an account exists with that email, you will receive reset instructions.' });
    }

    const user = result.rows[0];

    // Generate random token (64 bytes)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token hash in DB
    await query(
      `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [tokenHash, user.id, expiresAt]
    );

    // Send email with reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(emailLower, resetUrl);

    return res.status(200).json({ message: 'If an account exists with that email, you will receive reset instructions.' });
  } catch (err) {
    console.error('❌ Forgot password error');
    console.error('   name    :', err.name);
    console.error('   code    :', err.code);
    console.error('   message :', err.message);
    console.error('   stack   :', err.stack);
    return res.status(500).json({
      message: err.message || 'Failed to send reset email.',
    });
  }
});

// ── VERIFY RESET TOKEN ─────────────────────────────────────────────────────────
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ valid: false, message: 'Token is required' });

    const tokenHash = hashToken(token);
    const result = await query(
      `SELECT id, used, expires_at FROM password_reset_tokens
       WHERE token_hash = $1 AND used = false`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ valid: false, message: 'Invalid or already used reset token' });
    }

    const tokenRecord = result.rows[0];
    if (new Date() > new Date(tokenRecord.expires_at)) {
      return res.status(200).json({ valid: false, message: 'Reset token has expired' });
    }

    return res.status(200).json({ valid: true, message: 'Token is valid' });
  } catch (err) {
    console.error('❌ Verify token error');
    console.error('   name:', err.name, 'code:', err.code, 'message:', err.message);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ── RESET PASSWORD ─────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const tokenHash = hashToken(token);
    const result = await query(
      `SELECT id, user_id, used, expires_at FROM password_reset_tokens
       WHERE token_hash = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const tokenRecord = result.rows[0];
    if (tokenRecord.used) {
      return res.status(400).json({ message: 'Reset token has already been used' });
    }
    if (new Date() > new Date(tokenRecord.expires_at)) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, tokenRecord.user_id]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenRecord.id]);

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('❌ Reset password error');
    console.error('   name:', err.name, 'code:', err.code, 'message:', err.message);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ── GET PROFILE ───────────────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    return res.json(safeUser(result.rows[0]));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, company, county } = req.body;
    const result = await query(
      `UPDATE users SET name=$1, phone=$2, company=$3, county=$4
       WHERE id=$5 RETURNING *`,
      [name, phone, company, county, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    return res.json(safeUser(result.rows[0]));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both current and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── LOGOUT ─────────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
