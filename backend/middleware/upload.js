import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure subdirectories exist
['products', 'categories'].forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const makeLocalStorage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, subfolder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract filename from URL (assuming it's served from /uploads/)
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (filename) {
      // Determine if it's a product or category image from the URL
      let filePath;
      if (imageUrl.includes('/products/')) {
        filePath = path.join(uploadsDir, 'products', filename);
      } else if (imageUrl.includes('/categories/')) {
        filePath = path.join(uploadsDir, 'categories', filename);
      } else {
        // Default to products if we can't determine
        filePath = path.join(uploadsDir, 'products', filename);
      }
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Local image deleted:', filePath);
      }
    }
  } catch (error) {
    console.error('Delete image error:', error.message);
  }
};

export const categoryUpload = multer({
  storage: makeLocalStorage('categories'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const productUpload = multer({
  storage: makeLocalStorage('products'),
  limits: { fileSize: 5 * 1024 * 1024 },
});