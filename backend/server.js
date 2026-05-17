import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './db/pool.js';
import ensureSchema from './db/ensureSchema.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import quoteRoutes from './routes/quotes.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

// ── MIDDLEWARE ─────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ── ROUTES ─────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// ── HEALTH ─────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({
      status: 'ok',
      time: result.rows[0].time,
      env: process.env.NODE_ENV || 'dev'
    });
  } catch (err) {
    res.status(200).json({
      status: 'degraded',
      error: err.message
    });
  }
});

// ── ROOT ─────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'MedithreX API running' });
});

// ── 404 ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── ERROR HANDLER ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 GLOBAL ERROR:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// ── START ─────────────────────────────
const start = async () => {
  try {
    await ensureSchema();
    await pool.query('SELECT 1');
    console.log('✅ DB connected');
  } catch (err) {
    console.log('❌ DB error:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();

export default app;