document.addEventListener('DOMContentLoaded', async () => {
  const pendingPapers = document.getElementById('pending-papers');
  const collegesList = document.getElementById('colleges-list');
  const importForm = document.getElementById('import-colleges-form');
  const fileInput = document.getElementById('colleges-file');
  const fileTrigger = document.getElementById('colleges-trigger');
  const fileName = document.getElementById('colleges-file-name');
  const importStatus = document.getElementById('import-status');

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

  async function loadColleges() {
    const res = await api('/admin/colleges');
    const list = res.colleges || [];
    collegesList.innerHTML = list.map(c => `
      <div class="item glass">
        <h4>${c.name}</h4>
        <div class="meta">${[c.university,c.city,c.state].filter(Boolean).join(' • ')}</div>
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

  if (fileTrigger) fileTrigger.addEventListener('click', () => fileInput.click());
  if (fileInput) fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : 'No file chosen';
  });

  if (importForm) importForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files || !fileInput.files[0]) return;
    const fd = new FormData();
    fd.append('file', fileInput.files[0]);
    importStatus.textContent = 'Importing...';
    const res = await fetch('/api/admin/colleges/import', { method: 'POST', headers: { Authorization: 'Bearer ' + token() }, body: fd });
    const data = await res.json();
    if (data.ok) {
      importStatus.textContent = `Imported ${data.imported}. Total: ${data.total}.`;
      await loadColleges();
    } else {
      importStatus.textContent = data.error || 'Failed';
    }
  });

  loadPendingPapers();
  loadColleges();
});
