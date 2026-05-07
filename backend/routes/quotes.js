import express from 'express';
import { query, getClient } from '../db/pool.js';
import { optionalProtect, protect } from '../middleware/auth.js';

const router = express.Router();

const fmtQuote = (q, items = []) => ({
  id:          String(q.id),
  quoteNumber: q.quote_number,
  name:        q.name,
  email:       q.email,
  phone:       q.phone,
  company:     q.company,
  county:      q.county,
  message:     q.message,
  status:      q.status,
  quotedPrice: q.quoted_price ? parseFloat(q.quoted_price) : null,
  responseMessage: q.response_message,
  respondedAt: q.responded_at,
  createdAt:   q.created_at,
  items:       items.map(i => ({
    productId:   i.product_id ? String(i.product_id) : null,
    productName: i.product_name,
    quantity:    i.quantity,
    notes:       i.notes,
  }))
});

// ── POST /api/quotes ───────────────────────────────────────────────────────────
router.post('/', optionalProtect, async (req, res) => {
  const client = await getClient();
  try {
    const { name, email, phone, company, county, items = [], message } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ message: 'Name, email and phone are required' });
    if (!Array.isArray(items) || !items.length)
      return res.status(400).json({ message: 'At least one quote item is required' });

    const quoteNumber = 'QT-' + Date.now().toString().slice(-8);

    await client.query('BEGIN');
    const qRes = await client.query(
      `INSERT INTO quotes (quote_number, user_id, name, email, phone, company, county, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [quoteNumber, req.user?.id || null, name, email.toLowerCase().trim(), phone, company || '', county || '', message || '']
    );
    const quote = qRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO quote_items (quote_id, product_id, product_name, quantity, notes)
         VALUES ($1,$2,$3,$4,$5)`,
        [quote.id, item.productId || null, item.productName || '', item.quantity || 1, item.notes || '']
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Quote request submitted successfully', quoteNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Quote create error:', err.message);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// ── GET /api/quotes/my ────────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const qRes = await query(
      'SELECT * FROM quotes WHERE user_id = $1 OR email = (SELECT email FROM users WHERE id = $1) ORDER BY created_at DESC',
      [req.user.id]
    );
    const quotes = [];
    for (const q of qRes.rows) {
      const iRes = await query('SELECT * FROM quote_items WHERE quote_id = $1', [q.id]);
      quotes.push(fmtQuote(q, iRes.rows));
    }
    return res.json(quotes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
