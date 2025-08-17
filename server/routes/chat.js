import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../index.js';
import { requireAuth } from '../utils/auth.js';

const r = Router();

r.get('/:paperId', requireAuth, (req, res) => {
  const messages = db.chats.filter(c => c.paperId === req.params.paperId);
  res.json({ messages });
});

r.post('/:paperId', requireAuth, (req, res) => {
  const msg = { id: nanoid(), paperId: req.params.paperId, userId: req.user.id, text: req.body.text, at: Date.now() };
  db.chats.push(msg);
  db.notifications.push({ id: nanoid(), to: 'all', text: `New comment on paper ${req.params.paperId}`, at: Date.now() });
  res.json({ ok: true, message: msg });
});

export default r;
