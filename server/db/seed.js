const bcrypt = require('bcryptjs');
const db = require('../config/db');

(async () => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash('Connectly123', 12);
    const people = [
      ['Ariana Morgan','ariana','ariana@example.com','Product designer · coffee enthusiast · building in public ☕'],
      ['Daniel Kim','daniel','daniel@example.com','Software engineer exploring thoughtful products and clean code.'],
      ['Nadia Rahman','nadia','nadia@example.com','Visual storyteller, photographer, and weekend traveler.']
    ];
    const ids = [];
    for (const p of people) {
      const result = await client.query(
        `INSERT INTO users(full_name,username,email,password_hash,bio)
         VALUES($1,$2,$3,$4,$5)
         ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name
         RETURNING id`, [p[0],p[1],p[2],passwordHash,p[3]]
      );
      ids.push(result.rows[0].id);
    }
    const existing = await client.query('SELECT COUNT(*)::int AS count FROM posts');
    if (existing.rows[0].count === 0) {
      await client.query('INSERT INTO posts(user_id, content) VALUES ($1,$2),($3,$4),($5,$6)', [
        ids[0], 'Small improvements compound. Today I refined a design system and the whole product suddenly feels more coherent ✨',
        ids[1], 'Just shipped a cleaner API layer with better validation. Reliable software is mostly thoughtful details.',
        ids[2], 'Golden hour, a quiet street, and a camera. Sometimes the best reset is simply going outside.'
      ]);
    }
    await client.query('COMMIT');
    console.log('✅ Demo users seeded. Login: ariana@example.com / Connectly123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
})();
