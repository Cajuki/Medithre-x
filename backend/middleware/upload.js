import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET || 'medithrex-uploads');

const makeGCSStorage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'temp-uploads', subfolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const uploadToGCS = async (filePath, destination) => {
  try {
    const [file] = await bucket.upload(filePath, {
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make the file public
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    return publicUrl;
  } catch (error) {
    console.error('GCS upload error:', error);
    throw error;
  } finally {
    // Clean up temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract filename from GCS URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    if (filename) {
      await bucket.file(filename).delete();
      console.log('🗑️ GCS image deleted');
    }
  } catch (error) {
    console.error('Delete image error:', error.message);
  }
};

export const categoryUpload = multer({
  storage: makeGCSStorage('categories'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const productUpload = multer({
  storage: makeGCSStorage('products'),
  limits: { fileSize: 5 * 1024 * 1024 },
});