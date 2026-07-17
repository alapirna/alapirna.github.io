/* AlansCinematics — interaction layer. Vanilla JS, no dependencies. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  /* ── intro slate (once per session) ─────────────────────────── */
  const intro = $('#intro');
  if (intro) {
    if (reduced || sessionStorage.getItem('ac_intro')) {
      intro.classList.add('done');
    } else {
      sessionStorage.setItem('ac_intro', '1');
      document.documentElement.classList.add('lock');
      setTimeout(() => {
        intro.classList.add('done');
        document.documentElement.classList.remove('lock');
      }, 1900);
    }
  }

  /* ── running timecode (24 fps) ──────────────────────────────── */
  const tc = $('#tc');
  if (tc && !reduced) {
    const t0 = performance.now();
    const pad = n => String(n).padStart(2, '0');
    let last = -1;
    const tick = now => {
      const f = Math.floor((now - t0) / 1000 * 24);
      if (f !== last) {
        last = f;
        const s = Math.floor(f / 24), m = Math.floor(s / 60), h = Math.floor(m / 60);
        tc.textContent = `PHX ${pad(h % 24)}:${pad(m % 60)}:${pad(s % 60)}:${pad(f % 24)}`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── playhead + nav state + parallax (one scroll loop) ──────── */
  const playhead = $('#playhead');
  const nav = $('#nav');
  const plxEls = reduced ? [] : $$('[data-plx]').map(el => ({ el, sp: parseFloat(el.dataset.plx) }));
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      if (playhead) playhead.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      nav.classList.toggle('scrolled', scrollY > 40);
      for (const { el, sp } of plxEls) {
        const host = el.parentElement.getBoundingClientRect();
        if (host.bottom < -80 || host.top > innerHeight + 80) continue;
        const mid = host.top + host.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-mid * sp).toFixed(1)}px, 0)`;
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* active section in nav */
  const navLinks = $$('.nav-links a');
  if (navLinks.length) {
    const byHash = Object.fromEntries(navLinks.map(a => [a.getAttribute('href'), a]));
    const secObs = new IntersectionObserver(es => {
      for (const e of es) {
        const link = byHash[`#${e.target.id}`];
        if (link && e.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('live', a === link));
        }
      }
    }, { rootMargin: '-42% 0px -52%' });
    ['work', 'experience', 'sessions', 'director', 'faq'].forEach(id => {
      const s = document.getElementById(id);
      if (s) secObs.observe(s);
    });
  }

  /* ── mobile menu ────────────────────────────────────────────── */
  const burger = $('#burger'), mmenu = $('#mobileMenu');
  const closeMenu = () => {
    mmenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('lock');
    setTimeout(() => { mmenu.hidden = true; }, 320);
  };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    if (open) return closeMenu();
    mmenu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => mmenu.classList.add('open')));
    burger.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('lock');
  });
  $$('.mmenu a').forEach(a => a.addEventListener('click', closeMenu));

  /* ── reveals ────────────────────────────────────────────────── */
  const rvObs = new IntersectionObserver(entries => {
    const batch = entries.filter(e => e.isIntersecting);
    batch.forEach((e, i) => {
      e.target.style.setProperty('--d', `${Math.min(i * 75, 450)}ms`);
      e.target.classList.add('in');
      rvObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4%' });
  $$('.rv, .cell').forEach(el => rvObs.observe(el));

  /* ── image fade-in when decoded ─────────────────────────────── */
  $$('.ph img').forEach(img => {
    if (img.complete && img.naturalWidth) img.classList.add('ld');
    else img.addEventListener('load', () => img.classList.add('ld'), { once: true });
  });

  /* ── gallery filter + expander ──────────────────────────────── */
  const GALLERY_LIMIT = 12;
  const tabs = $$('.tab');
  const cells = $$('#gallery .cell');
  const moreBtn = $('#galleryMore'), gmCount = $('#gmCount');
  let galleryCat = 'all';
  let galleryExpanded = false;

  const applyGallery = () => {
    let shown = 0, hiddenExtra = 0;
    for (const c of cells) {
      const match = galleryCat === 'all' || c.dataset.cat === galleryCat;
      const vis = match && (galleryExpanded || shown < GALLERY_LIMIT);
      if (vis) shown++;
      else if (match) hiddenExtra++;
      c.hidden = !vis;
    }
    if (moreBtn) {
      moreBtn.hidden = galleryExpanded || hiddenExtra === 0;
      moreBtn.setAttribute('aria-expanded', String(galleryExpanded));
      if (!moreBtn.hidden) gmCount.textContent = `${hiddenExtra} more frame${hiddenExtra === 1 ? '' : 's'}`;
    }
  };
  const transitionGallery = () => {
    if (document.startViewTransition && !reduced) document.startViewTransition(applyGallery);
    else applyGallery();
  };
  applyGallery();

  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (tab.getAttribute('aria-pressed') === 'true') return;
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    galleryCat = tab.dataset.cat;
    transitionGallery();
  }));

  if (moreBtn) moreBtn.addEventListener('click', () => {
    galleryExpanded = true;
    transitionGallery();
  });

  /* ── lightbox ───────────────────────────────────────────────── */
  const lb = $('#lb'), stage = $('#lbStage');
  const lbTitle = $('#lbTitle'), lbLoc = $('#lbLoc'), lbCount = $('#lbCount');
  const frames = $$('#gallery .frame');
  let seq = [], pos = 0;

  const buildImg = f => {
    const pic = document.createElement('picture');
    const mk = (type, srcset) => {
      const s = document.createElement('source');
      s.type = type; s.srcset = srcset; s.sizes = '92vw';
      return s;
    };
    pic.append(
      mk('image/avif', f.dataset.lbAvif),
      mk('image/webp', f.dataset.lbWebp)
    );
    const img = document.createElement('img');
    img.src = f.dataset.lbJpg;
    img.alt = f.dataset.alt;
    img.width = f.dataset.w;
    img.height = f.dataset.h;
    img.decoding = 'async';
    pic.append(img);
    return pic;
  };
  const preload = f => {
    if (!f) return;
    const img = new Image();
    img.srcset = f.dataset.lbAvif;
    img.sizes = '92vw';
  };
  const render = () => {
    const f = seq[pos];
    stage.replaceChildren(buildImg(f));
    lbTitle.textContent = f.dataset.title;
    lbLoc.textContent = `${f.dataset.catLabel} · ${f.dataset.loc}`;
    lbCount.textContent = `${String(pos + 1).padStart(2, '0')} / ${String(seq.length).padStart(2, '0')}`;
    preload(seq[(pos + 1) % seq.length]);
    preload(seq[(pos - 1 + seq.length) % seq.length]);
  };
  const openLb = f => {
    // browse the whole active category in the lightbox, even frames still
    // collapsed behind the expander
    seq = frames.filter(fr => galleryCat === 'all' || fr.closest('.cell').dataset.cat === galleryCat);
    pos = seq.indexOf(f);
    if (pos < 0) return;
    render();
    lb.showModal();
    document.documentElement.classList.add('lock');
  };
  const step = d => { pos = (pos + d + seq.length) % seq.length; render(); };

  frames.forEach(f => f.addEventListener('click', () => openLb(f)));
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => document.documentElement.classList.remove('lock'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  let swX = null;
  lb.addEventListener('pointerdown', e => { swX = e.clientX; }, { passive: true });
  lb.addEventListener('pointerup', e => {
    if (swX === null) return;
    const dx = e.clientX - swX;
    swX = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ── booking form ───────────────────────────────────────────── */
  const form = $('#bookForm'), status = $('#formStatus');
  const showDone = () => {
    form.innerHTML = `
      <div class="form-done">
        <p class="fd-mark">Inquiry received</p>
        <h3>Scene scheduled.</h3>
        <p>Thanks for reaching out. I'll reply within 48 hours to confirm availability and lock in details. Talk soon.</p>
      </div>`;
  };
  if (new URLSearchParams(location.search).get('sent') === '1') {
    showDone();
    history.replaceState(null, '', location.pathname + '#book');
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.querySelector('[name="_honey"]')?.value) { showDone(); return; }
    const btn = form.querySelector('.f-submit');
    btn.disabled = true;
    btn.firstElementChild.textContent = 'Sending…';
    status.classList.remove('err');
    status.textContent = '';
    // FormSubmit's dedicated AJAX endpoint (CORS-enabled, JSON response).
    let res = null;
    try {
      res = await fetch(form.dataset.ajax, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
    } catch {
      // network/CORS failure — native full-page POST instead; FormSubmit
      // redirects back to ?sent=1#book which shows the success slate
      form.submit();
      return;
    }
    const data = await res.json().catch(() => null);
    if (data && String(data.success).toLowerCase() === 'true') {
      showDone();
    } else if (data && data.message) {
      // FormSubmit itself rejected the submission
      btn.disabled = false;
      btn.firstElementChild.textContent = 'Send inquiry';
      status.classList.add('err');
      status.textContent = 'That didn\'t go through. Try again, or email alanscinematics@gmail.com directly.';
    } else {
      // non-JSON reply (e.g. a bot-check challenge page) — a native POST
      // lets the browser complete the challenge and still deliver
      form.submit();
    }
  });

  /* preselect session type from ticket buttons */
  $$('[data-session]').forEach(a => a.addEventListener('click', () => {
    const sel = $('#f-session');
    const map = {
      portraits: 'Portraits / Grads — from $250',
      couples: 'Couples — from $300',
      families: 'Families — from $400',
    };
    const v = map[a.dataset.session];
    if (v) sel.value = v;
  }));

  /* min date = today */
  const dateInput = $('#f-date');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  /* ── sticky mobile cta ──────────────────────────────────────── */
  const sticky = $('#stickyCta'), heroEl = $('#hero'), bookEl = $('#book');
  if (sticky && heroEl && bookEl) {
    sticky.hidden = false;
    let heroOut = false, bookIn = false;
    const upd = () => sticky.classList.toggle('show', heroOut && !bookIn);
    new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; upd(); }, { threshold: 0.08 }).observe(heroEl);
    new IntersectionObserver(([e]) => { bookIn = e.isIntersecting; upd(); }, { threshold: 0.05 }).observe(bookEl);
  }

  /* ── custom cursor ──────────────────────────────────────────── */
  if (finePointer && !reduced) {
    document.documentElement.classList.add('fine');
    const cur = $('#cur'), label = $('#curLabel');
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, live = false;
    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!cur.classList.contains('on')) cur.classList.add('on');
      if (!live) { live = true; loop(); }
    }, { passive: true });
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cur.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      requestAnimationFrame(loop);
    };
    document.addEventListener('mouseover', e => {
      const view = e.target.closest('[data-cursor="view"]');
      const link = !view && e.target.closest('a, button, summary, input, select, textarea, label');
      cur.classList.toggle('view', !!view);
      cur.classList.toggle('link', !!link);
      label.textContent = view ? 'OPEN' : '';
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    document.addEventListener('mouseenter', () => cur.classList.add('on'));
  }
})();
