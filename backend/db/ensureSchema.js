import { createTables } from './init.js';
import { query } from './pool.js';

const ensureSchema = async () => {
  try {
    await createTables();
    await query(
      `UPDATE users
       SET email = $1
       WHERE email = $2
         AND role = 'admin'
         AND NOT EXISTS (SELECT 1 FROM users WHERE email = $1)`,
      ['medithrexmedicalsolutions@gmail.com', 'admin@medithrex.co.ke']
    );
    console.log('✅ Database schema ensured');
  } catch (err) {
    // Tables may already exist, which is fine
    if (err.message.includes('already exists')) {
      console.log('✅ Database schema already exists');
    } else {
      throw err;
    }
  }
};

export default ensureSchema;
