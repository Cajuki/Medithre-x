import { query } from './pool.js';

const createTables = async () => {
  console.log('🔧 Initialising Medithrex database schema...\n');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL       PRIMARY KEY,
      name       VARCHAR(150) NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      phone      VARCHAR(30),
      company    VARCHAR(150),
      county     VARCHAR(80),
      country    VARCHAR(80)  DEFAULT 'Kenya',
      password   TEXT         NOT NULL,
      role       VARCHAR(20)  DEFAULT 'user' CHECK (role IN ('user','admin')),
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
  console.log('  ✅ users');

  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id         SERIAL       PRIMARY KEY,
      token_hash VARCHAR(255) UNIQUE NOT NULL,
      user_id    INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ  NOT NULL,
      used      BOOLEAN      DEFAULT FALSE,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
  console.log('  ✅ password_reset_tokens');

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          SERIAL       PRIMARY KEY,
      name        VARCHAR(100) UNIQUE NOT NULL,
      description VARCHAR(300),
      image_url   TEXT,
      sort_order  INTEGER      DEFAULT 0,
      is_active   BOOLEAN      DEFAULT TRUE,
      created_at  TIMESTAMPTZ  DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
  console.log('  ✅ categories');

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id                SERIAL       PRIMARY KEY,
      name              VARCHAR(200) NOT NULL,
      sku               VARCHAR(60)  UNIQUE,
      description       TEXT         NOT NULL,
      short_description VARCHAR(300),
      category          VARCHAR(100) NOT NULL,
      price             NUMERIC(14,2),
      sale_price        NUMERIC(14,2),
      price_on_request  BOOLEAN      DEFAULT FALSE,
      images            TEXT[]       DEFAULT '{}',
      brand             VARCHAR(100),
      origin            VARCHAR(100),
      in_stock          BOOLEAN      DEFAULT TRUE,
      featured          BOOLEAN      DEFAULT FALSE,
      is_new            BOOLEAN      DEFAULT FALSE,
      best_seller       BOOLEAN      DEFAULT FALSE,
      tags              TEXT[]       DEFAULT '{}',
      specifications    JSONB        DEFAULT '[]',
      created_at        TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
  console.log('  ✅ products');

  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id             SERIAL       PRIMARY KEY,
      order_number   VARCHAR(30)  UNIQUE NOT NULL,
      user_id        INTEGER      REFERENCES users(id) ON DELETE SET NULL,
      total_amount   NUMERIC(14,2) DEFAULT 0,
      status         VARCHAR(30)  DEFAULT 'Pending'
                                  CHECK (status IN ('Pending','Confirmed','Processing','Shipped','Delivered','Cancelled')),
      payment_method VARCHAR(40)  DEFAULT 'Invoice',
      payment_status VARCHAR(20)  DEFAULT 'Unpaid'
                                  CHECK (payment_status IN ('Unpaid','Paid','Partial')),
      street         VARCHAR(200),
      city           VARCHAR(100),
      county         VARCHAR(80),
      country        VARCHAR(80)  DEFAULT 'Kenya',
      notes          TEXT,
      created_at     TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
  console.log('  ✅ orders');

  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id         SERIAL      PRIMARY KEY,
      order_id   INTEGER     REFERENCES orders(id)   ON DELETE CASCADE,
      product_id INTEGER     REFERENCES products(id) ON DELETE SET NULL,
      name       VARCHAR(200),
      quantity   INTEGER     NOT NULL DEFAULT 1,
      price      NUMERIC(14,2)
    );
  `);
  console.log('  ✅ order_items');

    await query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id           SERIAL      PRIMARY KEY,
        quote_number VARCHAR(30) UNIQUE NOT NULL,
        user_id      INTEGER     REFERENCES users(id) ON DELETE SET NULL,
        name         VARCHAR(150) NOT NULL,
        email        VARCHAR(150) NOT NULL,
        phone        VARCHAR(30)  NOT NULL,
        company      VARCHAR(150),
        county       VARCHAR(80),
        message      TEXT,
        status       VARCHAR(30)  DEFAULT 'New'
                                 CHECK (status IN ('New','Reviewed','Quoted','Accepted','Declined')),
        quoted_price  NUMERIC(14,2),
        response_message TEXT,
        admin_notes   TEXT,
        responded_at  TIMESTAMPTZ,
        updated_at    TIMESTAMPTZ DEFAULT NOW(),
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  console.log('  ✅ quotes');

  await query(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id           SERIAL      PRIMARY KEY,
      quote_id     INTEGER     REFERENCES quotes(id)   ON DELETE CASCADE,
      product_id   INTEGER     REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(200),
      quantity     INTEGER     DEFAULT 1,
      notes        TEXT
    );
  `);
  console.log('  ✅ quote_items');

  await query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         SERIAL      PRIMARY KEY,
      name       VARCHAR(150) NOT NULL,
      email      VARCHAR(150) NOT NULL,
      phone      VARCHAR(30),
      subject    VARCHAR(200),
      message    TEXT        NOT NULL,
      is_read    BOOLEAN     DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('  ✅ contact_messages');

  // Indexes
   const indexes = [
     'CREATE INDEX IF NOT EXISTS idx_categories_active     ON categories(is_active)',
     'CREATE INDEX IF NOT EXISTS idx_categories_sort       ON categories(sort_order)',
     'CREATE INDEX IF NOT EXISTS idx_products_category     ON products(category)',
     'CREATE INDEX IF NOT EXISTS idx_products_featured     ON products(featured)',
     'CREATE INDEX IF NOT EXISTS idx_products_in_stock     ON products(in_stock)',
     'CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON orders(user_id)',
     'CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status)',
     'CREATE INDEX IF NOT EXISTS idx_quotes_email          ON quotes(email)',
     'CREATE INDEX IF NOT EXISTS idx_contact_is_read       ON contact_messages(is_read)',
     'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash)',
     'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id  ON password_reset_tokens(user_id)',
   ];
  for (const idx of indexes) await query(idx);
  console.log('  ✅ indexes');

  console.log('\n✅ Schema ready.\n');
  console.log('Next: register at /register then promote to admin:');
  console.log("  UPDATE users SET role='admin' WHERE email='you@email.com';\n");
};

export { createTables };
