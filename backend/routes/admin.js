import express from 'express';
import bcrypt from 'bcryptjs';
import { query, getClient } from '../db/pool.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const formatAdminQuote = (quote, items = null) => ({
  ...quote,
  quoted_price: quote.quoted_price ? parseFloat(quote.quoted_price) : null,
  item_count: quote.item_count ? parseInt(quote.item_count, 10) : items ? items.length : 0,
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

export default router;