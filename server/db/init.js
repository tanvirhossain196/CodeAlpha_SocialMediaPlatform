const fs = require('fs');
const path = require('path');
const db = require('../config/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.query(sql);
    console.log('✅ Connectly database schema initialized.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();
