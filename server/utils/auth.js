import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { db } from '../index.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
}

export function verify(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  const payload = token ? verify(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.users.find(u => u.id === payload.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}

export function createUser({ name, email, password, college }) {
  const exists = db.users.find(u => u.email === email);
  if (exists) throw new Error('Email already registered');
  const user = { id: nanoid(), name, email, password, college, role: 'user', createdAt: Date.now() };
  db.users.push(user);
  return user;
}
