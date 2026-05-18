import express from 'express';
import bcrypt from 'bcryptjs';
import { query, getClient } from '../db/pool.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const formatAdminQuote = (quote, items = null) => ({
  ...quote,
  quoted_price: quote.quoted_price ? parseFloat(quote.quoted_price) : null,
  response_message: quote.response_message || '',
  admin_notes: quote.admin_notes || '',
  item_count: quote.item_count ? parseInt(quote.item_count, 10) : items ? items.length : 0,
  items,
});

const formatAdminOrder = (order, items = []) => ({
  ...order,
  total_amount: order.total_amount ? parseFloat(order.total_amount) : 0,
  items,
});

// All admin routes require authentication + admin role
router.use(protect, admin);

// ── DASHBOARD STATS ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [users, products, orders, quotes, revenue, messages, recentOrders, recentQuotes, ordersByStatus, salesByCategory] =
      await Promise.all([
        query(`SELECT COUNT(*) FROM users WHERE role = 'user'`),
        query(`SELECT COUNT(*) FROM products`),
        query(`SELECT COUNT(*) FROM orders`),
        query(`SELECT COUNT(*) FROM quotes`),
        query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'Cancelled'`),
        query(`SELECT COUNT(*) FROM contact_messages WHERE is_read = FALSE`),

        query(`SELECT o.*, u.name AS customer_name, u.email AS customer_email
               FROM orders o LEFT JOIN users u ON o.user_id = u.id
               ORDER BY o.created_at DESC LIMIT 5`),

        query(`SELECT * FROM quotes ORDER BY created_at DESC LIMIT 5`),

        query(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`),

        query(`SELECT p.category, COUNT(oi.id) AS units_sold
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               GROUP BY p.category ORDER BY units_sold DESC LIMIT 6`)
      ]);

    const monthlyRevenue = await query(`
      SELECT TO_CHAR(created_at, 'Mon YYYY') AS month,
             DATE_TRUNC('month', created_at) AS month_date,
             COALESCE(SUM(total_amount), 0) AS revenue,
             COUNT(*) AS order_count
      FROM orders
      WHERE status != 'Cancelled'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month, month_date
      ORDER BY month_date ASC
    `);

    res.json({
      totals: {
        users: parseInt(users.rows[0].count),
        products: parseInt(products.rows[0].count),
        orders: parseInt(orders.rows[0].count),
        quotes: parseInt(quotes.rows[0].count),
        revenue: parseFloat(revenue.rows[0].total),
        unreadMessages: parseInt(messages.rows[0].count),
      },
      recentOrders: recentOrders.rows,
      recentQuotes: recentQuotes.rows,
      ordersByStatus: ordersByStatus.rows,
      salesByCategory: salesByCategory.rows,
      monthlyRevenue: monthlyRevenue.rows,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── USERS (UNCHANGED) ──────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR company ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (role) {
      conditions.push(`role = $${idx++}`);
      params.push(role);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countRes.rows[0].count) || 0;

    const offset = (pageNum - 1) * limitNum;

    const dataRes = await query(
      `SELECT id, name, email, phone, company, county, role, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    res.json({
      users: dataRes.rows,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });

  } catch (err) {
    console.error('Admin users error:', err.message);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// ── PRODUCTS (ONLY FIXED SAFETY PARTS) ─────────────────────────
router.get('/products', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (category) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(countRes.rows[0].count) || 0;

    const offset = (pageNum - 1) * limitNum;

    const dataRes = await query(
      `SELECT * FROM products ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    res.json({
      products: dataRes.rows,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });

  } catch (err) {
    console.error('Admin products error:', err.message);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

// ── CREATE PRODUCT (ONLY FIXED CRASH RISKS) ────────────────────
router.post('/products', async (req, res) => {
  try {
    const {
      name, description, short_description, category,
      price, sale_price, price_on_request,
      images, brand, origin,
      in_stock, featured, is_new, best_seller,
      specifications
    } = req.body;

    const result = await query(
      `INSERT INTO products (
        name, description, short_description, category,
        price, sale_price, price_on_request,
        images, brand, origin,
        in_stock, featured, is_new, best_seller,
        specifications
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        name,
        description,
        short_description || '',
        category,
        price || null,
        sale_price || null,
        price_on_request || false,
        Array.isArray(images) ? images : [],
        brand || '',
        origin || '',
        in_stock ?? true,
        featured ?? false,
        is_new ?? false,
        best_seller ?? false,
        JSON.stringify(specifications || [])
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE PRODUCT (ONLY SAFETY FIX) ───────────────────────────
router.put('/products/:id', async (req, res) => {
  try {
    const {
      name, description, short_description, category,
      price, sale_price, price_on_request,
      images, brand, origin,
      in_stock, featured, is_new, best_seller,
      specifications
    } = req.body;

    const result = await query(
      `UPDATE products SET
        name=$1, description=$2, short_description=$3,
        category=$4, price=$5, sale_price=$6,
        price_on_request=$7, images=$8,
        brand=$9, origin=$10,
        in_stock=$11, featured=$12,
        is_new=$13, best_seller=$14,
        specifications=$15
       WHERE id=$16 RETURNING *`,
      [
        name,
        description,
        short_description || '',
        category,
        price || null,
        sale_price || null,
        price_on_request || false,
        Array.isArray(images) ? images : [],
        brand || '',
        origin || '',
        in_stock ?? true,
        featured ?? false,
        is_new ?? false,
        best_seller ?? false,
        JSON.stringify(specifications || []),
        req.params.id
      ]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: 'Product not found' });

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE PRODUCT (UNCHANGED) ──────────────────────────────────
router.delete('/products/:id', async (req, res) => {
  try {
    await query(`DELETE FROM products WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// USER MANAGEMENT — Admin can view, update role & delete any user
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/users/:id  — full user profile with recent orders & quotes
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const userRes = await query(
      `SELECT id, name, email, phone, company, county, role, created_at
       FROM users WHERE id=$1`,
      [userId]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRes.rows[0];

    // Fetch recent orders
    const ordersRes = await query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Fetch recent quotes
    const quotesRes = await query(
      `SELECT * FROM quotes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      ...user,
      orders:  ordersRes.rows,
      quotes:  quotesRes.rows,
    });

  } catch (err) {
    console.error('Admin get user error:', err.message);
    res.status(500).json({ message: 'Failed to load user' });
  }
});

// PUT /api/admin/users/:id  — update user profile / role
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, email, phone, company, county, role } = req.body;

    const result = await query(
      `UPDATE users SET
         name    = COALESCE($1, name),
         email   = COALESCE($2, email),
         phone   = COALESCE($3, phone),
         company = COALESCE($4, company),
         county  = COALESCE($5, county),
         role    = COALESCE($6, role)
       WHERE id = $7
       RETURNING id, name, email, phone, company, county, role, created_at`,
      [name, email, phone, company, county, role, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Admin update user error:', err.message);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id  — remove a user account
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Prevent deleting the only super-admin (optional guard)
    const result = await query(`DELETE FROM users WHERE id=$1 RETURNING id`, [userId]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted' });

  } catch (err) {
    console.error('Admin delete user error:', err.message);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// MESSAGES — admin CRUD for contact_messages
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/messages — list with pagination + read filter
router.get('/messages', async (req, res) => {
  try {
    const { search, is_read, page = 1, limit = 15 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR subject ILIKE $${idx} OR message ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (is_read !== undefined) {
      const readVal = is_read === 'true';
      conditions.push(`is_read = $${idx}`);
      params.push(readVal);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM contact_messages ${where}`, params);
    const total = parseInt(countRes.rows[0].count) || 0;
    const offset = (pageNum - 1) * limitNum;

    const dataRes = await query(
      `SELECT * FROM contact_messages ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    res.json({
      messages: dataRes.rows,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });
  } catch (err) {
    console.error('Admin messages error:', err.message);
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

// PUT /api/admin/messages/:id/read — mark a single message as read
router.put('/messages/:id/read', async (req, res) => {
  try {
    const msgId = parseInt(req.params.id, 10);
    const result = await query(
      `UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING *`,
      [msgId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Admin mark-read error:', err.message);
    res.status(500).json({ message: 'Failed to update message' });
  }
});

// DELETE /api/admin/messages/:id — remove a message
router.delete('/messages/:id', async (req, res) => {
  try {
    const msgId = parseInt(req.params.id, 10);
    const result = await query(`DELETE FROM contact_messages WHERE id = $1 RETURNING id`, [msgId]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Admin delete message error:', err.message);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// QUOTES — admin list, detail, update
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/quotes — list with pagination + filter
router.get('/quotes', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(quote_number ILIKE $${idx} OR name ILIKE $${idx} OR email ILIKE $${idx} OR company ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) FROM quotes ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count) || 0;
    const offset = (pageNum - 1) * limitNum;

    const dataRes = await query(
      `SELECT * FROM quotes ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    res.json({
      quotes: dataRes.rows.map(q => formatAdminQuote(q)),
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });
  } catch (err) {
    console.error('Admin quotes error:', err.message);
    res.status(500).json({ message: 'Failed to load quotes' });
  }
});

// GET /api/admin/quotes/:id — single quote with items
router.get('/quotes/:id', async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id, 10);

    const qRes = await query(
      `SELECT * FROM quotes WHERE id = $1`,
      [quoteId]
    );

    if (!qRes.rows.length) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const itemsRes = await query(
      `SELECT * FROM quote_items WHERE quote_id = $1`,
      [quoteId]
    );

    res.json(formatAdminQuote({ ...qRes.rows[0], items_count: itemsRes.rows.length }, itemsRes.rows));
  } catch (err) {
    console.error('Admin get quote error:', err.message);
    res.status(500).json({ message: 'Failed to load quote' });
  }
});

// PUT /api/admin/quotes/:id — update status / quoted_price / response_message / admin_notes
router.put('/quotes/:id', async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id, 10);
    const { status, quoted_price, response_message, admin_notes } = req.body;

    // Build dynamic update based on provided fields
    const updates = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (quoted_price !== undefined) {
      updates.push(`quoted_price = $${idx++}`);
      values.push(quoted_price);
    }
    if (response_message !== undefined) {
      updates.push(`response_message = $${idx++}`);
      values.push(response_message);
    }
    if (admin_notes !== undefined) {
      updates.push(`admin_notes = $${idx++}`);
      values.push(admin_notes);
    }

    // Set responded_at when status moves to Quoted/Accepted/Declined
    if (status === 'Quoted' || status === 'Accepted' || status === 'Declined') {
      updates.push(`responded_at = $${idx++}`);
      values.push(new Date().toISOString());
    }

    values.push(quoteId);

    const result = await query(
      `UPDATE quotes SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const itemsRes = await query(`SELECT * FROM quote_items WHERE quote_id = $1`, [quoteId]);
    res.json(formatAdminQuote(result.rows[0], itemsRes.rows));
  } catch (err) {
    console.error('Admin update quote error:', err.message);
    res.status(500).json({ message: 'Failed to update quote' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ORDERS — admin list, detail, status update
// ═══════════════════════════════════════════════════════════════════

// GET /api/admin/orders — list with pagination + filter
router.get('/orders', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`order_number ILIKE $${idx}`);
      params.push(`%${search}%`);
      idx++;
    }

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) FROM orders ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count) || 0;
    const offset = (pageNum - 1) * limitNum;

    const dataRes = await query(
      `SELECT * FROM orders ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    res.json({
      orders: dataRes.rows.map(o => formatAdminOrder(o)),
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    });
  } catch (err) {
    console.error('Admin orders error:', err.message);
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

// GET /api/admin/orders/:id — single order with items
router.get('/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);

    const oRes = await query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (!oRes.rows.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsRes = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    res.json(formatAdminOrder(oRes.rows[0], itemsRes.rows));
  } catch (err) {
    console.error('Admin get order error:', err.message);
    res.status(500).json({ message: 'Failed to load order' });
  }
});

// PUT /api/admin/orders/:id/status — update order status and/or payment status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, payment_status } = req.body;

    if (!status && !payment_status) {
      return res.status(400).json({ message: 'Provide at least status or payment_status' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (payment_status) {
      updates.push(`payment_status = $${idx++}`);
      values.push(payment_status);
    }

    values.push(orderId);

    const result = await query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Admin update order error:', err.message);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

export default router;