import express from 'express';
import {
  productUpload,
  categoryUpload,
  deleteImage,
  extractPublicId,
  normalizeUploadedFile,
  normalizeUploadedFiles,
} from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';
import { query } from '../db/pool.js';

const router = express.Router();
router.use(protect, admin);

// ── POST /api/upload/product-images  (up to 10) ───────────────────────────────
router.post('/product-images', productUpload.array('images', 10), (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No images uploaded' });
    const urls = normalizeUploadedFiles(req.files);
    return res.status(201).json({ message: `${req.files.length} image(s) uploaded`, images: urls });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/upload/category-image  (single image) ──────────────────────────
router.post('/category-image', categoryUpload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const url = normalizeUploadedFile(req.file);
    return res.status(201).json({ message: 'Category image uploaded', image: url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/upload/image  (delete any image by URL) ──────────────────────
router.delete('/image', async (req, res) => {
  try {
    const { imageUrl, productId, categoryId } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    const publicId = extractPublicId(imageUrl);
    if (publicId) await deleteImage(publicId);

    if (productId) {
      await query('UPDATE products SET images = array_remove(images, $1) WHERE id = $2', [imageUrl, productId]);
    }
    if (categoryId) {
      await query('UPDATE categories SET image_url = NULL WHERE id = $1 AND image_url = $2', [categoryId, imageUrl]);
    }
    return res.json({ message: 'Image deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete('/product-image', async (req, res) => {
  try {
    const { imageUrl, productId } = req.body;
    if (!imageUrl || !productId) return res.status(400).json({ message: 'imageUrl and productId are required' });

    const publicId = extractPublicId(imageUrl);
    if (publicId) await deleteImage(publicId);
    await query('UPDATE products SET images = array_remove(images, $1) WHERE id = $2', [imageUrl, productId]);

    return res.json({ message: 'Image deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Multer error handler
router.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Maximum 10 images allowed per product' });
  if (err.code === 'LIMIT_FILE_SIZE')  return res.status(400).json({ message: 'Each image must be under 5 MB' });
  return res.status(400).json({ message: err.message || 'Upload failed' });
});

export default router;
