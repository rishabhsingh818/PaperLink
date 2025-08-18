import { Router } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { db } from '../index.js';
import { requireAuth, requireAdmin } from '../utils/auth.js';

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Create paper (goes to approval queue)
r.post('/', requireAuth, upload.single('file'), (req, res) => {
  const { subject, semester, exam, title, abstract, tags } = req.body;
  // Normalize: support new fields; keep legacy fields if provided
  const derivedTitle = title || [subject, exam, semester ? `Sem ${semester}` : ''].filter(Boolean).join(' • ');
  const derivedAbstract = abstract || `Subject: ${subject || ''} | Exam: ${exam || ''} | Semester: ${semester || ''}`.trim();
  const parsedTags = tags ? (tags || '').split(',').map(t => t.trim()).filter(Boolean) : [];
  const paper = {
    id: nanoid(),
    title: derivedTitle,
    abstract: derivedAbstract,
    subject: subject || null,
    semester: semester || null,
    exam: exam || null,
    tags: parsedTags,
    authorId: req.user.id,
    status: 'pending',
    fileName: req.file?.originalname || null,
    file: req.file ? Buffer.from(req.file.buffer).toString('base64') : null,
    createdAt: Date.now(),
    ratings: [],
    reviews: []
  };
  db.approvals.push(paper);
  res.json({ ok: true, paper });
});

// List approved papers with search & filter
r.get('/', (req, res) => {
  const { q, tag, sort } = req.query;
  let papers = db.papers.slice();
  if (q) {
    const s = q.toLowerCase();
    papers = papers.filter(p => p.title.toLowerCase().includes(s) || p.abstract.toLowerCase().includes(s));
  }
  if (tag) papers = papers.filter(p => p.tags.includes(tag));
  if (sort === 'rating') papers.sort((a,b)=>avg(a)-avg(b)).reverse();
  if (sort === 'new') papers.sort((a,b)=>b.createdAt-a.createdAt);
  res.json({ papers });
});

function avg(p){
  if (!p.ratings.length) return 0; return p.ratings.reduce((a,b)=>a+b,0)/p.ratings.length;
}

// Get one
r.get('/:id', (req, res) => {
  const p = db.papers.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ paper: p });
});

// Download raw file (base64 -> binary)
r.get('/:id/download', (req, res) => {
  const p = db.papers.find(x => x.id === req.params.id);
  if (!p || !p.file) return res.status(404).send('File not found');
  const buf = Buffer.from(p.file, 'base64');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${p.fileName||'paper'}.pdf"`);
  res.send(buf);
});

// Rate / Review
r.post('/:id/rate', requireAuth, (req, res) => {
  const p = db.papers.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { rating = 5, review } = req.body;
  p.ratings.push(Math.max(1, Math.min(5, Number(rating))));
  if (review) p.reviews.push({ id: nanoid(), by: req.user.id, text: review, at: Date.now() });
  res.json({ ok: true, paper: p });
});

// Admin approvals
r.get('/admin/pending/list', requireAdmin, (req, res) => {
  res.json({ pending: db.approvals });
});

r.post('/admin/:id/approve', requireAdmin, (req, res) => {
  const idx = db.approvals.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const p = db.approvals.splice(idx, 1)[0];
  p.status = 'approved';
  db.papers.push(p);
  res.json({ ok: true, paper: p });
});

r.post('/admin/:id/reject', requireAdmin, (req, res) => {
  const idx = db.approvals.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const p = db.approvals.splice(idx, 1)[0];
  p.status = 'rejected';
  res.json({ ok: true, paper: p });
});

export default r;
