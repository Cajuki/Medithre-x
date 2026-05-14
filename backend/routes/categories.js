import express from 'express';
import path from 'path';
import fs from 'fs';
import { query } from '../db/pool.js';
import { protect, admin } from '../middleware/auth.js';
import { categoryUpload, deleteImage, uploadToGCS, isGCSAvailable } from '../middleware/upload.js';

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads');

// ── GET /api/categories — public, used by homepage & products page ────────────
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category = c.name AND p.in_stock = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/categories/all — admin: all categories including inactive ─────────
router.get('/all', protect, admin, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category = c.name
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/categories — admin create with image upload ─────────────────────
router.post('/', protect, admin, categoryUpload.single('image'), async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    let imageUrl = null;
    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const destination = `categories/${filename}`;

      if (isGCSAvailable()) {
        imageUrl = await uploadToGCS(req.file, destination);
      } else {
        const localPath = path.join(uploadsDir, 'categories', filename);
        fs.writeFileSync(localPath, req.file.buffer);
        imageUrl = `/uploads/categories/${filename}`;
      }
    }

    // Check duplicate name
    const existing = await query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [name]);
    if (existing.rows.length) return res.status(409).json({ message: 'A category with this name already exists' });

    const result = await query(
      `INSERT INTO categories (name, description, image_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), description || '', imageUrl, parseInt(sort_order) || 0, is_active !== 'false']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/categories/:id — admin update (with optional new image) ───────────
router.put('/:id', protect, admin, categoryUpload.single('image'), async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    // If a new image was uploaded, use it; otherwise keep existing
    let imageUrl = null;
    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const destination = `categories/${filename}`;

      if (isGCSAvailable()) {
        imageUrl = await uploadToGCS(req.file, destination);
      } else {
        const localPath = path.join(uploadsDir, 'categories', filename);
        fs.writeFileSync(localPath, req.file.buffer);
        imageUrl = `/uploads/categories/${filename}`;
      }

      const current = await query('SELECT image_url FROM categories WHERE id = $1', [req.params.id]);
      if (current.rows[0]?.image_url) {
        await deleteImage(current.rows[0].image_url);
      }
    }

    const result = await query(
      `UPDATE categories
       SET name        = $1,
           description = $2,
           image_url   = COALESCE($3, image_url),
           sort_order  = $4,
           is_active   = $5,
           updated_at  = NOW()
       WHERE id = $6
       RETURNING *`,
      [name.trim(), description || '', imageUrl, parseInt(sort_order) || 0, is_active !== 'false', req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/categories/:id — admin delete ─────────────────────────────────
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const cat = await query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!cat.rows.length) return res.status(404).json({ message: 'Category not found' });

    if (cat.rows[0].image_url) {
      await deleteImage(cat.rows[0].image_url);
    }

    await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/categories/:id/toggle — quick active/inactive toggle ───────────
router.patch('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const result = await query(
      'UPDATE categories SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
