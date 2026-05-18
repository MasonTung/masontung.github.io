/* ===========================================================================
   Site behavior — extracted from inline <script> for caching & maintainability.
   Modules are self-contained IIFEs; each early-returns if its DOM is missing.
=========================================================================== */
(function () {
  'use strict';

  const root = document.documentElement;

  // ---------------------------------------------------------------------------
  // Theme: persist user choice; fall back to system preference on first visit
  // ---------------------------------------------------------------------------
  (function () {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // The inline <head> script already applied any stored theme to avoid FOUC.
    // Here we just react to clicks and persist the change.
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (_) {}
    });
  })();

  // ---------------------------------------------------------------------------
  // Sticky nav: subtle background once the page has scrolled
  // ---------------------------------------------------------------------------
  (function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  // ---------------------------------------------------------------------------
  // Mobile nav: hamburger toggles a drop-down on narrow viewports.
  // The button is hidden by CSS above 760px, so this is essentially a no-op
  // on desktop.
  // ---------------------------------------------------------------------------
  (function () {
    const toggle = document.getElementById('nav-toggle');
    const groups = document.querySelector('.nav-groups');
    if (!toggle || !groups) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? close() : open();
    });

    // Close when any nav link is tapped (mobile flow)
    groups.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });

    // Close on Escape, or when viewport widens past mobile breakpoint
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) close();
    });
    const mq = window.matchMedia('(min-width: 761px)');
    const onMQ = () => { if (mq.matches) close(); };
    mq.addEventListener ? mq.addEventListener('change', onMQ) : mq.addListener(onMQ);
  })();

  // ---------------------------------------------------------------------------
  // Gallery lightbox: prev/next, keyboard, swipe, focus management
  // ---------------------------------------------------------------------------
  (function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const counter = document.getElementById('lightbox-counter');
    if (!lightbox || !lightboxImg) return;

    const items = Array.from(document.querySelectorAll('.gallery-grid img'));
    if (!items.length) return;

    let index = 0;
    let lastTrigger = null;

    function show(i) {
      index = (i + items.length) % items.length;
      const img = items[index];
      lightboxImg.classList.remove('ready');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      counter.textContent = (index + 1) + ' / ' + items.length;
      const reveal = () => lightboxImg.classList.add('ready');
      if (lightboxImg.decode) lightboxImg.decode().then(reveal).catch(reveal);
      else lightboxImg.addEventListener('load', reveal, { once: true });
      // Preload neighbours
      [-1, 1].forEach((d) => {
        const n = items[(index + d + items.length) % items.length];
        if (n) { const p = new Image(); p.src = n.src; }
      });
    }

    function openLightbox(i, trigger) {
      lastTrigger = trigger || null;
      show(i);
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Move keyboard focus into the dialog so subsequent Tab cycles inside
      setTimeout(() => closeBtn && closeBtn.focus(), 0);
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    items.forEach((img, i) => {
      const fig = img.parentElement;
      fig.addEventListener('click', () => openLightbox(i, fig));
      // Make figures keyboard-activatable
      if (!fig.hasAttribute('tabindex')) fig.setAttribute('tabindex', '0');
      if (!fig.hasAttribute('role')) fig.setAttribute('role', 'button');
      fig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i, fig);
        }
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
    });
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'Tab') {
        // Simple focus trap: cycle between the three buttons
        const focusables = [closeBtn, prevBtn, nextBtn];
        const i = focusables.indexOf(document.activeElement);
        if (i === -1) { closeBtn.focus(); e.preventDefault(); return; }
        const dir = e.shiftKey ? -1 : 1;
        const next = focusables[(i + dir + focusables.length) % focusables.length];
        next.focus();
        e.preventDefault();
      }
    });

    // Touch swipe (horizontal)
    let touchX = null;
    lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
  })();

  // ---------------------------------------------------------------------------
  // Visual Design: click a card → animated inline expand
  // Supports two data shapes (see HTML comments for full schema):
  //   single piece: { title, year, meta, brief, body: [paragraphs] }
  //   series:       { title, year, meta, brief, chapters: [{image, alt, title, body}] }
  // Series cards get the stacked-paper visual treatment via .vd-item--stack.
  // ---------------------------------------------------------------------------
  (function () {
    const grid = document.getElementById('vd-grid');
    if (!grid) return;

    const escapeHTML = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // Tag series cards up-front so CSS can render the stack
    grid.querySelectorAll('.vd-item').forEach((item) => {
      const dataEl = item.querySelector('.vd-data');
      if (!dataEl) return;
      try {
        const d = JSON.parse(dataEl.textContent);
        if (Array.isArray(d.chapters) && d.chapters.length > 1) {
          item.classList.add('vd-item--stack');
          item.style.setProperty('--vd-stack-count', Math.min(d.chapters.length, 4));
        }
      } catch (_) {}
    });

    let openItem = null;
    let wrap = null;
    let animating = false;

    function chapterHTML(ch, idx) {
      const body = (ch.body || []).map((p) => `<p>${escapeHTML(p)}</p>`).join('');
      return `
        <article class="vd-chapter">
          <div class="vd-chapter-num">Ch.${String(idx + 1).padStart(2, '0')}</div>
          <div class="vd-chapter-img">
            <img src="${ch.image}" alt="${escapeHTML(ch.alt || ch.title || '')}" loading="lazy" decoding="async" />
          </div>
          <div class="vd-chapter-body">
            ${ch.title ? `<h4>${escapeHTML(ch.title)}</h4>` : ''}
            ${body}
          </div>
        </article>`;
    }

    function buildWrap(data, fallbackImg, fallbackAlt) {
      const w = document.createElement('div');
      w.className = 'vd-panel-wrap';

      const isSeries = Array.isArray(data.chapters) && data.chapters.length > 0;
      const heroImg = isSeries ? data.chapters[0].image : fallbackImg;
      const heroAlt = isSeries ? (data.chapters[0].alt || data.title) : fallbackAlt;

      const meta = [data.year, data.meta].filter(Boolean).join(' · ');
      const header = `
        <header class="vd-panel-head">
          <button type="button" class="vd-panel-close" aria-label="Close">×</button>
          <p class="vd-panel-meta">${escapeHTML(meta)}${isSeries ? ` · <span class="vd-panel-count">${data.chapters.length} chapters</span>` : ''}</p>
          <h3>${escapeHTML(data.title || '')}</h3>
          ${data.brief ? `<p class="vd-panel-brief">${escapeHTML(data.brief)}</p>` : ''}
        </header>`;

      const main = isSeries
        ? `<div class="vd-chapters">${data.chapters.map(chapterHTML).join('')}</div>`
        : `
          <div class="vd-panel-single">
            <div class="vd-panel-img">
              <img src="${heroImg}" alt="${escapeHTML(heroAlt || '')}" loading="lazy" decoding="async" />
            </div>
            <div class="vd-panel-body">
              ${(data.body || []).map((p) => `<p>${escapeHTML(p)}</p>`).join('')}
            </div>
          </div>`;

      w.innerHTML = `<div class="vd-panel-inner"><div class="vd-panel">${header}${main}</div></div>`;
      return w;
    }

    // Resolve once either the transition completes or a safety timeout fires.
    function transitionOnce(el, prop, timeoutMs) {
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          el.removeEventListener('transitionend', onEnd);
          resolve();
        };
        const onEnd = (ev) => {
          if (ev.target === el && ev.propertyName === prop) finish();
        };
        el.addEventListener('transitionend', onEnd);
        setTimeout(finish, timeoutMs);
      });
    }

    async function closeOpen({ scrollToItem = false } = {}) {
      if (!wrap || !openItem || animating) return;
      const closingWrap = wrap;
      const closingItem = openItem;
      animating = true;
      closingWrap.classList.remove('is-open');
      const thumb = closingItem.querySelector('.vd-thumb');
      if (thumb) thumb.setAttribute('aria-expanded', 'false');

      await transitionOnce(closingWrap, 'grid-template-rows', 600);

      if (closingWrap.parentNode) closingWrap.parentNode.removeChild(closingWrap);
      if (wrap === closingWrap) { wrap = null; openItem = null; }
      animating = false;
      if (scrollToItem) {
        closingItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (thumb) thumb.focus();
      }
    }

    async function openFor(item) {
      if (animating) return;
      const dataEl = item.querySelector('.vd-data');
      if (!dataEl) return;
      let data;
      try { data = JSON.parse(dataEl.textContent); } catch (_) { return; }

      if (openItem && openItem !== item) await closeOpen();

      const thumb = item.querySelector('.vd-thumb');
      const imgEl = thumb && thumb.querySelector('img');
      const newWrap = buildWrap(
        data,
        imgEl ? imgEl.getAttribute('src') : '',
        imgEl ? (imgEl.alt || '') : ''
      );

      item.insertAdjacentElement('afterend', newWrap);
      wrap = newWrap;
      openItem = item;
      if (thumb) thumb.setAttribute('aria-expanded', 'true');

      animating = true;
      // Two rAFs guarantee the initial 0fr/opacity:0 state is rendered first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => newWrap.classList.add('is-open'));
      });

      await transitionOnce(newWrap, 'grid-template-rows', 600);
      animating = false;

      // Bring the panel into a comfortable viewport position
      const top = newWrap.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    // Single click delegate — the panel wrap is inserted inside .vd-grid, so
    // its close button bubbles here too.
    grid.addEventListener('click', (e) => {
      if (e.target.closest('.vd-panel-close')) {
        closeOpen({ scrollToItem: true });
        return;
      }
      const thumb = e.target.closest('.vd-thumb');
      if (!thumb) return;
      const item = thumb.closest('.vd-item');
      if (!item) return;
      if (openItem === item) closeOpen({ scrollToItem: true });
      else openFor(item);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && openItem) closeOpen({ scrollToItem: true });
    });
  })();

  // ---------------------------------------------------------------------------
  // WeChat copy: clipboard API with execCommand fallback
  // ---------------------------------------------------------------------------
  (function () {
    const toastEl = document.getElementById('toast');
    let tid;
    function toast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(tid);
      tid = setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
        return ok;
      }
    }

    document.querySelectorAll('[data-wechat]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const name = btn.dataset.wechat;
        const ok = await copyText(name);
        toast(ok ? `已复制公众号「${name}」· 请在微信中搜索`
                 : `公众号「${name}」· 请在微信中搜索`);
      });
    });
  })();
})();
