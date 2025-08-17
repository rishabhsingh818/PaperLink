import { Router } from 'express';
import { db } from '../index.js';
import { requireAdmin } from '../utils/auth.js';

const r = Router();

r.get('/stats', requireAdmin, (_req, res) => {
  res.json({ users: db.users.length, papers: db.papers.length, pending: db.approvals.length });
});

r.get('/export', requireAdmin, (_req, res) => {
  const rows = db.papers.map(p => ({ id: p.id, title: p.title, tags: p.tags.join('|'), createdAt: p.createdAt }));
  const header = 'id,title,tags,createdAt\n';
  const csv = header + rows.map(r => `${r.id},"${r.title}","${r.tags}",${r.createdAt}`).join('\n');
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename="papers.csv"');
  res.send(csv);
});

// Verify colleges/users simplistic flow
r.get('/verifications', requireAdmin, (_req, res) => {
  const pending = db.users.filter(u => u.role === 'user' && !u.verified);
  res.json({ pending });
});

r.post('/verify/:id', requireAdmin, (req, res) => {
  const u = db.users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  u.verified = true;
  db.notifications.push({ id: Date.now()+'' , to: u.id, text: 'Your account has been verified by admin.', at: Date.now() });
  res.json({ ok: true });
});

export default r;
