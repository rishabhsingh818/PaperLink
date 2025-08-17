import { Router } from 'express';
import { db } from '../index.js';
import { requireAuth } from '../utils/auth.js';

const r = Router();

r.get('/', requireAuth, (req, res) => {
  const list = db.notifications.filter(n => n.to === 'all' || n.to === req.user.id).slice(-50);
  res.json({ notifications: list });
});

export default r;
