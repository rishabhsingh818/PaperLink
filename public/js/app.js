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

async function load() {
  const params = new URLSearchParams({ q: q.value, tag: tag.value, sort: sort.value });
  const data = await api('/papers?' + params.toString());
  const tags = new Set();
  results.innerHTML = (data.papers || []).map(p => {
    (p.tags || []).forEach(t => tags.add(t));
    return `<div class="item glass"><h4><a href="/paper.html?id=${p.id}">${p.title}</a></h4>
    <div class="meta">${new Date(p.createdAt).toLocaleDateString()} • ${p.tags.map(t => `<span class='badge'>${t}</span>`).join(' ')}</div>
    <p>${p.abstract}</p>
    <div class="row"><a class="btn ghost" href="/api/papers/${p.id}/download">Download</a>
    <a class="btn" href="/paper.html?id=${p.id}">Discuss</a></div></div>`;
  }).join('');
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
    if (user && user.role === 'admin') {
        adminLink.style.display = 'inline';
    }
}

load();
checkAdmin();

// lightweight notifications toasts
const toasts = document.getElementById('toasts');
async function poll() {
  if (!token()) return;
  const d = await api('/notifications');
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
  });
}
setInterval(poll, 8000);
