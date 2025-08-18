document.addEventListener('DOMContentLoaded', async () => {
  const pendingPapers = document.getElementById('pending-papers');

  function token() { return localStorage.getItem('token') || ''; }

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, { ...opts, headers: { Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
    return res.json();
  }

  async function loadPendingPapers() {
    const { pending } = await api('/papers/admin/pending/list');
    pendingPapers.innerHTML = pending.map(p => `
      <div class="item glass">
        <h4>${p.title}</h4>
        <div class="meta">${new Date(p.createdAt).toLocaleDateString()}</div>
        <p>${p.abstract}</p>
        <div class="row">
          <button class="btn" onclick="approvePaper('${p.id}')">Approve</button>
          <button class="btn ghost" onclick="rejectPaper('${p.id}')">Reject</button>
        </div>
      </div>
    `).join('');
  }

  window.approvePaper = async (id) => {
    await api(`/papers/admin/${id}/approve`, { method: 'POST' });
    loadPendingPapers();
  };

  window.rejectPaper = async (id) => {
    await api(`/papers/admin/${id}/reject`, { method: 'POST' });
    loadPendingPapers();
  };
  
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });

  loadPendingPapers();
});
