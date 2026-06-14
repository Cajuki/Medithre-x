import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import pool from './db/pool.js';
import ensureSchema from './db/ensureSchema.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import quoteRoutes from './routes/quotes.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import categoryRoutes from './routes/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

// ─────────────────────────────────────────────
// TRUST PROXY (IMPORTANT for Cloud Run)
// ─────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────
// CORS CONFIG (FIXED for frontend stability)
// ─────────────────────────────────────────────
const corsOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy does not allow access from ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// STATIC FILES (DEV ONLY)
// ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
}

// ─────────────────────────────────────────────
// ROUTES (CRITICAL FIX: ORDER MATTERS)
// ─────────────────────────────────────────────
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
      },
    });
  } catch (err) {
    res.status(200).json({
      status: 'degraded',
      database: 'disconnected',
      error: err.message,
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Medithrex API running',
    docs: '/api/health',
  });
});

// ─────────────────────────────────────────────
// API ROUTES (FIXED PREFIX CONSISTENCY)
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contact', contactRoutes);

// 🔥 CRITICAL FIX: ADMIN ROUTES (THIS FIXES YOUR 404)
app.use('/api/admin', adminRoutes);

app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
  });
});

// ─────────────────────────────────────────────
// START SERVER (CLOUD RUN SAFE)
// ─────────────────────────────────────────────
const start = async () => {
  try {
    await ensureSchema();
    await pool.query('SELECT 1');
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ DB connection issue:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Health: /api/health`);
  });
};

start();

export default app;