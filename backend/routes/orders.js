import express from 'express';
import { query, getClient } from '../db/pool.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const fmtOrder = (o, items = []) => ({
  id:            String(o.id),
  orderNumber:   o.order_number,
  userId:        o.user_id,
  status:        o.status,
  totalAmount:   o.total_amount ? parseFloat(o.total_amount) : 0,
  paymentMethod: o.payment_method,
  paymentStatus: o.payment_status,
  shippingAddress: { street: o.street, city: o.city, county: o.county, country: o.country },
  notes:         o.notes,
  createdAt:     o.created_at,
  items:         items.map(i => ({
    id:       String(i.id),
    name:     i.name,
    quantity: i.quantity,
    price:    i.price ? parseFloat(i.price) : 0,
  }))
});

// ── POST /api/orders ───────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  const client = await getClient();
  try {
    const { items, shippingAddress = {}, paymentMethod = 'Invoice', notes } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ message: 'No items in order' });

    const orderNumber  = 'MTX-' + Date.now().toString().slice(-8);
    const totalAmount  = items.reduce((s, i) => s + ((parseFloat(i.price) || 0) * (i.quantity || 1)), 0);

    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders (order_number, user_id, total_amount, payment_method, street, city, county, country, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [orderNumber, req.user.id, totalAmount, paymentMethod,
       shippingAddress.street || '', shippingAddress.city || '',
       shippingAddress.county || '', shippingAddress.country || 'Kenya', notes || '']
    );
    const order = orderRes.rows[0];

    const savedItems = [];
    for (const item of items) {
      const ir = await client.query(
        `INSERT INTO order_items (order_id, product_id, name, quantity, price)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [order.id, item.product || null, item.name || '', item.quantity || 1, item.price || 0]
      );
      savedItems.push(ir.rows[0]);
    }

    await client.query('COMMIT');
    return res.status(201).json(fmtOrder(order, savedItems));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order create error:', err.message);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// ── GET /api/orders/my ────────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const ordersRes = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    const orders = [];
    for (const o of ordersRes.rows) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
      orders.push(fmtOrder(o, itemsRes.rows));
    }
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const oRes = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!oRes.rows.length) return res.status(404).json({ message: 'Order not found' });
    const iRes = await query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    return res.json(fmtOrder(oRes.rows[0], iRes.rows));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
