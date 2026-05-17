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

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [users, products, orders, quotes, revenue, messages, recentOrders, recentQuotes, ordersByStatus, salesByCategory] = await Promise.all([
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
             GROUP BY p.category ORDER BY units_sold DESC LIMIT 6`),
    ]);

    // Monthly revenue (last 6 months)
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
        users:       parseInt(users.rows[0].count),
        products:    parseInt(products.rows[0].count),
        orders:      parseInt(orders.rows[0].count),
        quotes:      parseInt(quotes.rows[0].count),
        revenue:     parseFloat(revenue.rows[0].total),
        unreadMessages: parseInt(messages.rows[0].count),
      },
      recentOrders:    recentOrders.rows,
      recentQuotes:    recentQuotes.rows,
      ordersByStatus:  ordersByStatus.rows,
      salesByCategory: salesByCategory.rows,
      monthlyRevenue:  monthlyRevenue.rows,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── USERS ─────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
   try {
     const { search, role, page = 1, limit = 20 } = req.query;
     
     // Validate pagination parameters
     const pageNum = parseInt(page);
     const limitNum = parseInt(limit);
     
     if (isNaN(pageNum) || pageNum < 1) {
       return res.status(400).json({ message: 'Invalid page parameter' });
     }
     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
       return res.status(400).json({ message: 'Invalid limit parameter (must be between 1 and 100)' });
     }

     const conditions = [];
     const params = [];
     let idx = 1;

     if (search) {
       conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR company ILIKE $${idx})`);
       params.push(`%${search}%`); idx++;
     }
     if (role) { conditions.push(`role = $${idx++}`); params.push(role); }

     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
     
     // Get total count
     let total = 0;
     try {
       const countRes = await query(`SELECT COUNT(*) FROM users ${where}`, params);
       total = parseInt(countRes.rows[0].count) || 0;
     } catch (countErr) {
       console.error('Error counting users:', countErr.message);
       throw new Error('Failed to count users');
     }

     // Get paginated data
     const offset = (pageNum - 1) * limitNum;
     let dataRes;
     try {
       dataRes = await query(
         `SELECT id, name, email, phone, company, county, role, created_at
          FROM users ${where}
          ORDER BY created_at DESC
          LIMIT $${idx} OFFSET $${idx + 1}`,
         [...params, limitNum, offset]
       );
     } catch (queryErr) {
       console.error('Error querying users:', queryErr.message);
       throw new Error('Failed to query users');
     }

     res.json({ 
       users: dataRes.rows || [], 
       total, 
       pages: Math.ceil(total / limitNum), 
       page: pageNum 
     });
   } catch (err) {
     console.error('Admin users error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to load users' });
     } else {
       res.status(500).json({ message: 'Failed to load users: ' + err.message });
     }
   }
 });

router.get('/users/:id', async (req, res) => {
   try {
     const uRes = await query(`SELECT id,name,email,phone,company,county,role,created_at FROM users WHERE id=$1`, [req.params.id]);
     if (!uRes.rows.length) return res.status(404).json({ message: 'User not found' });

     const oRes = await query(`SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`, [req.params.id]);
     const qRes = await query(`SELECT * FROM quotes WHERE email=(SELECT email FROM users WHERE id=$1) ORDER BY created_at DESC`, [req.params.id]);

     res.json({ ...uRes.rows[0], orders: oRes.rows, quotes: qRes.rows });
   } catch (err) {
     console.error('Admin user detail error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to load user details' });
     } else {
       res.status(500).json({ message: 'Failed to load user details: ' + err.message });
     }
   }
 });

router.put('/users/:id', async (req, res) => {
   try {
     const { name, phone, company, county, role } = req.body;
     const result = await query(
       `UPDATE users SET name=$1,phone=$2,company=$3,county=$4,role=$5 WHERE id=$6 RETURNING id,name,email,phone,company,county,role,created_at`,
       [name, phone, company, county, role, req.params.id]
     );
     if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
     res.json(result.rows[0]);
   } catch (err) {
     console.error('Admin update user error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to update user' });
     } else {
       res.status(500).json({ message: 'Failed to update user: ' + err.message });
     }
   }
 });

