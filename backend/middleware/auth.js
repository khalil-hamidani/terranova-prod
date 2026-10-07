const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('[SECURITY WARNING] JWT_SECRET is missing or too short (< 32 chars). Please set a strong JWT_SECRET in .env');
}

const EFFECTIVE_SECRET = JWT_SECRET || 'terranova_secure_fallback_key_2026_super_strong_min32chars';

exports.generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    EFFECTIVE_SECRET,
    { expiresIn: '12h', algorithm: 'HS256' }
  );
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Format du jeton d\'authentification invalide ou manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, EFFECTIVE_SECRET, { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Jeton invalide ou expiré' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
};

exports.isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès Super Administrateur requis' });
  }
  next();
};

