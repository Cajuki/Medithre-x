import express from 'express';
import { productUpload, categoryUpload, uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';
import { query } from '../db/pool.js';

const router = express.Router();
router.use(protect, admin);

// ── POST /api/upload/product-images  (up to 10) ───────────────────────────────
router.post('/product-images', productUpload.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No images uploaded' });

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file, 'products'));
    const urls = await Promise.all(uploadPromises);

    return res.status(201).json({ message: `${req.files.length} image(s) uploaded`, images: urls });
  } catch (err) {
    console.error('❌ Product image upload error:', err.message);
    return res.status(500).json({ message: 'Failed to upload product images' });
  }
});

// ── POST /api/upload/category-image  (single image) ──────────────────────────
router.post('/category-image', categoryUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const imageUrl = await uploadToCloudinary(req.file, 'categories');
    return res.status(201).json({ message: 'Category image uploaded', image: imageUrl });
  } catch (err) {
    console.error('❌ Category image upload error:', err.message);
    return res.status(500).json({ message: 'Failed to upload category image' });
  }
});

// Shared delete handler used by both image endpoints
const removeImageHandler = async (req, res) => {
  try {
    const { imageUrl, productId, categoryId } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    await deleteFromCloudinary(imageUrl);

    if (productId) {
      await query('UPDATE products SET images = array_remove(images, $1) WHERE id = $2', [imageUrl, productId]);
    }
    if (categoryId) {
      await query('UPDATE categories SET image_url = NULL WHERE id = $1 AND image_url = $2', [categoryId, imageUrl]);
    }
    return res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error('❌ Image delete error:', err.message);
    return res.status(500).json({ message: 'Failed to delete image' });
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