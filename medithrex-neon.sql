-- =============================================================================
--  MEDITHREX — PostgreSQL Schema v3
--  Clean empty schema — no data inserted
--
--  HOW TO RUN ON NEON
--  1. console.neon.tech → your project → SQL Editor
--  2. Paste this file → Run
--
--  HOW TO RUN LOCALLY
--  psql -U postgres -c "CREATE DATABASE medithrex;"
--  psql -U postgres -d medithrex -f medithrex-neon.sql
-- =============================================================================

-- Uncomment to wipe and rebuild:
-- DROP TABLE IF EXISTS contact_messages,quote_items,quotes,order_items,orders,products,categories,users CASCADE;


-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL       PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    phone      VARCHAR(30),
    company    VARCHAR(150),
    county     VARCHAR(80),
    country    VARCHAR(80)  DEFAULT 'Kenya',
    password   TEXT         NOT NULL,       -- bcrypt hash (cost 10)
    role       VARCHAR(20)  DEFAULT 'user'
                            CHECK (role IN ('user','admin')),
    created_at TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON COLUMN users.role     IS 'user = customer | admin = full dashboard access';
COMMENT ON COLUMN users.password IS 'bcrypt hash — never plain text';


-- =============================================================================
-- 2. CATEGORIES
--    Admin-managed categories shown on the homepage and used to group products.
--    image_url stores a single Cloudinary URL uploaded by the admin.
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL        PRIMARY KEY,
    name        VARCHAR(100)  UNIQUE NOT NULL,
    description VARCHAR(300),

    -- Single Cloudinary cover image uploaded by admin
    -- e.g. https://res.cloudinary.com/cloud_name/image/upload/v.../category.jpg
    image_url   TEXT,

    sort_order  INTEGER       DEFAULT 0,     -- lower = appears first on homepage
    is_active   BOOLEAN       DEFAULT TRUE,  -- FALSE = hidden from users
    created_at  TIMESTAMPTZ   DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   DEFAULT NOW()
);

COMMENT ON TABLE  categories           IS 'Admin-managed product categories shown on the homepage';
COMMENT ON COLUMN categories.image_url IS 'Single Cloudinary HTTPS URL for the category cover image';
COMMENT ON COLUMN categories.is_active IS 'FALSE hides the category from all public-facing pages';
COMMENT ON COLUMN categories.sort_order IS 'Controls display order; lower numbers appear first';


-- =============================================================================
-- 3. PRODUCTS
--    images stores up to 10 Cloudinary URLs as a PostgreSQL text array.
--    category references categories.name (soft FK — allows flexible naming).
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
    id                SERIAL        PRIMARY KEY,
    name              VARCHAR(200)  NOT NULL,
    sku               VARCHAR(60)   UNIQUE,
    description       TEXT          NOT NULL,
    short_description VARCHAR(300),

    -- Links to categories.name — admin picks from active categories when adding a product
    category          VARCHAR(100)  NOT NULL,

    price             NUMERIC(14,2),          -- NULL when price_on_request = TRUE
    price_on_request  BOOLEAN       DEFAULT FALSE,

    -- Up to 10 Cloudinary image URLs. First element = cover / primary image.
    -- Application enforces max 10 via multer (files: 10).
    images            TEXT[]        DEFAULT '{}',

    brand             VARCHAR(100),
    origin            VARCHAR(100),
    in_stock          BOOLEAN       DEFAULT TRUE,
    featured          BOOLEAN       DEFAULT FALSE,
    tags              TEXT[]        DEFAULT '{}',

    -- JSON array of spec key/value pairs: [{"key":"Throughput","value":"60 samples/hr"}]
    specifications    JSONB         DEFAULT '[]',

    created_at        TIMESTAMPTZ   DEFAULT NOW()
);

COMMENT ON COLUMN products.images        IS 'Array of up to 10 Cloudinary image URLs. First = cover photo.';
COMMENT ON COLUMN products.category      IS 'Must match a name in the categories table';
COMMENT ON COLUMN products.specifications IS 'JSON: [{"key":"...","value":"..."}]';


-- =============================================================================
-- 4. ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id             SERIAL        PRIMARY KEY,
    order_number   VARCHAR(30)   UNIQUE NOT NULL,
    user_id        INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    total_amount   NUMERIC(14,2) DEFAULT 0,
    status         VARCHAR(30)   DEFAULT 'Pending'
                                 CHECK (status IN (
                                     'Pending','Confirmed','Processing',
                                     'Shipped','Delivered','Cancelled'
                                 )),
    payment_method VARCHAR(40)   DEFAULT 'Invoice',
    payment_status VARCHAR(20)   DEFAULT 'Unpaid'
                                 CHECK (payment_status IN ('Unpaid','Paid','Partial')),
    street         VARCHAR(200),
    city           VARCHAR(100),
    county         VARCHAR(80),
    country        VARCHAR(80)   DEFAULT 'Kenya',
    notes          TEXT,
    created_at     TIMESTAMPTZ   DEFAULT NOW()
);


