(() => {
  'use strict';
  const data = window.funeral || {};
  const el = (id) => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'noko-memorial:' + (data.memorialId || [data.name, data.birthDate, data.passingDate, location.pathname].join('|'));
  const read = (key) => { try { return localStorage.getItem(storageKey + ':' + key) || ''; } catch { return ''; } };
  const write = (key, value) => { try { localStorage.setItem(storageKey + ':' + key, value); return true; } catch { return false; } };
  const openDialog = (id, trigger) => {
    const dialog = el(id);
    if (!dialog.open) { dialog.returnFocus = trigger || document.activeElement; dialog.showModal(); }
  };
  document.querySelectorAll('dialog').forEach((dialog) => {
    const heading = dialog.querySelector('h2');
    if (heading) { heading.id = dialog.id + '-heading'; dialog.setAttribute('aria-labelledby', heading.id); }
    dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => { dialog.returnFocus?.focus({ preventScroll: true }); });
  });
  const setMotion = (paused) => {
    document.documentElement.classList.toggle('motion-paused', paused);
    el('motion').setAttribute('aria-pressed', String(paused));
    el('motion').setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
    el('motion').title = paused ? 'Resume animations' : 'Pause animations';
    el('motion').textContent = paused ? '\u25b7' : '\u2161';
  };
  setMotion(reducedMotion.matches || read('motion') === 'paused');
  el('motion').addEventListener('click', () => {
    const paused = !document.documentElement.classList.contains('motion-paused');
    setMotion(paused); write('motion', paused ? 'paused' : 'playing');
  });
  reducedMotion.addEventListener('change', () => setMotion(reducedMotion.matches));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.remove('waiting'); observer.unobserve(entry.target); } });
    }, { threshold: .1 });
    document.querySelectorAll('.reveal').forEach((item) => { item.classList.add('waiting'); observer.observe(item); });
    const chapters = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) document.querySelectorAll('.section-nav a').forEach((link) => { if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); });
    }, { rootMargin: '-15% 0px -50% 0px' });
    ['remembrance', 'arrangements', 'programme'].forEach((id) => chapters.observe(el(id)));
  }
  let frame = false;
  const progress = document.querySelector('.reading-progress');
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (height > 0 ? Math.min(100, scrollY / height * 100) : 0) + '%';
    document.body.classList.toggle('tools-visible', scrollY > document.querySelector('.memorial').offsetHeight);
    frame = false;
  };
  addEventListener('scroll', () => { if (!frame) { frame = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  addEventListener('resize', updateProgress); updateProgress();
  el('programme-modal-list').replaceChildren(el('programme-list').cloneNode(true));
  el('programme-modal-list').firstElementChild.removeAttribute('id');
  el('programme-open').addEventListener('click', (event) => openDialog('programme-dialog', event.currentTarget));
  const localPreview = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (localPreview) {
    el('whatsapp-share').hidden = true;
    el('share-status').textContent = 'This is a local preview. Host the page at a public web address before sharing it with family.';
  } else {
    const text = 'In loving memory' + (data.name ? ' of ' + data.name : '') + '. A remembrance by Noko Funerals. ' + location.href.split('#')[0];
    el('whatsapp-share').href = 'https://wa.me/?text=' + encodeURIComponent(text);
  }
  ['share', 'share-top', 'floating-share'].forEach((id) => el(id).addEventListener('click', (event) => openDialog('share-dialog', event.currentTarget)));
  const safePhoto = (value) => {
    if (!value || !String(value).trim()) return null;
    try { const url = new URL(value, location.href); if (url.protocol === 'https:' || (url.origin === location.origin && ['file:', 'http:'].includes(url.protocol))) return url.href; } catch { /* Leave invalid photos out of the album. */ }
    return null;
  };
  const photos = [];
  if (safePhoto(data.photo)) photos.push({ src: safePhoto(data.photo), caption: data.name || 'In loving memory' });
  (Array.isArray(data.gallery) ? data.gallery : []).forEach((item) => { const src = safePhoto(item.src); if (src) photos.push({ src, caption: item.caption || 'A treasured moment', fit: item.fit }); });
  let photoIndex = 0;
  const renderPhoto = () => {
    const photo = photos[photoIndex]; if (!photo) return;
    el('lightbox-photo').src = photo.src; el('lightbox-photo').alt = photo.caption;
    el('lightbox-caption').textContent = photo.caption;
    el('photo-counter').textContent = (photoIndex + 1) + ' / ' + photos.length;
    el('photo-prev').hidden = el('photo-next').hidden = photos.length < 2;
  };
  const viewPhoto = (index, trigger) => { photoIndex = index; renderPhoto(); openDialog('photo-dialog', trigger); };
  if (photos.length) {
    if (safePhoto(data.photo)) {
      const revealPortraitButton = () => { el('portrait-open').hidden = false; };
      el('photo').addEventListener('load', revealPortraitButton);
      if (el('photo').complete && el('photo').naturalWidth) revealPortraitButton();
      el('portrait-open').addEventListener('click', (event) => viewPhoto(0, event.currentTarget));
    }
    if (photos.length) {
      el('gallery').hidden = false;
      photos.forEach((photo, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-item'; button.setAttribute('aria-label', 'View photograph: ' + photo.caption);
        const image = document.createElement('img'); image.src = photo.src; image.alt = photo.caption; image.loading = 'lazy';
        if (photo.fit === 'contain') button.classList.add('full-photograph');
        image.addEventListener('error', () => { button.hidden = true; });
        const caption = document.createElement('span'); caption.textContent = photo.caption;
        button.append(image, caption); button.addEventListener('click', () => viewPhoto(index, button));
        if (index === 0 && safePhoto(data.photo)) el('gallery-grid').append(button);
        else { el('memories-album').hidden = false; el('memories-grid').append(button); }
      });
    }
  }
  el('lightbox-photo').addEventListener('error', () => { el('lightbox-caption').textContent = 'This photograph could not be loaded.'; });
  const stepPhoto = (direction) => { if (photos.length) { photoIndex = (photoIndex + direction + photos.length) % photos.length; renderPhoto(); } };
  el('photo-prev').addEventListener('click', () => stepPhoto(-1)); el('photo-next').addEventListener('click', () => stepPhoto(1));
  el('photo-dialog').addEventListener('keydown', (event) => { if (event.key === 'ArrowRight') { event.preventDefault(); stepPhoto(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); stepPhoto(-1); } });
  // Show the dedication once per tab, without interrupting direct links to arrangements.
  let welcomeSeen = false;
  try { welcomeSeen = sessionStorage.getItem(storageKey + ':welcomed') === 'yes'; } catch { /* The page remains usable without storage. */ }
  if (!location.hash && !welcomeSeen) openDialog('welcome-dialog');
  el('welcome-dialog').addEventListener('close', () => {
    try { sessionStorage.setItem(storageKey + ':welcomed', 'yes'); } catch { /* No persistence required. */ }
    document.querySelectorAll('.entrance').forEach((item) => { item.style.animation = 'none'; });
    requestAnimationFrame(() => document.querySelectorAll('.entrance').forEach((item) => { item.style.animation = ''; }));
  });
})();
