const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* favourites (localStorage) */
const getFavs = () => { try { return JSON.parse(localStorage.getItem('jdm-favs')) || []; } catch { return []; } };
const setFavs = a => { try { localStorage.setItem('jdm-favs', JSON.stringify(a)); } catch {} };

/* rendering */
const cardHTML = (c, i) => `
  <article class="card reveal" style="--i:${i}">
    <a class="ph" href="gallery.html#${c.id}" aria-label="${c.brand} ${c.name}, ${c.year}">
      <span class="ph-name">${c.name}</span>
      <img src="img/${c.id}.jpg" alt="${c.brand} ${c.name}" loading="lazy" onerror="this.remove()">
    </a>
    <button class="heart" data-id="${c.id}" aria-pressed="${getFavs().includes(c.id)}" aria-label="Save ${c.name} to favourites">\u2665</button>
    <div class="meta"><h3>${c.brand} ${c.name}</h3><p>${c.year}, ${c.drive}</p><p class="note">${c.note}</p></div>
  </article>`;

function renderFeatured() {
  $('#featured').innerHTML = CARS.filter(c => c.featured).map(cardHTML).join('');
}
function renderFavs() {
  const list = CARS.filter(c => getFavs().includes(c.id));
  $('#favs').hidden = !list.length;
  $('#favlist').innerHTML = list.map(c => `<li><a href="gallery.html#${c.id}"><b>${c.brand} ${c.name}</b><span>${c.year}</span></a></li>`).join('');
}
document.addEventListener('click', e => {
  const b = e.target.closest('.heart');
  if (!b) return;
  const f = getFavs(), id = b.dataset.id, on = !f.includes(id);
  setFavs(on ? [...f, id] : f.filter(x => x !== id));
  $$(`.heart[data-id="${id}"]`).forEach(h => h.setAttribute('aria-pressed', on));
  renderFavs();
});

/* counters: values come from the data */
const totals = {
  cars: CARS.length,
  brands: new Set(CARS.map(c => c.brand)).size,
  decades: new Set(CARS.map(c => Math.floor(c.year / 10))).size
};
function countUp(el) {
  const end = totals[el.dataset.count];
  if (reduce) { el.textContent = end; return; }
  const t0 = performance.now(), dur = 1500;
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* reveal + counters on entering the viewport (each runs once) */
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (en.target.dataset.count) countUp(en.target);
  io.unobserve(en.target);
}), { threshold: .3 });

renderFeatured();
renderFavs();
$$('.reveal, [data-count]').forEach(el => io.observe(el));

/* burger menu */
const burger = $('.burger'), menu = $('#menu');
const setMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => { if (!e.target.closest('.top')) setMenu(false); });

/* hero parallax (desktop, motion allowed) */
if (!reduce) {
  let tick = false;
  addEventListener('scroll', () => {
    if (tick || innerWidth < 768) return;
    tick = true;
    requestAnimationFrame(() => { document.documentElement.style.setProperty('--py', scrollY * .18 + 'px'); tick = false; });
  }, { passive: true });
}
