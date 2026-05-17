import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadToCloudinary = (file, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
  
  try {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(p => p === 'upload');
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) return;
    
    const publicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

export const categoryUpload = memoryUpload;
export const productUpload = memoryUpload;