document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const adminLink = document.getElementById('admin-link');

  function token() { return localStorage.getItem('token') || ''; }

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, { ...opts, headers: { Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
    return res.json();
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('abstract', document.getElementById('abstract').value);
    formData.append('tags', document.getElementById('tags').value);
    formData.append('file', document.getElementById('file').files[0]);

    const res = await fetch('/api/papers', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token() },
      body: formData,
    });

    const data = await res.json();
    if (data.ok) {
      alert('Paper submitted for approval!');
      window.location.href = '/dashboard.html';
    } else {
      alert(data.error);
    }
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

  checkAdmin();
});
