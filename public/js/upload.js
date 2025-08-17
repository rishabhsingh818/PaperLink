function token(){ return localStorage.getItem('token') || ''; }
async function upload(path, body){ const res = await fetch('/api'+path,{ method:'POST', body, headers:{ Authorization:'Bearer '+token() }}); return res.json(); }

const form = document.getElementById('uploadForm');
if (form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const res = await upload('/papers', fd);
    if(res.ok){ alert('Submitted for approval'); location.href = '/dashboard.html'; } else alert(res.error||'Failed');
  });
}
