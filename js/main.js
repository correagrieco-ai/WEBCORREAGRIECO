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
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre  = contactForm.querySelector('input[type="text"]').value  || '';
    const email   = contactForm.querySelector('input[type="email"]').value || '';
    const mensaje = contactForm.querySelector('textarea').value            || '';
    const body    = encodeURIComponent(
      'Nombre: ' + nombre + '\nEmail: ' + email + '\n\nMensaje:\n' + mensaje
    );
    window.location.href =
      'mailto:info@correagrieco.com?subject=Consulta%20desde%20el%20sitio%20web&body=' + body;
  });
}
