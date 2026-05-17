import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './db/pool.js';
import ensureSchema from './db/ensureSchema.js';
import authRoutes    from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes   from './routes/orders.js';
import quoteRoutes   from './routes/quotes.js';
import contactRoutes from './routes/contact.js';
import adminRoutes   from './routes/admin.js';
import uploadRoutes     from './routes/upload.js';
import categoryRoutes  from './routes/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app  = express();
// Cloud Run injects PORT at runtime — always use process.env.PORT
const PORT = process.env.PORT || 8080;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploads directory only in development (Cloud Run uses Cloudinary for uploads)
// In production, images are served from Cloudinary CDN URLs
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/quotes',   quoteRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/categories', categoryRoutes);

// ── Health check (Cloud Run uses this to verify the container is alive) ───────
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time, current_database() AS db');
    res.json({
      status: 'ok',
      service: 'Medithrex API',
      database: 'PostgreSQL',
      db_name: result.rows[0].db,
      timestamp: result.rows[0].time,
      environment: process.env.NODE_ENV || 'development',
      cloudinary: {
        configured: !!process.env.CLOUDINARY_CLOUD_NAME,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      },
    });
  } catch (err) {
    // Return 200 so Cloud Run doesn't restart — just flag DB as disconnected
    res.status(200).json({ status: 'degraded', database: 'disconnected', error: err.message });
  }
});

// ── Root route ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Medithrex API — use /api/* endpoints', docs: '/api/health' });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Startup ───────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await ensureSchema();
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection verified');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    // Don't exit — Cloud Run will retry; DB might just be cold-starting
  }

  // Cloud Run requires binding to 0.0.0.0 (not localhost)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Medithrex API running on port ${PORT}`);
    console.log(`   Health: http://0.0.0.0:${PORT}/api/health`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
export default app;
