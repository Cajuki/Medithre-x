import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: 'Name, email and message are required' });

    await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5)`,
      [name, email, phone || '', subject || '', message]
    );
    return res.status(201).json({ message: 'Message received. Our team will contact you within 24 hours.' });
  } catch (err) {
    console.error('Contact error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
