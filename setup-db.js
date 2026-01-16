const { Pool } = require('pg');
const fs = require('fs');

const DATABASE_URL = 'postgresql://neondb_owner:npg_xBr10miCfDSq@ep-plain-meadow-ahqz5226-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function setupDatabase() {
  try {
    const schema = fs.readFileSync('database/schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Database tables created successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
