function token(){ return localStorage.getItem('token') || ''; }
async function api(path, opts={}){ const res = await fetch('/api'+path,{...opts, headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token(), ...(opts.headers||{})}}); return res.json(); }

const params = new URLSearchParams(location.search);
const id = params.get('id');
const card = document.getElementById('paperCard');
const chat = document.getElementById('chat');
const chatForm = document.getElementById('chatForm');
const msg = document.getElementById('msg');

async function load(){
  const { paper } = await api('/papers/'+id);
  card.innerHTML = `<h2>${paper.title}</h2>
    <div class="meta">${new Date(paper.createdAt).toLocaleString()} • ${paper.tags.map(t=>`<span class='badge'>${t}</span>`).join(' ')}</div>
    <p>${paper.abstract}</p>
    <div class="row"><label>Rate: </label>
      <select id="rating">${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select>
      <input id="review" placeholder="Short review">
      <button class="btn" id="rateBtn">Submit</button>
    </div>`;
  document.getElementById('rateBtn').onclick = async ()=>{
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    const res = await api('/papers/'+id+'/rate',{ method:'POST', body: JSON.stringify({ rating, review }) });
    if(!res.ok && res.error) alert(res.error);
  };
}

async function loadChat(){
  const data = await api('/chat/'+id);
  chat.innerHTML = (data.messages||[]).map(m=>`<div class='msg glass'>${new Date(m.at).toLocaleTimeString()} — ${m.text}</div>`).join('');
}

chatForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!msg.value.trim()) return;
  await api('/chat/'+id,{ method:'POST', body: JSON.stringify({ text: msg.value }) });
  msg.value=''; await loadChat();
});

load(); loadChat(); setInterval(loadChat, 4000);