router.delete('/users/:id', async (req, res) => {
   try {
     // Prevent deleting yourself
     if (parseInt(req.params.id) === req.user.id) {
       return res.status(400).json({ message: 'You cannot delete your own account' });
     }
     await query(`DELETE FROM users WHERE id=$1`, [req.params.id]);
     res.json({ message: 'User deleted' });
   } catch (err) {
     console.error('Admin delete user error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to delete user' });
     } else {
       res.status(500).json({ message: 'Failed to delete user: ' + err.message });
     }
   }
 });

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
   try {
     const { search, category, page = 1, limit = 20 } = req.query;
     
     // Validate pagination parameters
     const pageNum = parseInt(page);
     const limitNum = parseInt(limit);
     
     if (isNaN(pageNum) || pageNum < 1) {
       return res.status(400).json({ message: 'Invalid page parameter' });
     }
     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
       return res.status(400).json({ message: 'Invalid limit parameter (must be between 1 and 100)' });
     }

     const conditions = [];
     const params = [];
     let idx = 1;

     if (search) {
       conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
       params.push(`%${search}%`); idx++;
     }
     if (category) { conditions.push(`category = $${idx++}`); params.push(category); }

     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
     
     // Get total count
     let total = 0;
     try {
       const countRes = await query(`SELECT COUNT(*) FROM products ${where}`, params);
       total = parseInt(countRes.rows[0].count) || 0;
     } catch (countErr) {
       console.error('Error counting products:', countErr.message);
       throw new Error('Failed to count products');
     }

     // Get paginated data
     const offset = (pageNum - 1) * limitNum;
     let dataRes;
     try {
       dataRes = await query(
         `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
         [...params, limitNum, offset]
       );
     } catch (queryErr) {
       console.error('Error querying products:', queryErr.message);
       throw new Error('Failed to query products');
     }

     // Format response
     const products = dataRes.rows || [];
     const totalPages = Math.ceil(total / limitNum);
     
     res.json({ 
       products, 
       total, 
       pages: totalPages, 
       page: pageNum 
     });
   } catch (err) {
     console.error('Admin products error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to load products' });
     } else {
       res.status(500).json({ message: 'Failed to load products: ' + err.message });
     }
   }
 });

router.post('/products', async (req, res) => {
  try {
    const { name, description, short_description, category, price, sale_price, price_on_request,
            images, brand, origin, in_stock, featured, is_new, best_seller, specifications } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description and category are required' });
    }
    const result = await query(
      `INSERT INTO products (name,description,short_description,category,price,sale_price,price_on_request,
        images,brand,origin,in_stock,featured,is_new,best_seller,specifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [name, description, short_description||'', category,
       price||null, sale_price||null, price_on_request||false,
       images||[], brand||'', origin||'',
       in_stock !== false, featured||false, is_new||false, best_seller||false,
       JSON.stringify(specifications||[])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, description, short_description, category, price, sale_price, price_on_request,
            images, brand, origin, in_stock, featured, is_new, best_seller, specifications } = req.body;

    const result = await query(
      `UPDATE products SET
        name=$1, description=$2, short_description=$3, category=$4,
        price=$5, sale_price=$6, price_on_request=$7, images=$8, brand=$9, origin=$10,
        in_stock=$11, featured=$12, is_new=$13, best_seller=$14, specifications=$15
       WHERE id=$16 RETURNING *`,
      [name, description, short_description||'', category,
       price||null, sale_price||null, price_on_request||false,
       images||[], brand||'', origin||'',
       in_stock !== false, featured||false, is_new||false, best_seller||false,
       JSON.stringify(specifications||[]), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await query(`DELETE FROM products WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ORDERS ────────────────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
   try {
     const { status, search, page = 1, limit = 20 } = req.query;
     
     // Validate pagination parameters
     const pageNum = parseInt(page);
     const limitNum = parseInt(limit);
     
     if (isNaN(pageNum) || pageNum < 1) {
       return res.status(400).json({ message: 'Invalid page parameter' });
     }
     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
       return res.status(400).json({ message: 'Invalid limit parameter (must be between 1 and 100)' });
     }

     const conditions = [];
     const params = [];
     let idx = 1;

     if (status) { conditions.push(`o.status = $${idx++}`); params.push(status); }
     if (search) {
       conditions.push(`(o.order_number ILIKE $${idx} OR u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
       params.push(`%${search}%`); idx++;
     }

     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
     
     // Get total count
     let total = 0;
     try {
       const countRes = await query(
         `SELECT COUNT(*) FROM orders o LEFT JOIN users u ON o.user_id = u.id ${where}`, params
       );
       total = parseInt(countRes.rows[0].count) || 0;
     } catch (countErr) {
       console.error('Error counting orders:', countErr.message);
       throw new Error('Failed to count orders');
     }

     // Get paginated data
     const offset = (pageNum - 1) * limitNum;
     let dataRes;
     try {
       dataRes = await query(
         `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
          FROM orders o LEFT JOIN users u ON o.user_id = u.id
          ${where} ORDER BY o.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
         [...params, limitNum, offset]
       );
     } catch (queryErr) {
       console.error('Error querying orders:', queryErr.message);
       throw new Error('Failed to query orders');
     }

     res.json({ 
       orders: dataRes.rows || [], 
       total, 
       pages: Math.ceil(total / limitNum), 
       page: pageNum 
     });
   } catch (err) {
     console.error('Admin orders error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to load orders' });
     } else {
       res.status(500).json({ message: 'Failed to load orders: ' + err.message });
     }
   }
 });

router.get('/orders/:id', async (req, res) => {
  try {
    const oRes = await query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id=$1`, [req.params.id]
    );
    if (!oRes.rows.length) return res.status(404).json({ message: 'Order not found' });
    const iRes = await query(`SELECT * FROM order_items WHERE order_id=$1`, [req.params.id]);
    res.json({ ...oRes.rows[0], items: iRes.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
   try {
     const { status, payment_status } = req.body;
     const result = await query(
       `UPDATE orders SET status=COALESCE($1,status), payment_status=COALESCE($2,payment_status)
        WHERE id=$3 RETURNING *`,
       [status || null, payment_status || null, req.params.id]
     );
     if (!result.rows.length) return res.status(404).json({ message: 'Order not found' });
     res.json(result.rows[0]);
   } catch (err) {
     console.error('Admin update order status error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to update order status' });
     } else {
       res.status(500).json({ message: 'Failed to update order status: ' + err.message });
     }
   }
 });

// ── QUOTES ────────────────────────────────────────────────────────────────────
router.get('/quotes', async (req, res) => {
   try {
     const { status, search, page = 1, limit = 20 } = req.query;
     
     // Validate pagination parameters
     const pageNum = parseInt(page);
     const limitNum = parseInt(limit);
     
     if (isNaN(pageNum) || pageNum < 1) {
       return res.status(400).json({ message: 'Invalid page parameter' });
     }
     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
       return res.status(400).json({ message: 'Invalid limit parameter (must be between 1 and 100)' });
     }

     const conditions = [];
     const params = [];
     let idx = 1;

     if (status) { conditions.push(`q.status = $${idx++}`); params.push(status); }
     if (search) {
       conditions.push(`(q.quote_number ILIKE $${idx} OR q.name ILIKE $${idx} OR q.email ILIKE $${idx} OR q.company ILIKE $${idx})`);
       params.push(`%${search}%`); idx++;
     }

     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
     
     // Get total count
     let total = 0;
     try {
       const countRes = await query(`SELECT COUNT(*) FROM quotes q ${where}`, params);
       total = parseInt(countRes.rows[0].count) || 0;
     } catch (countErr) {
       console.error('Error counting quotes:', countErr.message);
       throw new Error('Failed to count quotes');
     }

     // Get paginated data
     const offset = (pageNum - 1) * limitNum;
     let dataRes;
     try {
       dataRes = await query(
         `SELECT q.*,
                 COUNT(qi.id) AS item_count
          FROM quotes q
          LEFT JOIN quote_items qi ON qi.quote_id = q.id
          ${where}
          GROUP BY q.id
          ORDER BY q.created_at DESC
          LIMIT $${idx} OFFSET $${idx+1}`,
         [...params, limitNum, offset]
       );
     } catch (queryErr) {
       console.error('Error querying quotes:', queryErr.message);
       throw new Error('Failed to query quotes');
     }

     const quotes = dataRes.rows || [];
     const formattedQuotes = quotes.map(q => formatAdminQuote(q));
     
     res.json({ 
       quotes: formattedQuotes, 
       total, 
       pages: Math.ceil(total / limitNum), 
       page: pageNum 
     });
   } catch (err) {
     console.error('Admin quotes error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to load quotes' });
     } else {
       res.status(500).json({ message: 'Failed to load quotes: ' + err.message });
     }
   }
 });

router.get('/quotes/:id', async (req, res) => {
  try {
    const qRes = await query(`SELECT * FROM quotes WHERE id=$1`, [req.params.id]);
    if (!qRes.rows.length) return res.status(404).json({ message: 'Quote not found' });
    const iRes = await query(`SELECT * FROM quote_items WHERE quote_id=$1`, [req.params.id]);
    res.json(formatAdminQuote(qRes.rows[0], iRes.rows));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/quotes/:id', async (req, res) => {
   try {
     const { status, quoted_price, admin_notes, response_message } = req.body;
     const normalizedPrice = quoted_price === '' || quoted_price === null || quoted_price === undefined
       ? null
       : parseFloat(quoted_price);
     const normalizedAdminNotes = admin_notes === '' ? null : admin_notes;
     const normalizedResponseMessage = response_message === '' ? null : response_message;
     const result = await query(
       `UPDATE quotes SET
          status = COALESCE($1,status),
          quoted_price = COALESCE($2,quoted_price),
          admin_notes = COALESCE($3,admin_notes),
          response_message = COALESCE($4,response_message),
          responded_at = CASE WHEN $4 IS NOT NULL THEN NOW() ELSE responded_at END
        WHERE id=$5 RETURNING *`,
       [status || null, normalizedPrice, normalizedAdminNotes, normalizedResponseMessage, req.params.id]
     );
     if (!result.rows.length) return res.status(404).json({ message: 'Quote not found' });
     const iRes = await query(`SELECT * FROM quote_items WHERE quote_id=$1`, [req.params.id]);
     res.json(formatAdminQuote(result.rows[0], iRes.rows));
   } catch (err) {
     console.error('Admin update quote error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to update quote' });
     } else {
       res.status(500).json({ message: 'Failed to update quote: ' + err.message });
     }
   }
 });

// ── MESSAGES ──────────────────────────────────────────────────────────────────
router.get('/messages', async (req, res) => {
   try {
     const { is_read, page = 1, limit = 20 } = req.query;
     
     // Validate pagination parameters
     const pageNum = parseInt(page);
     const limitNum = parseInt(limit);
     
     if (isNaN(pageNum) || pageNum < 1) {
       return res.status(400).json({ message: 'Invalid page parameter' });
     }
     if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
       return res.status(400).json({ message: 'Invalid limit parameter (must be between 1 and 100)' });
     }

     const conditions = [];
     const params = [];
     let idx = 1;

     if (is_read !== undefined && is_read !== '') {
       conditions.push(`is_read = $${idx++}`);
       params.push(is_read === 'true');
     }

     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
     
     // Get total count
     let total = 0;
     try {
       const countRes = await query(`SELECT COUNT(*) FROM contact_messages ${where}`, params);
       total = parseInt(countRes.rows[0].count) || 0;
     } catch (countErr) {
       console.error('Error counting messages:', countErr.message);
       throw new Error('Failed to count messages');
     }

     // Get paginated data
     const offset = (pageNum - 1) * limitNum;
     let dataRes;
     try {
       dataRes = await query(
         `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
         [...params, limitNum, offset]
       );
     } catch (queryErr) {
       console.error('Error querying messages:', queryErr.message);
       throw new Error('Failed to query messages');
     }

     res.json({ 
       messages: dataRes.rows || [], 
       total, 
       pages: Math.ceil(total / limitNum), 
       page: pageNum 
     });
   } catch (err) {
     console.error('Admin messages error:', err.message);
     // Don't expose internal error details in production
     if (process.env.NODE_ENV === 'production') {
       res.status(500).json({ message: 'Failed to load messages' });
     } else {
       res.status(500).json({ message: 'Failed to load messages: ' + err.message });
     }
   }
 });

router.put('/messages/:id/read', async (req, res) => {
  try {
    await query(`UPDATE contact_messages SET is_read=TRUE WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    await query(`DELETE FROM contact_messages WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
