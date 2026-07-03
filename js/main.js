/* ================================================
   MAIN.JS — Navegación, scroll, animaciones
   ================================================ */

// Mobile nav
function openMobileNav()  { document.getElementById('mobileNav').classList.add('open'); }
function closeMobileNav() { document.getElementById('mobileNav').classList.remove('open'); }

// Active nav link según scroll
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.header__nav a, .mobile-nav a');

function updateActiveLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const id     = sec.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('href') === '#' + id) l.classList.add('active');
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObs.observe(el));

// Carrusel de eventos
const evTrack = document.getElementById('evTrack');
if (evTrack) {
  const evCount = evTrack.children.length;
  const evDots  = document.getElementById('evDots');
  let evIndex = 0;
  let evTimer = null;

  for (let i = 0; i < evCount; i++) {
    const d = document.createElement('button');
    d.className = 'ev-dot' + (i === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Imagen ' + (i + 1));
    d.addEventListener('click', () => { evGo(i); evRestart(); });
    evDots.appendChild(d);
  }

  function evRender() {
    evTrack.style.transform = 'translateX(-' + (evIndex * 100) + '%)';
    Array.from(evDots.children).forEach((d, i) => d.classList.toggle('on', i === evIndex));
  }
  function evGo(i) { evIndex = (i + evCount) % evCount; evRender(); }
  function evRestart() { clearInterval(evTimer); evTimer = setInterval(() => evGo(evIndex + 1), 4500); }

  window.evMove = (dir) => { evGo(evIndex + dir); evRestart(); };
  evRestart();
}

// Formulario de contacto → mailto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre  = contactForm.querySelector('input[type="text"]').value.trim();
    const email   = contactForm.querySelector('input[type="email"]').value.trim();
    const mensaje = contactForm.querySelector('textarea').value.trim();
    const btn     = contactForm.querySelector('.btn-submit');

    if (!nombre || !email || !mensaje) {
      alert('Por favor completá todos los campos.');
      return;
    }

    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const resp = await fetch('contacto.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje })
      });
      const data = await resp.json();
      if (!data.ok) throw new Error('No enviado');
      btn.textContent = '¡Mensaje enviado! ✓';
      contactForm.reset();
      setTimeout(() => { btn.disabled = false; btn.textContent = textoOriginal; }, 4000);
    } catch (err) {
      alert('No pudimos enviar el mensaje. Escribinos por WhatsApp o a info@correagrieco.com.');
      btn.disabled = false;
      btn.textContent = textoOriginal;
    }
  });
}
