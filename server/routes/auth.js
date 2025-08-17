import { Router } from 'express';
import { createUser, sign } from '../utils/auth.js';
import { db } from '../index.js';

const r = Router();

r.post('/signup', (req, res) => {
  const { name, email, password, college } = req.body;
  try {
    const user = createUser({ name, email, password, college });
    const token = sign(user);
    res.json({ token, user: { id: user.id, name, email, role: user.role } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

r.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = sign(user);
  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

export default r;
