import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { protect } from '../middleware/auth.js';

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
    if (!result.rows.length)
      // Don't reveal whether email exists for security
      return res.status(200).json({ message: 'If an account exists with that email, you will receive reset instructions.' });

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign({ email: emailLower }, JWT_SECRET, { expiresIn: '1h' });
    
    // In a real application, you would send an email here
    // For now, we'll just return success - in production, integrate with email service
    console.log(`Password reset token for ${emailLower}: ${resetToken}`);
    
    return res.status(200).json({ message: 'If an account exists with that email, you will receive reset instructions.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
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

export default router;
