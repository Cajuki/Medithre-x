import express from 'express';
import { query, getClient } from '../db/pool.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const fmtQuote = (q, items = []) => ({
  id: String(q.id),
  quoteNumber: q.quote_number,
  name: q.name,
  email: q.email,
  phone: q.phone,
  company: q.company,
  county: q.county,
  message: q.message,
  status: q.status,
  quotedPrice: q.quoted_price ? parseFloat(q.quoted_price) : null,
  responseMessage: q.response_message || '',
  respondedAt: q.responded_at || null,
  createdAt: q.created_at,
  items: items.map(i => ({
    productName: i.product_name,
    quantity: i.quantity,
    notes: i.notes,
  }))
});

// ─────────────────────────────────────────────
// CREATE QUOTE
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const client = await getClient();

  try {
    const { name, email, phone, company, county, items = [], message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email and phone are required' });
    }

    const quoteNumber = 'QT-' + Date.now().toString().slice(-8);

    await client.query('BEGIN');

    const qRes = await client.query(
      `
      INSERT INTO quotes (quote_number, name, email, phone, company, county, message)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        quoteNumber,
        name,
        email.toLowerCase().trim(),
        phone,
        company || '',
        county || '',
        message || ''
      ]
    );

    const quote = qRes.rows[0];

    for (const item of items) {
      await client.query(
        `
        INSERT INTO quote_items (quote_id, product_id, product_name, quantity, notes)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          quote.id,
          item.productId || null,
          item.productName || '',
          item.quantity || 1,
          item.notes || ''
        ]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Quote request submitted successfully',
      quoteNumber
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Quote create error:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// GET USER QUOTES
// ─────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const userRes = await query(
      'SELECT email FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userRes.rows.length) return res.json([]);

    const qRes = await query(
      'SELECT * FROM quotes WHERE email = $1 ORDER BY created_at DESC',
      [userRes.rows[0].email]
    );

    const quotes = [];

    for (const q of qRes.rows) {
      const iRes = await query(
        'SELECT * FROM quote_items WHERE quote_id = $1',
        [q.id]
      );

      quotes.push(fmtQuote(q, iRes.rows));
    }

    res.json(quotes);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// ADMIN UPDATE QUOTE (FIXED - THIS WAS MISSING)
// ─────────────────────────────────────────────
router.put('/admin/quotes/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      quoted_price,
      admin_notes,
      response_message
    } = req.body;

    const quotedPrice =
      quoted_price === '' || quoted_price === undefined
        ? null
        : Number(quoted_price);

    const result = await query(
      `
      UPDATE quotes
      SET
        status = $1,
        quoted_price = $2,
        admin_notes = $3,
        response_message = $4,
        responded_at = NOW(),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [
        status,
        quotedPrice,
        admin_notes || '',
        response_message || '',
        id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    res.json({
      message: 'Quote updated successfully',
      quote: result.rows[0]
    });

  } catch (err) {
    console.error('QUOTE UPDATE ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;