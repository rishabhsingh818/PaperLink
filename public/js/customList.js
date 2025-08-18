(function(){
  function enhance(select){
    if (!select || select.dataset.enhanced === '1') return;
    select.dataset.enhanced = '1';

    // Wrapper
    const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.style.width = '100%';
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.gap = '6px';
    // Hide native select but keep it for form submission
    select.style.position = 'absolute';
    select.style.opacity = '0';
    select.style.pointerEvents = 'none';
    select.style.width = '100%';

    // Display box (like input)
    const display = document.createElement('div');
    display.className = 'glass';
    display.style.padding = '12px 14px';
    display.style.borderRadius = '12px';
    display.style.border = '1px solid rgba(255,255,255,.12)';
    display.style.background = 'linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.035))';
    display.style.color = getComputedStyle(document.body).getPropertyValue('--text') || '#fff';
    display.style.cursor = 'pointer';
    display.style.fontWeight = '600';
    display.style.userSelect = 'none';

    // Placeholder text from selected option or first disabled option
    function currentLabel(){
      const opt = select.options[select.selectedIndex];
      if (opt) return opt.textContent;
      const first = Array.from(select.options).find(o=>o.disabled);
      return first ? first.textContent : '';
    }
    display.textContent = currentLabel();

    // List
  const list = document.createElement('div');
  list.className = 'glass';
  // Flow in layout to avoid overlapping next fields
  list.style.position = 'relative';
  list.style.width = '100%';
  list.style.marginTop = '6px';
  list.style.padding = '6px';
  list.style.borderRadius = '14px';
  list.style.backdropFilter = 'blur(8px)';
  list.style.webkitBackdropFilter = 'blur(8px)';
  list.style.display = 'none';
  list.style.overflowY = 'hidden';

    function buildItems(){
      list.innerHTML = '';
      const items = Array.from(select.options).filter(o=>!o.disabled && o.value !== '');
      const clamp = items.slice(0, 8); // no scrollbar
      clamp.forEach(o=>{
        const it = document.createElement('div');
        it.textContent = o.textContent;
        it.style.padding = '8px 10px';
        it.style.borderRadius = '10px';
        it.style.cursor = 'pointer';
        it.addEventListener('mouseenter', ()=> it.style.background = 'rgba(255,255,255,.06)');
        it.addEventListener('mouseleave', ()=> it.style.background = 'transparent');
        it.addEventListener('mousedown', (e)=>{
          e.preventDefault();
          select.value = o.value;
          display.textContent = o.textContent;
          list.style.display = 'none';
        });
        list.appendChild(it);
      });
    }

    buildItems();

    display.addEventListener('click', ()=>{
      const opening = list.style.display === 'none';
      if (opening) buildItems();
      list.style.display = opening ? 'block' : 'none';
    });

    document.addEventListener('click', (e)=>{
      if (!wrap.contains(e.target)) list.style.display = 'none';
    });

    // Insert elements
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    wrap.appendChild(display);
    wrap.appendChild(list);

    // Expose reference for refresh
    select._customList = { wrap, display, list, buildItems };
  }

  function refresh(select){
    if (!select || !select._customList) return;
    const { display, buildItems } = select._customList;
    // Update label
    const opt = select.options[select.selectedIndex];
    if (opt) display.textContent = opt.textContent; else display.textContent = '';
    buildItems();
  }

  function enhanceAll(){
    document.querySelectorAll('select.custom-list').forEach(enhance);
  }

  window.customList = { enhance, refresh, enhanceAll };

  document.addEventListener('DOMContentLoaded', enhanceAll);
})();
