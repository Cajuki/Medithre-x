import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const uploadsDir = path.join(process.cwd(), 'uploads');

// ── Google Cloud Storage setup ────────────────────────────────────────────────
// On Cloud Run, default credentials are available automatically.
// Locally, set GOOGLE_APPLICATION_CREDENTIALS to your service account key file.
let gcsBucket = null;
let gcsClient = null;

if (process.env.GOOGLE_CLOUD_BUCKET) {
  const rawKeyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  // Only pass keyFilename when the file actually exists on disk.
  // On Cloud Run default credentials (Workload Identity) are used automatically
  // and no file is needed — skipping avoids ENOENT at startup.
  const keyFilename = rawKeyFilename && fs.existsSync(rawKeyFilename) ? rawKeyFilename : undefined;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  gcsClient = new Storage({
    projectId,
    ...(keyFilename ? { keyFilename } : {}),
    ...(projectId ? { userProject: projectId } : {}), // required for requester-pays buckets
  });
  gcsBucket = gcsClient.bucket(process.env.GOOGLE_CLOUD_BUCKET);
}

// ── Ensure local uploads directory (for local dev fallback only) ─────────────
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
['products', 'categories'].forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// ── Local disk storage (development only) ────────────────────────────────────
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

// ── Multer memory storage (always used; we handle upload in the route) ───────
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── GCS upload helper ────────────────────────────────────────────────────────
export const uploadToGCS = (file, destination) => {
  return new Promise((resolve, reject) => {
    if (!gcsBucket) return reject(new Error('Google Cloud Storage bucket not configured'));

    const blob = gcsBucket.file(destination);
    const stream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000',
      },
      // Explicit userProject required for requester-pays buckets.
      // The Storage constructor-level userProject is not always inherited
      // by createWriteStream / resumable-upload internals.
      userProject: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });

    stream.on('error', (err) => {
      console.error('GCS upload error:', err.message);
      reject(err);
    });

    stream.on('finish', async () => {
      try {
        // Apply public-read ACL on the uploaded object.
        // makePublic() internally calls patch() — on requester-pays buckets
        // that patch call needs the userProject header or it fails with
        // "Bucket is a requester pays bucket but no user project provided".
        await blob.setMetadata({
          predefinedAcl: 'publicRead',
        }, {
          userProject: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });
        const publicUrl = `https://storage.googleapis.com/${gcsBucket.name}/${destination}`;
        resolve(publicUrl);
      } catch (err) {
        console.error('GCS setMetadata / makePublic error:', err.message);
        reject(err);
      }
    });

    stream.end(file.buffer);
  });
};

// ── Delete from GCS ─────────────────────────────────────────────────────────
export const deleteFromGCS = (url) => {
  return new Promise((resolve, reject) => {
    if (!gcsBucket) return resolve(); // silently skip if no bucket configured

    // Extract the file path from a GCS URL
    // Supports: https://storage.googleapis.com/BUCKET_NAME/path/to/file
    //           /uploads/products/filename.jpg (legacy local path)
    let filePath = url;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'storage.googleapis.com') {
        filePath = urlObj.pathname.replace(`/${gcsBucket.name}/`, '');
      }
    } catch {
      // Not a full URL — treat as a local-style path, skip GCS delete
      resolve();
      return;
    }

    const blob = gcsBucket.file(filePath);
    blob.delete({
      // Explicit userProject required for requester-pays buckets on
      // delete operations even when the Storage client was created with it.
      userProject: process.env.GOOGLE_CLOUD_PROJECT_ID,
    })
      .then(() => {
        console.log('🗑️ GCS image deleted:', filePath);
        resolve();
      })
      .catch((err) => {
        if (err.code === 404) {
          console.log('GCS file not found (already deleted):', filePath);
          resolve();
        } else {
          console.error('GCS delete error:', err.message);
          reject(err);
        }
      });
  });
};

// ── Delete from local disk ───────────────────────────────────────────────────
export const deleteLocalImage = (imageUrl) => {
  try {
    if (!imageUrl) return;

    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    if (filename) {
      let filePath;
      if (imageUrl.includes('/products/')) {
        filePath = path.join(uploadsDir, 'products', filename);
      } else if (imageUrl.includes('/categories/')) {
        filePath = path.join(uploadsDir, 'categories', filename);
      } else {
        filePath = path.join(uploadsDir, 'products', filename);
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Local image deleted:', filePath);
      }
    }
  } catch (error) {
    console.error('Delete local image error:', error.message);
  }
};

// ── Unified delete (tries GCS first for full URLs, falls back to local) ──────
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  // If it looks like a GCS URL, delete from GCS
  if (imageUrl.includes('storage.googleapis.com')) {
    await deleteFromGCS(imageUrl);
  } else {
    // Local path — delete from disk
    deleteLocalImage(imageUrl);
  }
};

// ── Exports ──────────────────────────────────────────────────────────────────
export const categoryUpload = memoryUpload;
export const productUpload = memoryUpload;
export const isGCSAvailable = () => !!gcsBucket;