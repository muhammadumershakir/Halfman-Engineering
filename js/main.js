/* ==========================================================================
   HALFMAN ENGINEERING — shared site behaviour
   Header state, mobile navigation, scroll reveal, stat counters,
   FAQ accordion, product filter, contact form validation, image fallback.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navClose = document.querySelector('.nav-panel-close');
  var navPanel = document.querySelector('.nav-panel');
  var body = document.body;
  var lastFocused = null;

  function openNav() {
    lastFocused = document.activeElement;
    body.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navPanel.removeAttribute('hidden');
    var firstLink = navPanel.querySelector('a, button');
    if (firstLink) firstLink.focus();
    document.addEventListener('keydown', trapKeydown);
  }
  function closeNav() {
    body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trapKeydown);
    setTimeout(function () {
      if (!body.classList.contains('nav-open')) navPanel.setAttribute('hidden', '');
    }, 340);
    if (lastFocused) lastFocused.focus();
  }
  function trapKeydown(e) {
    if (e.key === 'Escape') { closeNav(); return; }
    if (e.key !== 'Tab') return;
    var focusable = navPanel.querySelectorAll('a, button');
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (navToggle && navPanel) {
    navPanel.setAttribute('hidden', '');
    navToggle.addEventListener('click', function () {
      body.classList.contains('nav-open') ? closeNav() : openNav();
    });
    if (navClose) navClose.addEventListener('click', closeNav);
    navPanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Stat counters ---------- */
  var statNums = document.querySelectorAll('.stat .num[data-count-to]');
  if (statNums.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    var counted = new WeakSet();
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        animateCount(entry.target);
      });
    }, { threshold: 0.5 });
    statNums.forEach(function (el) { statIo.observe(el); });
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    var suffixEl = el.querySelector('.plus');
    var duration = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.firstChild.nodeValue = value;
      if (progress < 1) requestAnimationFrame(step);
    }
    el.textContent = '';
    var textNode = document.createTextNode('0');
    el.appendChild(textNode);
    if (suffixEl) el.appendChild(suffixEl);
    requestAnimationFrame(step);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(function (other) {
        other.setAttribute('data-open', 'false');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
      q.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  /* ---------- Product filter ---------- */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var buttons = filterBar.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('[data-product-grid] .product-card');
    var emptyState = document.querySelector('[data-filter-empty]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        var filter = btn.getAttribute('data-filter');
        var visibleCount = 0;
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });
        if (emptyState) emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var statusBox = form.querySelector('.form-status');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setFieldError(field, message) {
      var wrap = field.closest('.field');
      var errorEl = wrap.querySelector('.field-error');
      if (message) {
        wrap.setAttribute('data-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
      } else {
        wrap.setAttribute('data-invalid', 'false');
        if (errorEl) errorEl.textContent = '';
        field.removeAttribute('aria-invalid');
      }
    }

    function validateField(field) {
      var value = field.value.trim();
      if (field.hasAttribute('required') && !value) {
        setFieldError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && value && !emailPattern.test(value)) {
        setFieldError(field, 'Please enter a valid email address.');
        return false;
      }
      setFieldError(field, '');
      return true;
    }

    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input, textarea');
      var valid = true;
      fields.forEach(function (field) { if (!validateField(field)) valid = false; });

      var statusText = statusBox.querySelector('span');
      statusBox.classList.remove('show', 'success', 'error');

      if (!valid) {
        statusText.textContent = 'Please correct the highlighted fields before submitting.';
        statusBox.classList.add('show', 'error');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* --------------------------------------------------------------------
         No backend / email service is connected yet.
         Replace this block with a real submission, e.g.:

         fetch('/api/contact', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(Object.fromEntries(new FormData(form)))
         })
           .then(function (res) { if (!res.ok) throw new Error('Request failed'); })
           .then(function () { showSuccess(); })
           .catch(function () { showError(); });
      -------------------------------------------------------------------- */
      showSuccess();

      function showSuccess() {
        statusText.textContent = 'Thank you — your inquiry has been prepared. Our team will get back to you shortly. (Demo form: connect a backend or form service to send this live.)';
        statusBox.classList.add('show', 'success');
        form.reset();
      }
    });
  }

  /* ---------- Image fallback (branded placeholder on load failure) ---------- */
  function fallbackSVG(label) {
    var safeLabel = (label || 'Image Placeholder').toString();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
      '<rect width="800" height="600" fill="#0f1520"/>' +
      '<defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">' +
      '<path d="M40 0H0V40" fill="none" stroke="#1c2431" stroke-width="1"/></pattern></defs>' +
      '<rect width="800" height="600" fill="url(#g)"/>' +
      '<path d="M40 40H120M40 40V120" stroke="#3E6BFF" stroke-width="2" fill="none" opacity="0.6"/>' +
      '<path d="M760 560H680M760 560V480" stroke="#3E6BFF" stroke-width="2" fill="none" opacity="0.6"/>' +
      '<circle cx="400" cy="270" r="34" fill="none" stroke="#5c6577" stroke-width="2"/>' +
      '<path d="M400 240v-16M400 300v16M370 270h-16M430 270h16" stroke="#5c6577" stroke-width="2"/>' +
      '<text x="400" y="360" font-family="Arial, sans-serif" font-size="17" fill="#8891a1" text-anchor="middle" letter-spacing="1">' +
      escapeXML(safeLabel) + '</text>' +
      '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  function escapeXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function handler() {
      img.removeEventListener('error', handler);
      img.src = fallbackSVG(img.getAttribute('data-fallback'));
      img.classList.add('img-fallback-svg');
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
