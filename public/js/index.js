document.addEventListener('DOMContentLoaded', () => {
  const openAppBtn = document.getElementById('open-app-btn');
  const brandLink = document.getElementById('brand-link');

  const handleAuthRedirect = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard.html';
    } else {
      window.location.href = '/login.html';
    }
  };

  if (openAppBtn) {
    openAppBtn.addEventListener('click', handleAuthRedirect);
  }

  if (brandLink) {
    brandLink.addEventListener('click', handleAuthRedirect);
  }
});
