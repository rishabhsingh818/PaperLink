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

  // Overwrite previous logic: always show all 1–8 semesters
  function fillSemesters() {
    const opts = ['1','2','3','4','5','6','7','8'];
    const suf = (n) => {
      if (n === 11 || n === 12 || n === 13) return 'th';
      const d = n % 10;
      if (d === 1) return 'st';
      if (d === 2) return 'nd';
      if (d === 3) return 'rd';
      return 'th';
    };
    semesterSelect.innerHTML = '<option value="" disabled selected>Semester</option>' +
      opts.map(s => {
        const n = Number(s);
        return `<option value="${s}">${n}${suf(n)} Sem</option>`;
      }).join('');
    if (window.customList) {
      window.customList.refresh(semesterSelect);
    }
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
    // Semesters are always filled now; no dependency on user.year
  }

  // Fill semesters immediately so dropdown always has values
  fillSemesters();
  checkAdmin();
});
