import jwt from 'jsonwebtoken';

const decodeToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'medithrex_secret_2024');

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    req.user = decodeToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
};

export const optionalProtect = (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    req.user = decodeToken(token);
  } catch {
    req.user = null;
  }
  next();
};

export const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};
