document.addEventListener('DOMContentLoaded', async () => {
  const paperDetails = document.getElementById('paper-details');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const adminLink = document.getElementById('admin-link');

  const urlParams = new URLSearchParams(window.location.search);
  const paperId = urlParams.get('id');

  function token() { return localStorage.getItem('token') || ''; }

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, { ...opts, headers: { Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
    return res.json();
  }

  async function loadPaper() {
    const { paper } = await api(`/papers/${paperId}`);
    paperDetails.innerHTML = `
      <h2>${paper.title}</h2>
      <div class="meta">${new Date(paper.createdAt).toLocaleDateString()} • ${paper.tags.map(t => `<span class='badge'>${t}</span>`).join(' ')}</div>
      <p>${paper.abstract}</p>
      <div class="row">
        <a class="btn ghost" href="/api/papers/${paper.id}/download">Download</a>
      </div>
    `;
  }

  async function loadChat() {
    const { messages } = await api(`/chat/${paperId}`);
    chatMessages.innerHTML = messages.map(msg => `<div class="msg"><b>${msg.user.name}:</b> ${msg.text}</div>`).join('');
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value;
    if (!text) return;
    await api(`/chat/${paperId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    chatInput.value = '';
    loadChat();
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

  loadPaper();
  loadChat();
  checkAdmin();
});
