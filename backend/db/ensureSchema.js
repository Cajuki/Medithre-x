import { createTables } from './init.js';

const ensureSchema = async () => {
  try {
    await createTables();
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
