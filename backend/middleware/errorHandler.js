module.exports = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err.message || err);
  const status = err.status || 500;
  
  // Prevent leaking internal SQL/driver error strings
  const isClientError = status >= 400 && status < 500;
  const safeMessage = isClientError 
    ? err.message 
    : (process.env.NODE_ENV === 'development' ? err.message : 'Une erreur interne est survenue sur le serveur.');

  res.status(status).json({
    status,
    error: safeMessage,
    message: safeMessage
  });
};