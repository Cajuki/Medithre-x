import { query } from './pool.js';

export default async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) UNIQUE NOT NULL,
      description VARCHAR(300),
      image_url   TEXT,
      sort_order  INTEGER DEFAULT 0,
      is_active   BOOLEAN DEFAULT TRUE,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS best_seller BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS sale_price NUMERIC(14,2);
  `);

  await query(`
    ALTER TABLE quotes
      ADD COLUMN IF NOT EXISTS response_message TEXT,
      ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);
  `);

  await query(`
    INSERT INTO categories (name, description)
    SELECT DISTINCT category, ''
    FROM products
    WHERE category IS NOT NULL AND category <> ''
    ON CONFLICT (name) DO NOTHING;
  `);
}
