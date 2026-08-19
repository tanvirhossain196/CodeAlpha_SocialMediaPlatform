const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { validateRegistration, clean } = require('../utils/validators');
const { signToken, authCookieOptions } = require('../utils/jwt');

function publicUser(row) {
  return {
    id: Number(row.id), fullName: row.full_name, username: row.username, email: row.email,
    bio: row.bio, avatarUrl: row.avatar_url, createdAt: row.created_at
  };
}

async function register(req, res, next) {
  try {
    const { errors, data } = validateRegistration(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
    const duplicate = await db.query('SELECT username,email FROM users WHERE username=$1 OR email=$2 LIMIT 1', [data.username, data.email]);
    if (duplicate.rowCount) {
      const errors = {};
      if (duplicate.rows[0].username === data.username) errors.username = 'That username is already taken.';
      if (duplicate.rows[0].email === data.email) errors.email = 'That email is already registered.';
      return res.status(409).json({ message: 'Account already exists.', errors });
    }
    const hash = await bcrypt.hash(data.password, 12);
    const result = await db.query(
      `INSERT INTO users(full_name,username,email,password_hash) VALUES($1,$2,$3,$4)
       RETURNING id,full_name,username,email,bio,avatar_url,created_at`,
      [data.fullName, data.username, data.email, hash]
    );
    const user = publicUser(result.rows[0]);
    res.cookie('connectly_token', signToken(user), authCookieOptions());
    res.status(201).json({ message: 'Welcome to Connectly!', user });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const identity = clean(req.body.identity, 120).toLowerCase();
    const password = String(req.body.password || '');
    if (!identity || !password) return res.status(400).json({ message: 'Email/username and password are required.' });
    const result = await db.query('SELECT * FROM users WHERE lower(email)=$1 OR lower(username)=$1 LIMIT 1', [identity]);
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) return res.status(401).json({ message: 'Invalid login credentials.' });
    const user = publicUser(row);
    const options = authCookieOptions();
    if (!req.body.remember) options.maxAge = 12 * 60 * 60 * 1000;
    res.cookie('connectly_token', signToken(user), options);
    res.json({ message: `Welcome back, ${user.fullName.split(' ')[0]}!`, user });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const result = await db.query('SELECT id,full_name,username,email,bio,avatar_url,created_at FROM users WHERE id=$1', [req.user.id]);
    if (!result.rowCount) return res.status(401).json({ message: 'Session is no longer valid.' });
    res.json({ user: publicUser(result.rows[0]) });
  } catch (err) { next(err); }
}

function logout(_req, res) {
  res.clearCookie('connectly_token', { path: '/' });
  res.json({ message: 'Logged out successfully.' });
}

module.exports = { register, login, me, logout };
