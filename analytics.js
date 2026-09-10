/* Optional first-party website measurement. No inquiry values are read. */
(() => {
  'use strict';
  const ID = 'G-ZSEY5SFG24';
  const KEY = 'ac-analytics-choice-v1';
  const MAX_AGE = 180 * 86400000;
  const pages = {
    '/': 'Home', '/portfolio.html': 'Portfolio', '/privacy.html': 'Privacy',
    '/terms.html': 'Terms', '/portfolio/asu-graduation.html': 'ASU graduation',
    '/portfolio/senior-year.html': 'Senior portraits',
    '/portfolio/two-of-you.html': 'Couples',
    '/portfolio/the-family-reel.html': 'Families',
    '/portfolio/roslyn-first-birthday.html': 'First birthday'
  };
  const path = location.pathname === '/index.html' ? '/' : location.pathname;
  if (!Object.hasOwn(pages, path)) return;
  const production = location.protocol === 'https:' && ['alanscinematics.com', 'www.alanscinematics.com'].includes(location.hostname);
  const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let choice = null, loaded = false, active = false, formStarted = false;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && ['allow', 'decline'].includes(saved.value) && Number.isFinite(saved.expires) && saved.expires > Date.now()) choice = saved.value;
  } catch (_) { /* Collection still works only with a fresh explicit choice. */ }
  if (privacySignal) choice = 'decline';
  let referrer = '';
  try { referrer = new URL(document.referrer).origin; } catch (_) { /* Empty is valid. */ }
  const context = {page_location: 'https://alanscinematics.com' + path, page_title: pages[path], page_referrer: referrer};
  function command() { window.dataLayer.push(arguments); }
  function event(name, values = {}) {
    if (active && production) command('event', name, {...context, ...values, send_to: ID});
  }
  function start() {
    active = true;
    if (!production || loaded) return;
    loaded = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    command('consent', 'default', {ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted'});
    command('js', new Date());
    command('config', ID, {...context, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 90 * 86400, cookie_update: false});
    const loader = document.createElement('script');
    loader.async = true;
    loader.referrerPolicy = 'origin';
    const url = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    try {
      const policy = window.trustedTypes && window.trustedTypes.createPolicy('ac-analytics', {
        createScriptURL: value => { if (value !== url) throw new TypeError('Unexpected Analytics script'); return value; }
      });
      loader.src = policy ? policy.createScriptURL(url) : url;
      document.head.appendChild(loader);
      event('page_view');
    } catch (_) { active = false; window['ga-disable-' + ID] = true; }
  }
  function stop() {
    active = false;
    window['ga-disable-' + ID] = true;
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of ['', '; domain=alanscinematics.com', '; domain=.alanscinematics.com', '; domain=www.alanscinematics.com']) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      }
    }
  }
  const panel = document.createElement('section');
  panel.className = 'ac-analytics';
  panel.setAttribute('aria-label', 'Optional analytics');
  const text = document.createElement('p');
  text.textContent = 'May we use optional analytics to understand visits and improve this website? Your inquiry details are excluded. Booking works either way.';
  const actions = document.createElement('div');
  const allow = document.createElement('button');
  allow.type = 'button'; allow.textContent = 'Allow analytics';
  const decline = document.createElement('button');
  decline.type = 'button'; decline.textContent = 'Decline analytics';
  const privacy = document.createElement('a');
  privacy.href = '/privacy.html#analytics'; privacy.textContent = 'Privacy details';
  const settings = document.createElement('button');
  settings.type = 'button'; settings.className = 'ac-analytics-settings'; settings.textContent = 'Analytics choices';
  settings.setAttribute('aria-expanded', 'false');
  settings.addEventListener('click', () => { panel.hidden = !panel.hidden; settings.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) decline.focus({preventScroll: true}); });
  function choose(value) {
    choice = value;
    try { localStorage.setItem(KEY, JSON.stringify({value, expires: Date.now() + MAX_AGE})); } catch (_) { /* Session-only choice. */ }
    panel.hidden = true; settings.setAttribute('aria-expanded', 'false');
    if (value === 'allow' && !privacySignal) {
      if (loaded) { active = true; window['ga-disable-' + ID] = false; }
      else start();
    } else stop();
    settings.focus({preventScroll: true});
  }
  allow.addEventListener('click', () => choose('allow'));
  decline.addEventListener('click', () => choose('decline'));
  if (privacySignal) {
    allow.disabled = true;
    text.textContent = 'Analytics are off because your browser requests privacy. You can use every part of this website without analytics.';
  }
  actions.append(allow, decline, privacy); panel.append(text, actions);
  panel.hidden = choice !== null;
  settings.setAttribute('aria-expanded', String(!panel.hidden));
  const footer = document.querySelector('footer');
  (footer || document.body).append(settings);
  document.body.append(panel);
  document.addEventListener('click', e => {
    const link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.getAttribute('href'), location.href); } catch (_) { return; }
    let method;
    if (url.protocol === 'mailto:') method = 'email';
    else if (url.protocol === 'tel:') method = 'phone';
    else if (url.origin === location.origin && ['/', '/index.html'].includes(url.pathname) && url.hash === '#book') method = 'inquiry_form';
    if (method) event('contact_click', {contact_method: method});
  });
  document.addEventListener('focusin', e => {
    if (!active || formStarted || !e.target.closest || !e.target.closest('#bookForm')) return;
    formStarted = true; event('inquiry_form_start');
  });
  if (choice === 'allow') start();
  else stop();
})();
