import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

const format = (p) => {
  const price = p.price ? parseFloat(p.price) : null;
  const salePrice = p.sale_price ? parseFloat(p.sale_price) : null;
  // For frontend compatibility: price = current price, compare_price = original price
  const currentPrice = salePrice !== null ? salePrice : price;
  const comparePrice = salePrice !== null ? price : 0;
  
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    shortDescription: p.short_description,
    category: p.category,
    price: currentPrice,
    compare_price: comparePrice,
    salePrice: salePrice, // Keep for backward compatibility if needed
    priceOnRequest: p.price_on_request,
    images: Array.isArray(p.images) ? p.images : [],
    image_url: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
    brand: p.brand,
    manufacturer: p.manufacturer,
    origin: p.origin,
    inStock: p.in_stock,
    stock: p.stock ?? 0,
    sku: p.sku,
    featured: p.featured,
    specifications: Array.isArray(p.specifications)
      ? p.specifications
      : (p.specifications ? JSON.parse(p.specifications) : []),
    features: Array.isArray(p.features)
      ? p.features
      : (p.features ? JSON.parse(p.features) : []),
    rating: p.rating ? parseFloat(p.rating) : 0,
    review_count: p.review_count ? parseInt(p.review_count) : 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

// ── GET PRODUCTS BY IDS (for wishlist) ──
router.get('/batch', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.json({ products: [] });

    const idArr = ids.split(',').map(id => id.trim()).filter(Boolean);
    if (!idArr.length) return res.json({ products: [] });

    const placeholders = idArr.map((_, i) => `$${i + 1}`).join(',');
    const result = await query(
      `SELECT * FROM products WHERE id IN (${placeholders})`,
      idArr
    );

    // Preserve the original order from the request
    const productMap = {};
    result.rows.forEach(r => { productMap[r.id] = format(r); });
    const ordered = idArr.map(id => productMap[id]).filter(Boolean);

    res.json({ products: ordered });
  } catch (err) {
    console.error('Batch products error:', err);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

// ── GET ALL PRODUCTS ──
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 12, sort, min_price, max_price } = req.query;

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

    if (featured !== undefined && featured !== '') {
      conditions.push(`featured = $${i++}`);
      params.push(featured === 'true');
    }

    if (min_price) {
      conditions.push(`(COALESCE(sale_price, price) >= $${i})`);
      params.push(parseFloat(min_price));
      i++;
    }

    if (max_price) {
      conditions.push(`(COALESCE(sale_price, price) <= $${i})`);
      params.push(parseFloat(max_price));
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRes = await query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(totalRes.rows[0].count);

    const offset = (page - 1) * limit;

    // Build ORDER BY clause based on sort param
    let orderClause = 'created_at DESC';
    switch (sort) {
      case 'price_asc':
        orderClause = 'COALESCE(sale_price, price) ASC NULLS LAST';
        break;
      case 'price_desc':
        orderClause = 'COALESCE(sale_price, price) DESC NULLS LAST';
        break;
      case 'name_asc':
        orderClause = 'name ASC';
        break;
      case 'name_desc':
        orderClause = 'name DESC';
        break;
      case 'popular':
        orderClause = 'featured DESC, created_at DESC';
        break;
      case 'newest':
      default:
        orderClause = 'created_at DESC';
        break;
    }

    const data = await query(
      `SELECT * FROM products ${where}
       ORDER BY ${orderClause}
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
