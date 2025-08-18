(() => {
  const protectedSet = new Set(['/dashboard.html', '/upload.html', '/paper.html', '/admin.html']);
  const path = window.location.pathname;
  if (!protectedSet.has(path)) return;

  const token = localStorage.getItem('token');
  if (!token) {
    const next = encodeURIComponent(path + window.location.search);
    window.location.replace('/login.html?next=' + next);
    return;
  }

  // Validate token and (for admin page) role
  fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
    .then(res => {
      if (!res.ok) throw new Error('unauthorized');
      return res.json();
    })
    .then(user => {
      if (path === '/admin.html' && user.role !== 'admin') {
        window.location.replace('/dashboard.html');
      }
    })
    .catch(() => {
      localStorage.removeItem('token');
      const next = encodeURIComponent(path + window.location.search);
      window.location.replace('/login.html?next=' + next);
    });
})();
