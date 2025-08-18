document.addEventListener('DOMContentLoaded', async () => {
  const pendingPapers = document.getElementById('pending-papers');

  function token() { return localStorage.getItem('token') || ''; }

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, { ...opts, headers: { Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
    return res.json();
  }

  async function loadPendingPapers() {
    const { pending } = await api('/papers/admin/pending/list');
    if (!pending || pending.length === 0) {
      pendingPapers.innerHTML = `
        <div class="card glass reveal" style="padding:22px;">
          <h4 style="margin:0 0 6px 0;">All caught up</h4>
          <div class="meta">No pending approvals.</div>
        </div>
      `;
      return;
    }

    pendingPapers.innerHTML = pending.map(p => {
      const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
      const subject = p.subject || '';
      const exam = p.exam || '';
      const sem = p.semester || p.sem || '';
      const badges = [
        subject && `<span class=\"badge\">${subject}</span>`,
        exam && `<span class=\"badge\">${exam}</span>`,
        sem && `<span class=\"badge\">Sem ${sem}</span>`
      ].filter(Boolean).join(' ');

      return `
      <div class="card glass reveal item">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;">
          <h4 style="margin:0;">${p.title || 'Pending Paper'}</h4>
          <div class="meta">${date}</div>
        </div>
        <div style="margin:10px 0 12px; display:flex; flex-wrap:wrap; gap:8px;">${badges}</div>
        <p style="margin:0 0 12px 0; color: var(--muted);">${p.abstract || ''}</p>
        <div class="row" style="gap:10px;">
          <button class="btn btn-light" onclick="approvePaper('${p.id}')">Approve</button>
          <button class="btn ghost" onclick="rejectPaper('${p.id}')">Reject</button>
        </div>
      </div>`;
    }).join('');
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
