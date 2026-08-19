const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  };
}

module.exports = { signToken, verifyToken, authCookieOptions };
