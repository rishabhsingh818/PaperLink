import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import paperRoutes from './routes/papers.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import notifRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/', express.static(path.join(__dirname, '../public')));

// In-memory stores (replace with DB later)
export const db = {
  users: [],
  papers: [],
  chats: [],
  notifications: [],
  colleges: [],
  approvals: []
};

// seed default admin for demo (as requested)
if (!db.users.find(u => u.email === 'admin@paper.com')) {
  db.users.push({ id: 'admin-1', name: 'Admin', email: 'admin@paper.com', password: 'Admin@123', role: 'admin', college: 'PaperLink HQ', createdAt: Date.now(), verified: true });
}

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notifRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PaperLink server running on http://localhost:${PORT}`));