-- =============================================================================
-- 5. ORDER ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL        PRIMARY KEY,
    order_id   INTEGER       REFERENCES orders(id)   ON DELETE CASCADE,
    product_id INTEGER       REFERENCES products(id) ON DELETE SET NULL,
    name       VARCHAR(200),           -- snapshot of product name at order time
    quantity   INTEGER       NOT NULL  DEFAULT 1,
    price      NUMERIC(14,2)           -- unit price snapshot at order time
);


-- =============================================================================
-- 6. QUOTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS quotes (
    id           SERIAL        PRIMARY KEY,
    quote_number VARCHAR(30)   UNIQUE NOT NULL,
    user_id      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    name         VARCHAR(150)  NOT NULL,
    email        VARCHAR(150)  NOT NULL,
    phone        VARCHAR(30)   NOT NULL,
    company      VARCHAR(150),
    county       VARCHAR(80),
    message      TEXT,
    status       VARCHAR(30)   DEFAULT 'New'
                               CHECK (status IN (
                                   'New','Reviewed','Quoted','Accepted','Declined'
                               )),
    quoted_price  NUMERIC(14,2),
    response_message TEXT,
    admin_notes   TEXT,
    responded_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);


-- =============================================================================
-- 7. QUOTE ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS quote_items (
    id           SERIAL       PRIMARY KEY,
    quote_id     INTEGER      REFERENCES quotes(id)   ON DELETE CASCADE,
    product_id   INTEGER      REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200),
    quantity     INTEGER      DEFAULT 1,
    notes        TEXT
);


-- =============================================================================
-- 8. CONTACT MESSAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL        PRIMARY KEY,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(150)  NOT NULL,
    phone      VARCHAR(30),
    subject    VARCHAR(200),
    message    TEXT          NOT NULL,
    is_read    BOOLEAN       DEFAULT FALSE,
    created_at TIMESTAMPTZ   DEFAULT NOW()
);


-- =============================================================================
-- 9. INDEXES
-- =============================================================================

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_is_active  ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock    ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_sku         ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at  ON products(created_at DESC);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role           ON users(role);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Quotes
CREATE INDEX IF NOT EXISTS idx_quotes_email         ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id       ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status        ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at    ON quotes(created_at DESC);

-- Quote items
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

-- Contact messages
CREATE INDEX IF NOT EXISTS idx_contact_is_read      ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_created_at   ON contact_messages(created_at DESC);


-- =============================================================================
-- 10. VERIFY — all row counts should be 0 on a fresh install
-- =============================================================================
SELECT
    'users'            AS "Table", COUNT(*) AS "Rows" FROM users            UNION ALL
SELECT 'categories',                                    COUNT(*) FROM categories UNION ALL
SELECT 'products',                                      COUNT(*) FROM products   UNION ALL
SELECT 'orders',                                        COUNT(*) FROM orders     UNION ALL
SELECT 'order_items',                                   COUNT(*) FROM order_items UNION ALL
SELECT 'quotes',                                        COUNT(*) FROM quotes     UNION ALL
SELECT 'quote_items',                                   COUNT(*) FROM quote_items UNION ALL
SELECT 'contact_messages',                              COUNT(*) FROM contact_messages
ORDER BY "Table";


-- =============================================================================
-- 11. QUICK REFERENCE AFTER FIRST DEPLOY
-- =============================================================================

-- Promote first registered user to admin:
--   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';

-- Inspect category images:
--   SELECT id, name, is_active, sort_order, image_url FROM categories ORDER BY sort_order;

-- Inspect product images:
--   SELECT id, name, array_length(images,1) AS image_count FROM products;

-- Remove a specific image from a product:
--   UPDATE products SET images = array_remove(images,'https://...url...') WHERE id = 1;

-- Toggle a category active/inactive:
--   UPDATE categories SET is_active = NOT is_active WHERE id = 1;

-- Reorder categories on homepage:
--   UPDATE categories SET sort_order = 1 WHERE name = 'Laboratory Equipment';
--   UPDATE categories SET sort_order = 2 WHERE name = 'Diagnostic Equipment';

-- =============================================================================
-- END
-- =============================================================================
