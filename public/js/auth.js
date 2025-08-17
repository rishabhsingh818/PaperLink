function saveToken(t){ localStorage.setItem('token', t); }
function token(){ return localStorage.getItem('token') || ''; }
function api(path, opt={}){ return fetch('/api'+path,{...opt, headers:{'Content-Type':'application/json', Authorization:'Bearer '+token(), ...(opt.headers||{})}}).then(r=>r.json()); }

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm){
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm));
    const res = await api('/auth/login',{ method:'POST', body: JSON.stringify(data) });
    if(res.token){ saveToken(res.token); location.href = '/dashboard.html'; } else alert(res.error||'Login failed');
  });
}

// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm){
  signupForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(signupForm));
    const res = await api('/auth/signup',{ method:'POST', body: JSON.stringify(data) });
    if(res.token){ saveToken(res.token); location.href = '/dashboard.html'; } else alert(res.error||'Signup failed');
  });
}

// Logout (on pages that have it)
const logout = document.getElementById('logout');
if (logout){ logout.addEventListener('click', ()=>{ localStorage.removeItem('token'); location.href = '/'; }); }
