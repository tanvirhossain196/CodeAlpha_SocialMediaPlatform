const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me-immediately-123456',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  cookieSecure: String(process.env.COOKIE_SECURE).toLowerCase() === 'true'
};

if (!env.databaseUrl) {
  console.warn('[Connectly] DATABASE_URL is not set. Copy .env.example to .env before running database features.');
}
if (env.nodeEnv === 'production' && env.jwtSecret.includes('development-only')) {
  throw new Error('JWT_SECRET must be configured in production.');
}

module.exports = env;
