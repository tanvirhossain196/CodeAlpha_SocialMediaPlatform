const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);

function validateRegistration(body) {
  const fullName = clean(body.fullName, 80);
  const username = clean(body.username, 24).toLowerCase();
  const email = clean(body.email, 120).toLowerCase();
  const password = String(body.password || '');
  const errors = {};
  if (fullName.length < 2) errors.fullName = 'Full name must be at least 2 characters.';
  if (!USERNAME_RE.test(username)) errors.username = 'Use 3-24 letters, numbers, or underscores.';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) errors.password = 'Password needs at least one uppercase letter and one number.';
  return { errors, data: { fullName, username, email, password } };
}

function validateProfile(body) {
  const fullName = clean(body.fullName, 80);
  const username = clean(body.username, 24).toLowerCase();
  const bio = clean(body.bio, 180);
  const errors = {};
  if (fullName.length < 2) errors.fullName = 'Full name must be at least 2 characters.';
  if (!USERNAME_RE.test(username)) errors.username = 'Use 3-24 letters, numbers, or underscores.';
  return { errors, data: { fullName, username, bio } };
}

module.exports = { clean, validateRegistration, validateProfile, EMAIL_RE, USERNAME_RE };
