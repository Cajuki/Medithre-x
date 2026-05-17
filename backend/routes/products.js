import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

const format = (p) => ({
  id: String(p.id),
  name: p.name,
  description: p.description,
  shortDescription: p.short_description,
  category: p.category,
  price: p.price ? parseFloat(p.price) : null,
  salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
  priceOnRequest: p.price_on_request,
  images: Array.isArray(p.images) ? p.images : [],
  brand: p.brand,
  origin: p.origin,
  inStock: p.in_stock,
  featured: p.featured,
  specifications: Array.isArray(p.specifications)
    ? p.specifications
    : (p.specifications ? JSON.parse(p.specifications) : []),
  createdAt: p.created_at,
});

// ── GET ALL PRODUCTS ──
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    const conditions = [];
    const params = [];
    let i = 1;

    if (category) {
      conditions.push(`category = $${i++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(name ILIKE $${i} OR description ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRes = await query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(totalRes.rows[0].count);

    const offset = (page - 1) * limit;

    const data = await query(
      `SELECT * FROM products ${where}
       ORDER BY created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );

    res.json({
      products: data.rows.map(format),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

// ── GET SINGLE PRODUCT ──
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products WHERE id=$1', [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(format(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;