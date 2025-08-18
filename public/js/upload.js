document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const adminLink = document.getElementById('admin-link');
  const semesterSelect = document.getElementById('semester');
  const fileInput = document.getElementById('file');
  const fileTrigger = document.getElementById('file-trigger');
  const fileName = document.getElementById('file-name');

  function token() { return localStorage.getItem('token') || ''; }

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, { ...opts, headers: { Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
    return res.json();
  }

  function fillSemestersForYear(year) {
    const map = {
      1: ['1', '2'],
      2: ['3', '4'],
      3: ['5', '6'],
      4: ['7', '8']
    };
    const opts = map[Number(year)] || [];
  semesterSelect.innerHTML = '<option value="" disabled selected>Semester</option>' + opts.map(s => `<option value="${s}">${s}${s==='1'?'st':s==='2'?'nd':s==='3'?'rd':'th'} Semester</option>`).join('');
  }

  // Themed file picker interactions
  fileTrigger.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      fileName.textContent = fileInput.files[0].name;
  document.querySelector('.filepicker')?.classList.remove('error');
    } else {
      fileName.textContent = 'No file chosen';
    }
  });

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files || !fileInput.files[0]) {
      document.querySelector('.filepicker')?.classList.add('error');
      fileName.textContent = 'Please choose a file';
      return;
    }
  const formData = new FormData();
  formData.append('subject', document.getElementById('subject').value);
  formData.append('semester', document.getElementById('semester').value);
  formData.append('exam', document.getElementById('exam').value);
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
    if (user && user.year) {
      fillSemestersForYear(user.year);
    }
  }

  checkAdmin();
});
