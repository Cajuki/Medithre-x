import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

// ── Helper: normalise a DB row to the shape the frontend expects ─────────────
const fmt = (p) => ({
  id:               String(p.id),
  name:             p.name,
  description:      p.description,
  shortDescription: p.short_description,
  category:         p.category,
  price:            p.price ? parseFloat(p.price) : null,
  salePrice:        p.sale_price ? parseFloat(p.sale_price) : null,
  priceOnRequest:   p.price_on_request,
  images:           p.images || [],
  brand:            p.brand,
  origin:           p.origin,
  inStock:          p.in_stock,
  featured:         p.featured,
  isNew:            p.is_new,
  bestSeller:       p.best_seller,
  specifications:   p.specifications || [],
  createdAt:        p.created_at,
});

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, inStock, page = 1, limit = 12 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category && category !== 'all') {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (featured === 'true') { conditions.push(`featured = TRUE`); }
    if (inStock  === 'true') { conditions.push(`in_stock = TRUE`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countRes = await query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total    = parseInt(countRes.rows[0].count);

    // Paginated rows
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dataRes = await query(
      `SELECT * FROM products ${where} ORDER BY featured DESC, created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, parseInt(limit), offset]
    );

    return res.json({
      products: dataRes.rows.map(fmt),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page)
    });
  } catch (err) {
    console.error('Products list error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/products/categories ──────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT category AS name, COUNT(*) AS count
       FROM products GROUP BY category ORDER BY category`
    );
    return res.json(result.rows.map(r => ({ name: r.name, count: parseInt(r.count) })));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Product not found' });
    return res.json(fmt(result.rows[0]));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
