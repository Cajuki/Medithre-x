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

// Trust Cloud Run proxy
app.set('trust proxy', 1);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  'https://medithrex.site',
  'https://www.medithrex.site',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ CORS blocked: ${origin}`);

      return callback(
        new Error(`Origin ${origin} not allowed by CORS policy`)
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'Accept'
    ],
    credentials: true,
    optionsSuccessStatus: 200
  })
);

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// STATIC FILES
// =====================================================

if (process.env.NODE_ENV !== 'production') {
  app.use(
    '/uploads',
    express.static(path.resolve(__dirname, 'uploads'))
  );
}

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS time, current_database() AS db'
    );

    res.json({
      status: 'ok',
      service: 'Medithrex API',
      database: 'PostgreSQL',
      db_name: result.rows[0].db,
      timestamp: result.rows[0].time,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// =====================================================
// SITEMAP (serve a minimal sitemap from backend as a fallback)
// =====================================================

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    { loc: 'https://medithrex.site/', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://medithrex.site/products', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://medithrex.site/contact', changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://medithrex.site/about', changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://medithrex.site/quote', changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://medithrex.site/privacy', changefreq: 'monthly', priority: '0.4' },
    { loc: 'https://medithrex.site/terms', changefreq: 'monthly', priority: '0.4' },
    { loc: 'https://medithrex.site/returns', changefreq: 'monthly', priority: '0.4' }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// =====================================================
// ROOT ROUTE
// =====================================================

app.get('/', (req, res) => {
  res.json({
    message: 'Medithrex API running',
    health: '/api/health'
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// =====================================================
// START SERVER
// =====================================================

const start = async () => {
  try {
    await ensureSchema();
    await pool.query('SELECT 1');

    console.log('✅ PostgreSQL connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Health check: /api/health`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
};

start();

export default app;