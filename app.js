/* BeHive prototype — interactions */

/* ---------- Team grid ---------- */
const TEAM = [
  { slug: 'rachel-altmann',   name: 'Rachel Altmann',        role: 'CEO, Co-founder',                          cred: 'LSE' },
  { slug: 'anna-nyvelt',      name: 'Anna Nyvelt',           role: 'Co-founder, Commercial Director',          cred: 'Maastricht' },
  { slug: 'noemi-molnar',     name: 'Noémi Molnár',          role: 'Chief Behavioural Scientist',              cred: "King's College London" },
  { slug: 'luca-karig',       name: 'Luca Karig',            role: 'Head of Org. Development Consulting',      cred: 'LSE' },
  { slug: 'kinga-frohlich',   name: 'Kinga Fröhlich',        role: 'Chief of Staff',                           cred: 'Corvinus' },
  { slug: 'domonkos-kezer',   name: 'Domonkos Kézér',        role: 'Behavioural Science Project Manager',      cred: 'Warwick' },
  { slug: 'samuel-keightley', name: 'Samuel Keightley, PhD', role: 'Senior Behavioural Science Researcher',    cred: "PhD · King's College" },
  { slug: 'dora-tancos',      name: 'Dóra Táncos',           role: 'Senior BeSci Researcher & Designer',       cred: 'ELTE' },
  { slug: 'zsofia-tamas',     name: 'Zsófia Tamás',          role: 'Medior Behavioural Science Consultant',    cred: "King's College London" },
  { slug: 'leo-ferenci',      name: 'Leó Ferenci',           role: 'Medior Behavioural Science Consultant',    cred: 'Univ. of Amsterdam' },
  { slug: 'marguerite-kotze', name: 'Marguerite Kotze',      role: 'Junior Behavioural Science Consultant',    cred: 'UPenn' },
  { slug: 'tamas-havas',      name: 'Tamás Havas',           role: 'Junior Behavioural Science Researcher',    cred: 'Glasgow' },
  { slug: 'lujza-mizik',      name: 'Lujza Mizik',           role: 'Junior Data Scientist',                    cred: 'Edinburgh' },
  { slug: 'david-ottlik',     name: 'David Ottlik',          role: 'Business Advisor · Synetiq founder',       cred: 'Advisor', advisor: true },
  { slug: 'lucia-macchia',    name: 'Lucía Macchia, PhD',    role: 'Academic Advisor · Oxford & Harvard',      cred: 'Advisor', advisor: true },
];

const grid = document.getElementById('teamGrid');
if (grid) {
  grid.innerHTML = TEAM.map(m => `
    <article class="member reveal">
      <img src="assets/team/${m.slug}.jpg" alt="${m.name}" loading="lazy">
      <div class="member-body">
        <h3>${m.name}</h3>
        <p class="role">${m.role}</p>
        <span class="cred${m.advisor ? ' advisor' : ''}">${m.cred}</span>
      </div>
    </article>`).join('');
}

/* ---------- Reveal on scroll ---------- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 }) : null;
if (io) document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Stat count-up ---------- */
const statIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.6 }) : null;
if (statIO) document.querySelectorAll('[data-count]').forEach(el => statIO.observe(el));

/* ---------- Reveal safety net ----------
   Content must never stay invisible: if IntersectionObserver is missing or
   silently broken (some embedded webviews), reveal everything in one go. */
const revealAll = () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  document.querySelectorAll('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
};
const revealStuck = () => {
  const stuck = Array.from(document.querySelectorAll('.reveal:not(.in)')).some(el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight - 40 && r.bottom > 40;
  });
  if (stuck || !io) { revealAll(); window.removeEventListener('scroll', onRevealCheck); }
};
let revealTimer = null;
const onRevealCheck = () => { clearTimeout(revealTimer); revealTimer = setTimeout(revealStuck, 400); };
window.addEventListener('scroll', onRevealCheck, { passive: true });
setTimeout(revealStuck, 1200);

/* ---------- Hero video: keep it playing (autoplay can be interrupted) ---------- */
const video = document.getElementById('heroVideo');
if (video) {
  const ensurePlaying = () => { if (video.paused) video.play().catch(() => {}); };
  ensurePlaying();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) ensurePlaying(); });
  video.addEventListener('pause', () => setTimeout(ensurePlaying, 300));
}

/* ---------- Sticky nav: show once the hero has scrolled out ----------
   Plain scroll listener (not IO) — deterministic in every environment. */
const stickyNav = document.getElementById('stickyNav');
const hero = document.querySelector('.hero');
if (stickyNav && hero) {
  let navTick = false;
  const updateNav = () => {
    stickyNav.classList.toggle('show', window.scrollY > hero.offsetHeight - 70);
    navTick = false;
  };
  window.addEventListener('scroll', () => {
    if (!navTick) { navTick = true; requestAnimationFrame(updateNav); }
  }, { passive: true });
  updateNav();
}

/* ---------- Topic chips (single select) ---------- */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.closest('.chip-row').querySelectorAll('.chip').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
  });
});

/* ---------- Report forms (mock) ---------- */
document.querySelectorAll('.report-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input');
    if (!email.value || !email.checkValidity()) { email.focus(); return; }
    form.innerHTML = '<span class="sent">Sent — check your inbox ✓</span>';
  });
});

/* ---------- Contact form (mock) ---------- */
const cForm = document.getElementById('contactForm');
if (cForm) {
  cForm.addEventListener('submit', e => {
    e.preventDefault();
    const required = ['cfName', 'cfEmail', 'cfMsg'].map(id => document.getElementById(id));
    const firstInvalid = required.find(el => !el.value.trim() || !el.checkValidity());
    if (firstInvalid) { firstInvalid.focus(); return; }
    document.getElementById('contactFormBox').innerHTML = `
      <div class="form-success">
        <div class="tick"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h3>Message sent.</h3>
        <p>We reply within 24–48 hours. Until then — stay curious.</p>
      </div>`;
  });
}
