/* AlansCinematics — booking delivery, isolated from decorative interactions. */
(() => {
  'use strict';
  const form = document.querySelector('#bookForm');
  if (!form) return;
  const status = document.querySelector('#formStatus');
  const submit = form.querySelector('.f-submit');
  const verify = document.querySelector('#formVerify');
  const emailLink = document.querySelector('#formEmail');
  const receipt = document.querySelector('#formReference');
  const pendingKey = 'ac_pending_inquiry';
  const inbox = 'alanscinematics@gmail.com';
  let busy = false;
  let verificationTimer;
  let reference = '';

  // No inquiry contents are stored in the browser: only a return reference.
  const readPending = () => {
    try { return JSON.parse(sessionStorage.getItem(pendingKey) || 'null'); }
    catch { return null; }
  };
  const clearPending = () => {
    try { sessionStorage.removeItem(pendingKey); } catch {}
  };
  const getReference = () => {
    if (!reference) {
      const token = window.crypto?.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2));
      reference = 'AC-' + token.replaceAll('-', '').slice(0, 16).toUpperCase();
    }
    receipt.hidden = false;
    receipt.textContent = 'Inquiry reference: ' + reference;
    return reference;
  };
  const setBusy = value => {
    busy = value;
    submit.disabled = value;
    verify.disabled = value;
    form.setAttribute('aria-busy', String(value));
    submit.firstElementChild.textContent = value ? 'Opening verification…' : 'Send inquiry';
  };
  const focusStatus = () => status.focus({ preventScroll: true });
  const failure = (code, message) => {
    setBusy(false);
    status.classList.add('err');
    status.textContent = message + ' Your details are still here. Continue with verification, or email them directly below.';
    verify.hidden = false;
    getReference();
    updateEmailLink();
    // Operational code only; never log names, email addresses, or message bodies.
    console.warn('[booking]', code, reference);
    focusStatus();
  };
  const updateEmailLink = () => {
    const data = new FormData(form);
    const labels = [['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['session', 'Session'], ['date', 'Preferred date'], ['location', 'Location'], ['message', 'Details']];
    const lines = labels.map(([key, label]) => label + ': ' + (data.get(key) || ''));
    if (reference) lines.unshift('Inquiry reference: ' + reference, '');
    emailLink.href = 'mailto:' + inbox + '?subject=' + encodeURIComponent('Session inquiry' + (reference ? ' — ' + reference : '')) + '&body=' + encodeURIComponent(lines.join('\n'));
  };

  // A redirect/query string alone is not evidence of acceptance or delivery.
  const params = new URLSearchParams(location.search);
  if (params.has('sent') || params.has('inquiry_return')) {
    const pending = readPending();
    const returned = params.get('inquiry_return');
    if (pending && pending.reference === returned && Date.now() - pending.createdAt < 60 * 60 * 1000) {
      reference = pending.reference;
      getReference();
      status.textContent = 'You have returned from verification. Keep your reference and check the confirmation shown by the form service. If acceptance was unclear, email Alan directly; this page cannot confirm inbox delivery.';
    } else {
      status.textContent = 'This link does not confirm an inquiry was sent. Please complete the form below, or email Alan directly.';
    }
    clearPending();
    params.delete('sent');
    params.delete('inquiry_return');
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + '#book');
  }

  form.addEventListener('input', updateEmailLink);
  form.addEventListener('change', updateEmailLink);

  const sendWithVerification = () => {
    if (busy || !form.reportValidity()) return;
    getReference();
    updateEmailLink();
    const setHidden = (name, value) => {
      let input = form.querySelector('[name="' + name + '"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        form.append(input);
      }
      input.value = value;
    };
    // One user action, one native POST. No background AJAX request or auto-replay.
    form.querySelectorAll('[name="_honey"], [name="contact_website_check"]').forEach(input => { input.disabled = true; });
    setHidden('_captcha', 'true');
    setHidden('_subject', 'New session inquiry — ' + reference);
    setHidden('_url', 'https://alanscinematics.com/');
    setHidden('inquiry_reference', reference);
    setHidden('submitted_at', new Date().toISOString());
    setHidden('_next', 'https://alanscinematics.com/?inquiry_return=' + encodeURIComponent(reference) + '#book');
    try { sessionStorage.setItem(pendingKey, JSON.stringify({ reference, createdAt: Date.now() })); } catch {}
    setBusy(true);
    status.classList.remove('err');
    status.textContent = 'Opening verification. Complete the steps on FormSubmit to finish sending.';
    clearTimeout(verificationTimer);
    verificationTimer = setTimeout(() => {
      if (busy) failure('VERIFICATION_NOT_OPENED', 'Verification has not opened yet. We cannot confirm this inquiry was sent.');
    }, 20000);
    try { HTMLFormElement.prototype.submit.call(form); }
    catch {
      clearTimeout(verificationTimer);
      failure('VERIFICATION_UNAVAILABLE', 'We could not open the verification service.');
    }
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    sendWithVerification();
  });
  verify.addEventListener('click', sendWithVerification);

  // Back navigation must not leave the form permanently disabled.
  window.addEventListener('pageshow', () => {
    clearTimeout(verificationTimer);
    if (!form.querySelector('.f-submit')) return;
    setBusy(false);
    form.querySelectorAll('[name="contact_website_check"]').forEach(input => { input.disabled = false; });
  });
  document.querySelectorAll('[data-session]').forEach(link => link.addEventListener('click', () => {
    const values = { portraits: 'Portraits / Grads — from $350', couples: 'Couples — from $400', families: 'Families — from $500' };
    const select = form.querySelector('#f-session');
    if (select && values[link.dataset.session]) select.value = values[link.dataset.session];
    updateEmailLink();
  }));
  const date = form.querySelector('#f-date');
  if (date) {
    const today = new Date();
    date.min = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  }
  updateEmailLink();
})();
