import express from 'express';
import path from 'path';
import fs from 'fs';
import { productUpload, categoryUpload, deleteImage, uploadToGCS, isGCSAvailable } from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';
import { query } from '../db/pool.js';

const router = express.Router();
router.use(protect, admin);

// Ensure uploads directory exists (local dev only)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
['products', 'categories'].forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// ── POST /api/upload/product-images  (up to 10) ───────────────────────────────
router.post('/product-images', productUpload.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No images uploaded' });

    const urls = [];
    for (const file of req.files) {
      const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const destination = `products/${filename}`;

      if (isGCSAvailable()) {
        const publicUrl = await uploadToGCS(file, destination);
        urls.push(publicUrl);
      } else {
        // Local dev fallback
        const localPath = path.join(uploadsDir, 'products', filename);
        fs.writeFileSync(localPath, file.buffer);
        urls.push(`/uploads/products/${filename}`);
      }
    }

    return res.status(201).json({ message: `${req.files.length} image(s) uploaded`, images: urls });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/upload/category-image  (single image) ──────────────────────────
router.post('/category-image', categoryUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const destination = `categories/${filename}`;

    if (isGCSAvailable()) {
      const publicUrl = await uploadToGCS(req.file, destination);
      return res.status(201).json({ message: 'Category image uploaded', image: publicUrl });
    } else {
      // Local dev fallback
      const localPath = path.join(uploadsDir, 'categories', filename);
      fs.writeFileSync(localPath, req.file.buffer);
      return res.status(201).json({ message: 'Category image uploaded', image: `/uploads/categories/${filename}` });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Shared delete handler used by both image endpoints
const removeImageHandler = async (req, res) => {
  try {
    const { imageUrl, productId, categoryId } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    await deleteImage(imageUrl);

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
};

router.delete('/image', removeImageHandler);
router.delete('/product-image', removeImageHandler);

// Multer error handler
router.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Maximum 10 images allowed per product' });
  if (err.code === 'LIMIT_FILE_SIZE')  return res.status(400).json({ message: 'Each image must be under 5 MB' });
  return res.status(400).json({ message: err.message || 'Upload failed' });
});

export default router;
