function notFound(req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API endpoint not found.' });
  return res.status(404).sendFile('404.html', { root: require('path').join(process.cwd(), 'client') });
}

function errorHandler(err, _req, res, _next) {
  console.error('[Connectly Error]', err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image must be 5 MB or smaller.' });
  if (err.message === 'Only image files are allowed.') return res.status(400).json({ message: err.message });
  const status = Number(err.status || 500);
  const message = status >= 500 ? 'Something went wrong on the server.' : err.message;
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
