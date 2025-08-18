// Scroll-reveal for elements with .reveal
(function(){
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    document.addEventListener('DOMContentLoaded', ()=>{
      document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
    });
  } else {
    // Fallback: reveal immediately
    document.addEventListener('DOMContentLoaded', ()=>{
      document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
    });
  }
})();
