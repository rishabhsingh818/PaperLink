function token(){ return localStorage.getItem('token') || ''; }
async function api(path, opts={}){ const res = await fetch('/api'+path,{...opts, headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token(), ...(opts.headers||{})}}); return res.json(); }

const stats = document.getElementById('stats');
const pending = document.getElementById('pending');
const exportBtn = document.getElementById('export');
const verifs = document.getElementById('verifs');

async function load(){
  const s = await api('/admin/stats');
  stats.innerHTML = `<h3>Stats</h3><p>Users: ${s.users} • Papers: ${s.papers} • Pending: ${s.pending}</p>`;
  const list = await api('/papers/admin/pending/list');
  pending.innerHTML = (list.pending||[]).map(p=>`<div class='glass item'>
    <h4>${p.title}</h4><p>${p.abstract}</p>
    <div>${p.tags.map(t=>`<span class='badge'>${t}</span>`).join(' ')}</div>
    <div class='row'>
      <button class='btn' onclick="approve('${p.id}')">Approve</button>
      <button class='btn ghost' onclick="rejectP('${p.id}')">Reject</button>
    </div>
  </div>`).join('');

  const v = await api('/admin/verifications');
  verifs.innerHTML = (v.pending||[]).map(u=>`<div class='glass item'>
    <h4>${u.name}</h4><div class='meta'>${u.email} • ${u.college||''}</div>
    <button class='btn' onclick="verifyU('${u.id}')">Verify</button>
  </div>`).join('');
}

window.approve = async (id)=>{ await api('/papers/admin/'+id+'/approve',{ method:'POST' }); load(); };
window.rejectP = async (id)=>{ await api('/papers/admin/'+id+'/reject',{ method:'POST' }); load(); };
window.verifyU = async (id)=>{ await api('/admin/verify/'+id,{ method:'POST' }); load(); };

exportBtn?.addEventListener('click', (e)=>{
  e.preventDefault();
  fetch('/api/admin/export',{ headers:{ Authorization:'Bearer '+token() }}).then(r=>r.blob()).then(b=>{
    const url = URL.createObjectURL(b); const a = document.createElement('a'); a.href=url; a.download='papers.csv'; a.click(); URL.revokeObjectURL(url);
  });
});

load();
