const { verifyToken } = require('../utils/jwt');

function extractToken(req) {
  if (req.cookies?.connectly_token) return req.cookies.connectly_token;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyToken(token);
      req.user = { id: Number(payload.sub), username: payload.username };
    }
  } catch (_) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
    next();
  });
}

module.exports = { requireAuth, optionalAuth };
