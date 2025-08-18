function token() { return localStorage.getItem('token') || ''; }

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, { ...opts, headers: { Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
  return res.json();
}

const q = document.getElementById('q');
const tag = document.getElementById('tag');
const sort = document.getElementById('sort');
const results = document.getElementById('results');
const adminLink = document.getElementById('admin-link');
let isAdmin = false;

async function load() {
  const params = new URLSearchParams({ q: q.value, tag: tag.value, sort: sort.value });
  const data = await api('/papers?' + params.toString());
  const tags = new Set();
  const approvedOnly = (data.papers || []).filter(p => !p.status || p.status === 'approved');
  results.innerHTML = approvedOnly.map(p => {
    (p.tags || []).forEach(t => tags.add(t));
  const adminControls = isAdmin ? `<button class='btn btn-danger btn-sm' data-del='${p.id}' aria-label='Delete paper'>Delete</button>` : '';
  const displayTitle = [p.subject, p.exam, p.semester ? `Sem ${p.semester}` : ''].filter(Boolean).join(' • ') || p.title;
  return `<div class="item glass"><h4><a class="item-title" href="/paper.html?id=${p.id}">${displayTitle}</a></h4>
    <div class="meta">${new Date(p.createdAt).toLocaleDateString()} • ${p.tags.map(t => `<span class='badge'>${t}</span>`).join(' ')}</div>
    <p>${p.abstract}</p>
  <div class="row"><a class="btn ghost" href="/api/papers/${p.id}/download">Download</a>
  <a class="btn" href="/paper.html?id=${p.id}">Discuss</a> ${adminControls}</div></div>`;
  }).join('');
  // Wire delete buttons (admin only)
  if (isAdmin) {
    results.querySelectorAll('[data-del]')?.forEach(btn => btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-del');
      if (!confirm('Delete this paper?')) return;
      const resp = await api('/papers/admin/' + id + '/reject', { method: 'POST' });
      load();
    }));
  }
  tag.innerHTML = '<option value="">All tags</option>' + Array.from(tags).map(t => `<option>${t}</option>`).join('');
}

['runSearch', 'q', 'tag', 'sort'].forEach(id => {
  const el = id === 'runSearch' ? document.getElementById(id) : (id === 'q' ? q : id === 'tag' ? tag : sort);
  el?.addEventListener(id === 'runSearch' ? 'click' : 'change', load);
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

async function checkAdmin() {
    const user = await api('/auth/me');
  isAdmin = !!(user && user.role === 'admin');
  if (isAdmin) adminLink.style.display = 'inline';
}

load();
checkAdmin();

// lightweight notifications toasts
const toasts = document.getElementById('toasts');
async function poll() {
  if (!token()) return;
  const d = await api('/notifications');
  let hasNewPaper = false;
  (d.notifications || []).slice(-3).forEach(n => {
    const el = document.createElement('div');
    el.className = 'glass item';
    el.style.position = 'fixed';
    el.style.right = '16px';
    el.style.bottom = (16 + Math.random() * 60) + 'px';
    el.style.maxWidth = '320px';
    el.style.zIndex = '50';
    el.innerHTML = `<div class='meta'>${new Date(n.at).toLocaleTimeString()}</div><div>${n.text}</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
    if (/new paper approved/i.test(n.text || '')) hasNewPaper = true;
  });
  if (hasNewPaper) {
    // Refresh dashboard list to include newly approved items
    load();
  }
}
setInterval(poll, 8000);
