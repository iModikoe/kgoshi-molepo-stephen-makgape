(() => {
  'use strict';
  const data = window.funeral || {};
  const byId = (id) => document.getElementById(id);
  const put = (id, value) => { if (value) byId(id).textContent = value; };
  const parseDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const date = new Date(value + 'T12:00:00+02:00');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
  };
  const format = (date, options) => new Intl.DateTimeFormat('en-ZA', { timeZone: 'Africa/Johannesburg', ...options }).format(date);
  const safeAsset = (value) => {
    if (!value || !String(value).trim()) return null;
    try {
      const url = new URL(value, location.href);
      if (url.protocol === 'https:' || (url.origin === location.origin && ['http:', 'file:'].includes(url.protocol))) return url.href;
    } catch { /* Invalid optional assets stay hidden. */ }
    return null;
  };
  const showLink = (id, url) => {
    if (!url) return;
    byId(id).href = url;
    byId(id).hidden = false;
  };
  const maps = (venue, address) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([venue, address].filter(Boolean).join(', '));
  const service = data.service || {};
  put('name', data.name);
  put('dedication', data.dedication);
  put('tribute', data.remembrance);
  put('signature', data.signature);
  put('obituary-closing', data.obituaryClosing);
  put('family-note', data.familyNote);
  put('noko-salutation', data.nokoTribute?.salutation);
  put('noko-message', data.nokoTribute?.message);
  if (Array.isArray(data.obituary) && data.obituary.length) {
    byId('obituary-copy').replaceChildren(...data.obituary.map((text) => {
      const paragraph = document.createElement('p'); paragraph.textContent = text; return paragraph;
    }));
  } else byId('obituary').hidden = true;
  document.title = (data.name || 'In Loving Memory') + ' | Noko Family Link';
  const birth = parseDate(data.birthDate), passing = parseDate(data.passingDate);
  if (birth || passing) put('life-dates', [birth ? format(birth, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date of birth to be confirmed', passing ? format(passing, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date of passing to be confirmed'].join(' \u2014 '));
  const photo = safeAsset(data.photo);
  if (photo) {
    const image = byId('photo');
    image.addEventListener('load', () => { image.hidden = false; byId('photo-placeholder').hidden = true; });
    image.alt = data.name ? 'In loving memory of ' + data.name : 'Memorial portrait';
    image.src = photo;
  }
  const date = parseDate(service.date);
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');
  const noticeDate = (value) => { const parsed = parseDate(value); return parsed ? format(parsed, { day: '2-digit', month: 'long', year: 'numeric' }) : 'Date to be confirmed'; };
  put('notice-name', data.name);
  if (Array.isArray(data.nameLines) && data.nameLines.length) {
    byId('notice-name').replaceChildren(...data.nameLines.map((line, index) => {
      const part = document.createElement(index === data.nameLines.length - 1 ? 'em' : 'span');
      part.style.display = 'block'; part.textContent = line; return part;
    }));
  }
  put('notice-birth', noticeDate(data.birthDate));
  put('notice-passing', noticeDate(data.passingDate));
  put('notice-burial', noticeDate(data.burial?.date));
  put('notice-tribute', data.tribute);
  const populateNoticeService = (prefix, details, label) => {
    const date = parseDate(details.date);
    put(prefix + '-heading', label + (date ? ', ' + format(date, { weekday: 'long' }) : ''));
    put(prefix + '-date', noticeDate(details.date));
    put(prefix + '-address', [details.venue, details.address].filter(Boolean).join(', ') || 'Venue to be confirmed');
    const time = validTime(details.time) ? details.time : null;
    put(prefix + '-time', time ? String(Number(time.slice(0, 2)) % 12 || 12).padStart(2, '0') + ':' + time.slice(3) + (Number(time.slice(0, 2)) < 12 ? ' am' : ' pm') : 'Time to be confirmed');
  };
  populateNoticeService('notice-memorial', data.memorialService || {}, 'Memorial Service');
  populateNoticeService('notice-service', service, 'Funeral Service');
  if (date) {
    put('date-day', format(date, { day: '2-digit' }));
    put('date-month', format(date, { month: 'long', year: 'numeric' }));
    put('date-weekday', format(date, { weekday: 'long' }));
  }
  put('venue', service.venue);
  put('address', service.address);
  byId('address').hidden = !service.address;
  if (validTime(service.time)) put('time', service.time + ' SAST');
  if (service.venue || service.address) showLink('directions', maps(service.venue, service.address));
  if (data.burial?.venue) {
    byId('burial').hidden = false;
    put('burial-name', data.burial.venue);
    put('burial-address', data.burial.address);
    byId('burial-directions').hidden = !data.burial.address;
    if (data.burial.address) showLink('burial-directions', maps(data.burial.venue, data.burial.address));
  }
  if (Array.isArray(data.programme) && data.programme.some((item) => item.title)) {
    byId('programme-list').replaceChildren();
    data.programme.filter((item) => item.title).forEach((item) => {
      const row = document.createElement('div'); row.className = 'programme-row';
      const time = document.createElement('time'); time.textContent = item.time || '';
      const title = document.createElement('span'); title.textContent = item.title;
      row.append(time, title); byId('programme-list').append(row);
    });
  }
  const programmeUrl = safeAsset(data.programmeUrl);
  showLink('programme-download', programmeUrl);
  if (programmeUrl) {
    showLink('programme-pdf-open', programmeUrl);
    showLink('programme-pdf-save', programmeUrl);
    byId('programme-file-actions').hidden = false;
    byId('programme-dialog').classList.add('has-programme');
    if (!data.programme?.length) byId('programme-list').replaceChildren();
    const pages = (Array.isArray(data.programmePages) ? data.programmePages : []).map(safeAsset).filter(Boolean);
    pages.forEach((src, index) => {
      const page = document.createElement('img'); page.src = src; page.alt = 'Funeral programme, page ' + (index + 1) + ' of ' + pages.length;
      page.loading = 'lazy'; page.addEventListener('error', () => { page.hidden = true; }); byId('programme-pages').append(page);
    });
    if (pages.length) {
      const preview = document.createElement('button'); preview.type = 'button'; preview.className = 'programme-cover'; preview.setAttribute('aria-label', 'View the complete funeral programme');
      const cover = document.createElement('img'); cover.src = pages[0]; cover.alt = 'Cover of the funeral programme for ' + data.name; cover.loading = 'lazy';
      const caption = document.createElement('span'); caption.textContent = 'View the complete programme ';
      caption.append(document.querySelector('.arrow-up-right').cloneNode(true));
      preview.append(cover, caption); preview.addEventListener('click', () => byId('programme-open').click()); byId('programme-list').append(preview);
    }
  }
  const announce = (message) => { byId('status').textContent = message; byId('share-status').textContent = message; };
  const shareUrl = () => {
    if (location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
      announce('This is a local preview. A public web address is needed before sharing with family.');
      return null;
    }
    return location.href.split('#')[0];
  };
  const copy = async () => {
    const url = shareUrl(); if (!url) return;
    try { await navigator.clipboard.writeText(url); announce('Link copied. Ready to share with family and friends.'); }
    catch { announce('Copy this address to share: ' + url); }
  };
  const share = async () => {
    const url = shareUrl(); if (!url) return;
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({ title: document.title, text: data.name ? 'In loving memory of ' + data.name + '. Funeral arrangements for family and friends.' : 'Funeral arrangements for family and friends.', url }); }
    catch (error) { if (error.name !== 'AbortError') await copy(); }
  };
  byId('native-share').addEventListener('click', share);
  byId('copy').addEventListener('click', copy);
  if (date && validTime(service.time)) {
    byId('calendar').hidden = false;
    byId('calendar').addEventListener('click', () => {
      const escape = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
      const start = new Date(service.date + 'T' + service.time + ':00+02:00');
      let end = validTime(service.endTime) ? new Date(service.date + 'T' + service.endTime + ':00+02:00') : new Date(start.getTime() + 2 * 60 * 60 * 1000);
      if (end <= start) end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noko Funerals//Family Link//EN', 'BEGIN:VEVENT', 'UID:' + service.date + '-' + encodeURIComponent(data.name || 'memorial') + '@noko-family-link', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end), 'SUMMARY:' + escape('Funeral service: ' + (data.name || 'In loving memory')), 'LOCATION:' + escape([service.venue, service.address].filter(Boolean).join(', ')), 'DESCRIPTION:' + escape(data.familyNote), 'END:VEVENT', 'END:VCALENDAR'];
      // Fold by UTF-8 bytes so long names and addresses remain valid iCalendar.
      const encoder = new TextEncoder();
      const folded = lines.map((line) => { let out = '', bytes = 0; for (const char of line) { const length = encoder.encode(char).length; if (bytes + length > 75) { out += '\r\n '; bytes = 1; } out += char; bytes += length; } return out; });
      const url = URL.createObjectURL(new Blob([folded.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'funeral-service.ics'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
})();
