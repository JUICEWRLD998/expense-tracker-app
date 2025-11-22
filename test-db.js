const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker'
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });
