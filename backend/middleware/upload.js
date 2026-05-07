import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../uploads');
const hasCloudinary =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

for (const folder of ['products', 'categories']) {
  fs.mkdirSync(path.join(uploadRoot, folder), { recursive: true });
}

const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
};

class CloudinaryEngine {
  constructor(options = {}) {
    this.folder = options.folder || 'medithrex';
    this.transformation = options.transformation || [];
  }

  _handleFile(_req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: this.folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: this.transformation,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
          mimetype: file.mimetype,
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(_req, file, cb) {
    cloudinary.uploader.destroy(file.filename, (err) => cb(err));
  }
}

const localStorage = (subdir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadRoot, subdir)),
    filename: (_req, file, cb) => {
      const safeExt = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  });

const makeUploader = (cloudinaryFolder, localFolder, maxFiles) =>
  multer({
    storage: hasCloudinary
      ? new CloudinaryEngine({
          folder: cloudinaryFolder,
          transformation: [{ width: 1400, height: 1050, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        })
      : localStorage(localFolder),
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: maxFiles,
    },
  });

export const productUpload = makeUploader(
  process.env.CLOUDINARY_FOLDER || 'medithrex_products',
  'products',
  10
);

export const categoryUpload = makeUploader(
  process.env.CLOUDINARY_CATEGORY_FOLDER || 'medithrex_categories',
  'categories',
  1
);

const toPublicUploadPath = (filePath) => {
  const relative = path.relative(uploadRoot, filePath).replace(/\\/g, '/');
  return `/uploads/${relative}`;
};

export const normalizeUploadedFiles = (files = []) =>
  files.map((file) => normalizeUploadedFile(file)).filter(Boolean);

export const normalizeUploadedFile = (file) => {
  if (!file) return null;
  if (hasCloudinary) return file.path || file.secure_url || file.url || null;
  return file.path ? toPublicUploadPath(file.path) : null;
};

export const deleteImage = async (imageRef) => {
  if (!imageRef) return;

  if (hasCloudinary && !String(imageRef).startsWith('/uploads/')) {
    try {
      await cloudinary.uploader.destroy(imageRef);
    } catch (err) {
      console.error('Cloudinary delete error:', err.message);
    }
    return;
  }

  const relativePath = String(imageRef).replace(/^\/+/, '');
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  if (!absolutePath.startsWith(uploadRoot)) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Local image delete error:', err.message);
  }
};

export const extractPublicId = (url) => {
  if (!url) return null;

  if (String(url).startsWith('/uploads/')) {
    return url;
  }

  if (!String(url).includes('cloudinary.com')) return null;

  try {
    const parts = String(url).split('/');
    const file = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${file}`;
  } catch {
    return null;
  }
};

export default productUpload;
