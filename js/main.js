/* ==========================================================================
   HALFMAN ENGINEERING - High-Performance Interactive Experience Engine
   - Ultra-Fast & Zero Lag (No Heavy WebGL or Canvas Loops)
   - Real OEM Component Hero Spotlight Switcher
   - 3D Perspective Rotating Parts Carousel (Coverflow Slider)
   - Client Logos Infinite Marquee Controller
   - Native Instant & High-Speed Scrolling (Zero Lag)
   - Formspree AJAX Submission, FAQ Accordion, Mobile Nav
   ========================================================================== */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



  /* ==========================================================================
     2. HERO OEM COMPONENT SPOTLIGHT SWITCHER
     ========================================================================== */
  function initHeroSpotlight() {
    var stage = document.querySelector('.mfg-spotlight-card');
    if (!stage) return;

    var items = stage.querySelectorAll('.mfg-spotlight-item');
    var tabs = stage.querySelectorAll('.mfg-tab-btn');
    var badge = document.getElementById('mfgSpotlightBadge');
    var specReadout = document.getElementById('mfgSpecReadout');
    var coordReadout = document.getElementById('mfgCoordReadout');

    if (!items.length || !tabs.length) return;

    var spotData = [
      {
        badge: 'PART // TAIL-END-01',
        spec: 'PROCESS: HYDRAULIC FORMING \u00b7 SPCC CR STEEL',
        coord: 'SPEC // 500T HYD \u00b7 D2 STEEL \u00b7 \u00b10.01MM'
      },
      {
        badge: 'PART // PEDAL-BRKT-R',
        spec: 'PROCESS: ROBOTIC SPOT WELDING \u00b7 CRITICAL SAFETY',
        coord: 'SPEC // RESISTANCE SPOT WELD \u00b7 \u00b10.01MM'
      },
      {
        badge: 'TOOL // FORM-DIE-X4',
        spec: 'PROCESS: CNC WIRE CUT & TOOLING \u00b7 D2 DIE STEEL',
        coord: 'SPEC // PROGRESSIVE DIE \u00b7 100K STROKES'
      }
    ];

    var currentIndex = 0;
    var autoTimer = null;

    function setSpot(index) {
      currentIndex = index;
      items.forEach(function (el, i) {
        el.classList.toggle('active', i === index);
      });
      tabs.forEach(function (btn, i) {
        btn.classList.toggle('active', i === index);
        btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });

      if (spotData[index]) {
        if (badge) badge.textContent = spotData[index].badge;
        if (specReadout) specReadout.textContent = spotData[index].spec;
        if (coordReadout) coordReadout.textContent = spotData[index].coord;
      }
    }

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = parseInt(btn.getAttribute('data-target'), 10) || 0;
        setSpot(target);
        resetAuto();
      });
    });

    function nextSpot() {
      var next = (currentIndex + 1) % items.length;
      setSpot(next);
    }

    function startAuto() {
      if (prefersReducedMotion) return;
      autoTimer = setInterval(nextSpot, 4200);
    }

    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
    }

    function resetAuto() {
      stopAuto();
      startAuto();
    }

    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);
    startAuto();
  }
  initHeroSpotlight();

  /* ==========================================================================
     3. MANUFACTURED PORTFOLIO - NORMAL HIGH-DEFINITION SLIDER
     ========================================================================== */
  function initMfgNormalSlider() {
    var slider = document.getElementById('mfgNormalSlider');
    if (!slider) return;

    var track = document.getElementById('mfgSliderTrack');
    var originalSlides = Array.prototype.slice.call(slider.querySelectorAll('.mfg-slider-slide'));
    var dots = slider.querySelectorAll('.mfg-dot');
    var prevBtn = document.getElementById('mfgSliderPrev');
    var nextBtn = document.getElementById('mfgSliderNext');

    if (!track || originalSlides.length < 2) return;

    var totalReal = originalSlides.length;
    var isTransitioning = false;
    var autoInterval = null;

    // Clone first and last slide for true infinite continuous forward/backward loop
    var firstClone = originalSlides[0].cloneNode(true);
    firstClone.classList.add('mfg-slide-clone');
    firstClone.setAttribute('aria-hidden', 'true');

    var lastClone = originalSlides[totalReal - 1].cloneNode(true);
    lastClone.classList.add('mfg-slide-clone');
    lastClone.setAttribute('aria-hidden', 'true');

    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    // Position indices:
    // 0: lastClone (slide 2)
    // 1: originalSlides[0] (slide 0)
    // 2: originalSlides[1] (slide 1)
    // 3: originalSlides[2] (slide 2)
    // 4: firstClone (slide 0)
    var currentPos = 1;

    // Initialize track position at first real slide
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + (currentPos * 100) + '%)';

    function updateDots(realIdx) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === realIdx);
      });
    }
    updateDots(0);

    function moveTo(pos, animated) {
      if (animated !== false) {
        track.style.transition = 'transform 0.46s cubic-bezier(0.25, 1, 0.5, 1)';
      } else {
        track.style.transition = 'none';
      }
      currentPos = pos;
      track.style.transform = 'translateX(-' + (currentPos * 100) + '%)';

      var realIdx = (currentPos - 1 + totalReal) % totalReal;
      updateDots(realIdx);
    }

    function nextSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      moveTo(currentPos + 1, true);
    }

    function prevSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      moveTo(currentPos - 1, true);
    }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      isTransitioning = false;

      // If we reached the clone of first slide (past the end), seamlessly snap to real slide 0
      if (currentPos >= totalReal + 1) {
        track.style.transition = 'none';
        currentPos = 1;
        track.style.transform = 'translateX(-100%)';
        track.offsetHeight; // force reflow
      }
      // If we reached clone of last slide (before the start), seamlessly snap to real slide 2
      else if (currentPos <= 0) {
        track.style.transition = 'none';
        currentPos = totalReal;
        track.style.transform = 'translateX(-' + (totalReal * 100) + '%)';
        track.offsetHeight; // force reflow
      }
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        resetTimer();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        resetTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        if (isTransitioning) return;
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        isTransitioning = true;
        moveTo(idx + 1, true);
        resetTimer();
      });
    });

    // Touch Swipe Support
    var touchStartX = 0;
    slider.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', function (e) {
      if (e.changedTouches.length === 1) {
        var diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 45) {
          if (diff < 0) nextSlide();
          else prevSlide();
          resetTimer();
        }
      }
    }, { passive: true });

    // Autoplay with hover pause
    function startTimer() {
      if (prefersReducedMotion) return;
      autoInterval = setInterval(nextSlide, 5000);
    }

    function stopTimer() {
      if (autoInterval) clearInterval(autoInterval);
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);

    startTimer();
  }
  initMfgNormalSlider();

  /* ==========================================================================
     4. GSAP KINETIC ENTRANCE SEQUENCING (LIGHTWEIGHT & FAST)
     ========================================================================== */
  if (typeof window.gsap !== 'undefined' && !prefersReducedMotion) {
    try {
      var gsap = window.gsap;

      var heroWords = document.querySelectorAll('.hero-word');
      if (heroWords.length) {
        gsap.fromTo(heroWords,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: 'power2.out', delay: 0.15 }
        );
      }

      var heroTag = document.querySelector('.hero-tag');
      if (heroTag) {
        gsap.fromTo(heroTag, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 });
      }

      var heroLede = document.querySelector('.hero-futuristic .lede');
      if (heroLede) {
        gsap.fromTo(heroLede, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.45 });
      }

      var heroActions = document.querySelector('.hero-actions');
      if (heroActions) {
        gsap.fromTo(heroActions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.55 });
      }

      var spotlightCard = document.querySelector('.mfg-spotlight-card');
      if (spotlightCard) {
        gsap.fromTo(spotlightCard, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: 'power2.out', delay: 0.3 });
      }
    } catch (e) {
      console.warn('GSAP sequence error:', e);
    }
  }

  /* ==========================================================================
     4b. KODERHIVE-STYLE SMOOTH SCROLL-TRIGGERED STACKING CARDS ANIMATION
     ========================================================================== */
  function initServiceCardsStacking() {
    var grid = document.querySelector('.kh-services-grid');
    if (!grid) return;

    var cards = grid.querySelectorAll('.kh-service-card');
    if (cards.length < 2) return;

    // Gracefully handle reduced motion: ensure natural, fully-styled flow
    if (prefersReducedMotion) return;

    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      return;
    }

    try {
      var gsap = window.gsap;
      var ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Setup responsive stacking behavior
      ScrollTrigger.matchMedia({
        // Desktop & Tablet (>= 768px): Full smooth stacking with pinning, subtle scale & top offset
        '(min-width: 768px)': function () {
          var headerOffset = 90; // clear fixed header
          var stackGap = 20;     // visible stacked top edge per card
          var totalCards = cards.length;

          cards.forEach(function (card, index) {
            // Pin each card when it reaches its stack position
            var topPosition = headerOffset + (index * stackGap);

            ScrollTrigger.create({
              trigger: card,
              start: 'top top+=' + topPosition + 'px',
              endTrigger: grid,
              end: 'bottom bottom',
              pin: true,
              pinSpacing: false,
              id: 'stack-pin-' + index,
              invalidateOnRefresh: true
            });

            // As subsequent cards scroll over this card, scale it down subtly and adjust depth
            if (index < totalCards - 1) {
              var nextCard = cards[index + 1];
              gsap.to(card, {
                scale: 1 - ((totalCards - 1 - index) * 0.025),
                filter: 'brightness(' + (1 - (0.08 * (index + 1))) + ')',
                ease: 'none',
                scrollTrigger: {
                  trigger: nextCard,
                  start: 'top top+=' + (headerOffset + ((index + 1) * stackGap) + 120) + 'px',
                  end: 'top top+=' + (headerOffset + ((index + 1) * stackGap)) + 'px',
                  scrub: true,
                  invalidateOnRefresh: true
                }
              });
            }
          });
        }
      });
    } catch (err) {
      console.warn('ScrollTrigger stacking cards initialization error:', err);
    }
  }

  // Initialize once DOM is ready / scripts loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceCardsStacking);
  } else {
    initServiceCardsStacking();
  }

  /* ==========================================================================
     4c. GLOBAL SCROLL-TRIGGERED CARD REVEAL ANIMATION (Alternating Left/Right)
     - Applies to all cards on every page
     - Alternating left & right slide-in with subtle vertical lift & fade-in
     - Row-by-row staggered entrance via ScrollTrigger.batch
     - Clears GSAP transforms on complete so hover transforms work natively
     - Reusable for existing and future cards
     - Full prefers-reduced-motion accessibility support
     ========================================================================== */
  function initGlobalCardScrollReveal() {
    if (prefersReducedMotion) return;
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      return;
    }

    try {
      var gsap = window.gsap;
      var ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      var CARD_SELECTORS = [
        '.product-card',
        '.kh-service-card',
        '.diff-card',
        '.cert-card',
        '.award-card',
        '.featured-award',
        '.contact-info-item',
        '.kh-client-card',
        '.mfg-matrix-card',
        '.kh-roadmap-card',
        '.process-card',
        '.card',
        '[data-card]'
      ].join(', ');

      var allCards = document.querySelectorAll(CARD_SELECTORS);
      if (!allCards.length) return;

      var validCards = [];
      Array.prototype.forEach.call(allCards, function (card) {
        if (card.classList.contains('platform-card')) return;
        if (card.classList.contains('mfg-spotlight-card')) return;
        if (card.closest('.platforms-marquee-wrap, .platforms-marquee-track, .mfg-normal-slider, .mfg-spotlight-card')) {
          return;
        }
        validCards.push(card);
      });

      if (!validCards.length) return;

      // Group cards by immediate parent to alternate directions within each grid/section
      var parentGroups = [];
      validCards.forEach(function (card) {
        var parent = card.parentElement;
        var group = null;
        for (var i = 0; i < parentGroups.length; i++) {
          if (parentGroups[i].parent === parent) {
            group = parentGroups[i];
            break;
          }
        }
        if (!group) {
          group = { parent: parent, cards: [] };
          parentGroups.push(group);
        }
        group.cards.push(card);
      });

      // Assign alternating direction: even index -> 'left', odd index -> 'right'
      parentGroups.forEach(function (group) {
        group.cards.forEach(function (card, idx) {
          card._revealDir = (idx % 2 === 0) ? 'left' : 'right';
        });
      });

      var isMobile = window.innerWidth < 768;
      var vh = window.innerHeight || document.documentElement.clientHeight;

      // Pre-set cards below the initial trigger zone so there is no flash of unstyled content
      validCards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        if (rect.top > vh * 0.88) {
          var dirX = (card._revealDir === 'right') ? (isMobile ? 24 : 38) : (isMobile ? -24 : -38);
          card._isPreset = true;
          gsap.set(card, {
            opacity: 0,
            x: dirX,
            y: isMobile ? 12 : 18
          });
        }
      });

      ScrollTrigger.batch(validCards, {
        interval: 0.08,
        batchMax: 4,
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          var mobileNow = window.innerWidth < 768;
          batch.forEach(function (card, batchIdx) {
            var dirX = (card._revealDir === 'right') ? (mobileNow ? 24 : 38) : (mobileNow ? -24 : -38);
            var liftY = mobileNow ? 12 : 18;
            card.classList.add('card-animating');

            if (card._isPreset) {
              gsap.to(card, {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.75,
                delay: batchIdx * 0.1,
                ease: 'power2.out',
                overwrite: 'auto',
                onComplete: function () {
                  gsap.set(card, { clearProps: 'transform,opacity' });
                  card.classList.remove('card-animating');
                  card.classList.add('card-revealed');
                }
              });
            } else {
              gsap.fromTo(card,
                {
                  opacity: 0,
                  x: dirX,
                  y: liftY
                },
                {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  duration: 0.75,
                  delay: batchIdx * 0.1,
                  ease: 'power2.out',
                  overwrite: 'auto',
                  onComplete: function () {
                    gsap.set(card, { clearProps: 'transform,opacity' });
                    card.classList.remove('card-animating');
                    card.classList.add('card-revealed');
                  }
                }
              );
            }
          });
        }
      });
    } catch (err) {
      console.warn('Card scroll reveal initialization error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalCardScrollReveal);
  } else {
    initGlobalCardScrollReveal();
  }

  window.addEventListener('load', function () {
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.refresh();
    }
  });

  /* ==========================================================================
     5. HEADER & BACK TO TOP SCROLL STATE
     ========================================================================== */
  var header = document.querySelector('.site-header');
  var backToTop = document.querySelector('.back-to-top');
  if (header || backToTop) {
    var scrollTicking = false;
    var handleScroll = function () {
      var scrollY = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', scrollY > 24);
      if (backToTop) backToTop.classList.toggle('show', scrollY > 650);
      scrollTicking = false;
    };
    handleScroll();
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        requestAnimationFrame(handleScroll);
        scrollTicking = true;
      }
    }, { passive: true });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ==========================================================================
     6. MOBILE NAVIGATION
     ========================================================================== */
  var navToggle = document.querySelector('.nav-toggle');
  var navClose = document.querySelector('.nav-panel-close');
  var navPanel = document.querySelector('.nav-panel');
  var body = document.body;
  var lastFocused = null;

  function openNav() {
    lastFocused = document.activeElement;
    body.classList.add('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    if (navPanel) {
      navPanel.removeAttribute('hidden');
      var firstLink = navPanel.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }
  }

  function closeNav() {
    body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    setTimeout(function () {
      if (!body.classList.contains('nav-open') && navPanel) {
        navPanel.setAttribute('hidden', '');
      }
    }, 320);
    if (lastFocused) lastFocused.focus();
  }

  if (navToggle && navPanel) {
    navPanel.setAttribute('hidden', '');
    navToggle.addEventListener('click', function () {
      body.classList.contains('nav-open') ? closeNav() : openNav();
    });
    if (navClose) navClose.addEventListener('click', closeNav);
    navPanel.querySelectorAll('a').forEach(function (a) {
      if (!a.classList.contains('nav-dropdown-toggle')) {
        a.addEventListener('click', closeNav);
      }
    });
  }

  /* ==========================================================================
     7. NAV DROPDOWN (DESKTOP & MOBILE)
     ========================================================================== */
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function (e) {
      var isMobileNav = dropdown.closest('.nav-panel') !== null;
      if (isMobileNav || window.innerWidth <= 860) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = dropdown.classList.toggle('nav-dropdown-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    });

    document.addEventListener('click', function (e) {
      if ((window.innerWidth <= 860 || dropdown.closest('.nav-panel')) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('nav-dropdown-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ==========================================================================
     8. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
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
      }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ==========================================================================
     9. STAT COUNTERS
     ========================================================================== */
  var statNums = document.querySelectorAll('.stat .num[data-count-to]');
  if (statNums.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    var counted = new WeakSet();
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        animateCount(entry.target);
      });
    }, { threshold: 0.35 });
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

  /* ==========================================================================
     10. FAQ ACCORDION
     ========================================================================== */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(function (other) {
        other.setAttribute('data-open', 'false');
        var oq = other.querySelector('.faq-q');
        if (oq) oq.setAttribute('aria-expanded', 'false');
      });
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
      q.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  /* ==========================================================================
     11. PRODUCT FILTER
     ========================================================================== */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var filterButtons = filterBar.querySelectorAll('.filter-btn');
    var productCards = document.querySelectorAll('[data-product-grid] .product-card');
    var emptyState = document.querySelector('[data-filter-empty]');
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        var filter = btn.getAttribute('data-filter');
        var visibleCount = 0;
        productCards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });
        if (emptyState) emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        if (typeof window.ScrollTrigger !== 'undefined') {
          window.ScrollTrigger.refresh();
        }
      });
    });
  }

  /* ==========================================================================
     12. BRANDED SVG IMAGE FALLBACK
     ========================================================================== */
  function fallbackSVG(label) {
    var safeLabel = (label || 'Precision Component').toString();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
      '<rect width="800" height="600" fill="#090e18"/>' +
      '<path d="M40 40H120M40 40V120" stroke="#2e62ff" stroke-width="2" fill="none" opacity="0.6"/>' +
      '<path d="M760 560H680M760 560V480" stroke="#00d4ff" stroke-width="2" fill="none" opacity="0.6"/>' +
      '<circle cx="400" cy="270" r="36" fill="none" stroke="#2e62ff" stroke-width="2"/>' +
      '<text x="400" y="360" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#c5d5ec" text-anchor="middle">' +
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
    });
  });

  /* ==========================================================================
     13. CONTACT FORM VALIDATION & FORMSPREE SUBMISSION
     ========================================================================== */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var statusBox = form.querySelector('.form-status');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setFieldError(field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
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
        setFieldError(field, 'Please enter a valid business email address.');
        return false;
      }
      setFieldError(field, '');
      return true;
    }

    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.closest('.field') && field.closest('.field').getAttribute('data-invalid') === 'true') {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input, textarea');
      var valid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) valid = false;
      });

      var statusText = statusBox ? statusBox.querySelector('span') : null;
      if (statusBox) statusBox.classList.remove('show', 'success', 'error');

      if (!valid) {
        if (statusText) statusText.textContent = 'Please correct the highlighted fields before submitting.';
        if (statusBox) statusBox.classList.add('show', 'error');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var submitButton = form.querySelector('button[type="submit"]');
      var originalButtonText = submitButton ? submitButton.innerHTML : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
      }

      if (statusText) statusText.textContent = 'Transmitting engineering inquiry...';
      if (statusBox) statusBox.classList.add('show');

      var formData = new FormData(form);
      var jsonData = {};
      formData.forEach(function (val, key) { jsonData[key] = val; });

      fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error('Unable to dispatch your inquiry. Please try again.');
            return data;
          });
        })
        .then(function () {
          if (statusText) statusText.textContent = 'Inquiry transmitted successfully. Our engineering team will review your specifications shortly.';
          if (statusBox) {
            statusBox.classList.remove('error');
            statusBox.classList.add('show', 'success');
          }
          if (typeof window.showToast === 'function') {
            window.showToast('Inquiry Dispatched', 'Our engineering team will review your specifications and respond shortly.', 'success');
          }
          if (typeof window.trackEvent === 'function') {
            window.trackEvent('contact_form_submit', { form: 'main_contact' });
          }
          form.reset();
          fields.forEach(function (f) { setFieldError(f, ''); });
        })
        .catch(function (err) {
          if (statusText) statusText.textContent = err.message || 'Transmission failed. Please reach out via email.';
          if (statusBox) {
            statusBox.classList.remove('success');
            statusBox.classList.add('show', 'error');
          }
          if (typeof window.showToast === 'function') {
            window.showToast('Transmission Failed', err.message || 'Please reach out directly via email.', 'error');
          }
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.innerHTML = originalButtonText;
          }
        });
    });
  }

  /* ==========================================================================
     14. INTERACTIVE PRODUCTION ROADMAP (NEXGEN STYLE)
     ========================================================================== */
  var roadmaps = document.querySelectorAll('.kh-roadmap-container');
  if (roadmaps.length > 0) {
    Array.prototype.forEach.call(roadmaps, function (rm) {
      var bar = rm.querySelector('.kh-timeline-bar');
      var progress = rm.querySelector('.kh-timeline-progress');
      var dots = rm.querySelectorAll('.kh-dot');
      var cards = rm.querySelectorAll('.kh-roadmap-card');
      var indicators = rm.querySelectorAll('.kh-step-indicator');

      function layoutDots() {
        if (!cards.length || !dots.length) return;
        var rmRect = rm.getBoundingClientRect();
        Array.prototype.forEach.call(cards, function (card, idx) {
          var dot = dots[idx];
          if (dot) {
            var cardRect = card.getBoundingClientRect();
            var cardCenterY = (cardRect.top - rmRect.top) + (cardRect.height / 2);
            dot.style.top = cardCenterY + 'px';
          }
        });
      }

      function updateRoadmap() {
        if (!bar || !progress) return;
        var barRect = bar.getBoundingClientRect();
        var triggerY = window.innerHeight * 0.55;
        var currentH = triggerY - barRect.top;
        currentH = Math.max(0, Math.min(barRect.height, currentH));
        progress.style.height = currentH + 'px';

        var activeIdx = 0;
        Array.prototype.forEach.call(dots, function (dot, idx) {
          var dotRect = dot.getBoundingClientRect();
          if (triggerY >= dotRect.top) {
            dot.classList.add('active');
            activeIdx = idx;
          } else if (idx > 0) {
            dot.classList.remove('active');
          }
        });

        Array.prototype.forEach.call(indicators, function (ind, idx) {
          if (idx === activeIdx) ind.classList.add('active');
          else ind.classList.remove('active');
        });
      }

      Array.prototype.forEach.call(indicators, function (ind, idx) {
        ind.addEventListener('click', function () {
          var targetCard = cards[idx];
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });

      window.addEventListener('scroll', updateRoadmap, { passive: true });
      window.addEventListener('resize', function () {
        layoutDots();
        updateRoadmap();
      });

      setTimeout(function () {
        layoutDots();
        updateRoadmap();
      }, 120);
    });
  }

  /* ==========================================================================
     16. DYNAMIC KINETIC HEADLINE ROTATOR (NexGen Style 3D Headline)
     ========================================================================== */
  function initHeroRotator() {
    var heroRotator = document.getElementById('heroRotator');
    if (!heroRotator || prefersReducedMotion) return;

    var rawWords = heroRotator.getAttribute('data-words');
    var wordsList = [];
    try {
      wordsList = rawWords ? JSON.parse(rawWords) : [];
    } catch(e) {
      wordsList = ["Built for Automotive.", "30+ Yrs Pak Suzuki Partner.", "±0.01mm Precision Tooling.", "High-Tonnage Stamping.", "Certified Spot Welding."];
    }
    if (!wordsList || !wordsList.length) {
      wordsList = ["Built for Automotive.", "30+ Yrs Pak Suzuki Partner.", "±0.01mm Precision Tooling.", "High-Tonnage Stamping.", "Certified Spot Welding."];
    }

    var currentWordIndex = 0;
    var rotatorInterval = null;
    var isHoveringRotator = false;

    function cycleWord() {
      if (isHoveringRotator) return;
      currentWordIndex = (currentWordIndex + 1) % wordsList.length;
      var nextWord = wordsList[currentWordIndex];

      // Step 1: Slide current word up & out with 3D tilt
      heroRotator.classList.add('swap-out');

      setTimeout(function() {
        // Step 2: Swap text & prepare at bottom
        heroRotator.textContent = nextWord;
        heroRotator.classList.remove('swap-out');
        heroRotator.classList.add('swap-in-prep');

        // Force layout reflow
        void heroRotator.offsetHeight;

        // Step 3: Animate in from bottom with liquid cyan sheen
        heroRotator.classList.remove('swap-in-prep');
        heroRotator.classList.add('swap-in');

        setTimeout(function() {
          heroRotator.classList.remove('swap-in');
        }, 380);
      }, 350);
    }

    rotatorInterval = setInterval(cycleWord, 3200);

    heroRotator.addEventListener('mouseenter', function() {
      isHoveringRotator = true;
    });
    heroRotator.addEventListener('mouseleave', function() {
      isHoveringRotator = false;
    });

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (rotatorInterval) clearInterval(rotatorInterval);
      } else {
        rotatorInterval = setInterval(cycleWord, 3200);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroRotator);
  } else {
    initHeroRotator();
  }

  /* ==========================================================================
     17. FOOTER COPYRIGHT YEAR
     ========================================================================== */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ==========================================================================
     18. TOAST NOTIFICATION ENGINE (Checklist Item 4)
     ========================================================================== */
  var toastContainer = null;
  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.querySelector('.hm-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'hm-toast-container';
        toastContainer.setAttribute('role', 'status');
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  window.showToast = function (title, body, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    var container = getToastContainer();

    var toast = document.createElement('div');
    toast.className = 'hm-toast hm-toast-' + type;

    var iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="hm-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg class="hm-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg class="hm-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = iconSvg +
      '<div class="hm-toast-content">' +
        (title ? '<div class="hm-toast-title">' + title + '</div>' : '') +
        (body ? '<div class="hm-toast-body">' + body + '</div>' : '') +
      '</div>' +
      '<button class="hm-toast-close" aria-label="Close notification">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '</button>';

    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    var dismissTimer = setTimeout(function () {
      dismiss();
    }, duration);

    function dismiss() {
      clearTimeout(dismissTimer);
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 320);
    }

    var closeBtn = toast.querySelector('.hm-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', dismiss);
    }
  };

  /* ==========================================================================
     19. CONVERSION EVENT TRACKING (Checklist Item 7)
     ========================================================================== */
  window.trackEvent = function (eventName, eventParams) {
    eventParams = eventParams || {};
    window.dataLayer = window.dataLayer || [];
    var payload = Object.assign({
      event: eventName,
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    }, eventParams);

    window.dataLayer.push(payload);

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }

    try {
      document.dispatchEvent(new CustomEvent('halfman:track', { detail: payload }));
    } catch (e) {}
  };

  function initConversionTracking() {
    // Track Phone Clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
      el.addEventListener('click', function () {
        window.trackEvent('click_to_call', {
          phone_number: el.getAttribute('href').replace('tel:', ''),
          link_text: el.textContent.trim()
        });
      });
    });

    // Track Email Clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
      el.addEventListener('click', function () {
        window.trackEvent('click_to_email', {
          email_address: el.getAttribute('href').replace('mailto:', ''),
          link_text: el.textContent.trim()
        });
      });
    });

    // Track Quote Request Buttons
    document.querySelectorAll('.kh-explore-btn, a[href*="contact.html"], .btn-primary').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.textContent.trim();
        if (text.toLowerCase().indexOf('quote') !== -1 || text.toLowerCase().indexOf('inquire') !== -1 || text.toLowerCase().indexOf('contact') !== -1) {
          window.trackEvent('quote_request_click', {
            button_label: text,
            destination: btn.getAttribute('href') || 'action'
          });
        }
      });
    });
  }
  initConversionTracking();

  /* ==========================================================================
     20. COOKIE CONSENT BANNER & PREFERENCES PANEL (Checklist Item 8)
     ========================================================================== */
  function initCookieConsent() {
    var STORAGE_KEY = 'halfman_cookie_consent';
    var savedConsent = null;
    try {
      savedConsent = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      savedConsent = null;
    }

    var modalHtml = 
      '<div class="hm-cookie-modal-backdrop" id="hmCookieModal">' +
        '<div class="hm-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookieModalTitle">' +
          '<div class="hm-modal-header">' +
            '<h3 class="hm-modal-title" id="cookieModalTitle">Privacy & Cookie Preferences</h3>' +
            '<button class="hm-modal-close" id="hmModalClose" aria-label="Close preferences">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="hm-modal-body">' +
            '<div class="hm-pref-item">' +
              '<div class="hm-pref-header">' +
                '<span class="hm-pref-title">Strictly Necessary Cookies</span>' +
                '<span class="hm-pref-status">Always Active</span>' +
              '</div>' +
              '<p class="hm-pref-desc">Essential for site navigation, security protocols, CAD model rendering integrity, and high-performance server delivery.</p>' +
            '</div>' +
            '<div class="hm-pref-item">' +
              '<div class="hm-pref-header">' +
                '<span class="hm-pref-title">Performance & Analytics</span>' +
                '<label class="hm-switch">' +
                  '<input type="checkbox" id="prefAnalytics" checked>' +
                  '<span class="hm-slider"></span>' +
                '</label>' +
              '</div>' +
              '<p class="hm-pref-desc">Helps us monitor website telemetry, page load speeds, and user journey analytics to optimize engineering resource delivery.</p>' +
            '</div>' +
            '<div class="hm-pref-item">' +
              '<div class="hm-pref-header">' +
                '<span class="hm-pref-title">Functionality & Preferences</span>' +
                '<label class="hm-switch">' +
                  '<input type="checkbox" id="prefFunctional" checked>' +
                  '<span class="hm-slider"></span>' +
                '</label>' +
              '</div>' +
              '<p class="hm-pref-desc">Remembers your interactive preferences, 3D die viewing angles, and inquiry draft states across sessions.</p>' +
            '</div>' +
          '</div>' +
          '<div class="hm-modal-footer">' +
            '<button class="hm-cookie-btn hm-cookie-btn-secondary" id="savePreferences">Save Preferences</button>' +
            '<button class="hm-cookie-btn hm-cookie-btn-primary" id="modalAcceptAll">Accept All</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var bannerHtml =
      '<div class="hm-cookie-banner" id="hmCookieBanner" role="region" aria-label="Cookie Consent">' +
        '<div class="hm-cookie-inner">' +
          '<div class="hm-cookie-text">' +
            '<div class="hm-cookie-badge">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="16" cy="15.5" r="1" fill="currentColor"/><circle cx="10" cy="16" r="1.2" fill="currentColor"/></svg>' +
              'Compliance & Privacy Notice' +
            '</div>' +
            '<div class="hm-cookie-title">We prioritize your data engineering and privacy</div>' +
            '<p class="hm-cookie-desc">' +
              'Halfman Engineering uses essential cookies to ensure high-performance CAD and web experience, as well as optional analytical cookies to measure platform performance. Read our <a href="privacy-policy.html">Privacy Policy</a>.' +
            '</p>' +
          '</div>' +
          '<div class="hm-cookie-actions">' +
            '<button class="hm-cookie-btn hm-cookie-btn-text" id="openPreferences">Preferences</button>' +
            '<button class="hm-cookie-btn hm-cookie-btn-secondary" id="declineOptional">Essential Only</button>' +
            '<button class="hm-cookie-btn hm-cookie-btn-primary" id="acceptAllCookies">Accept All</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', bannerHtml + modalHtml);

    var banner = document.getElementById('hmCookieBanner');
    var modal = document.getElementById('hmCookieModal');
    var prefAnalytics = document.getElementById('prefAnalytics');
    var prefFunctional = document.getElementById('prefFunctional');

    function saveAndClose(consentData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
      } catch (e) {}
      if (banner) banner.style.display = 'none';
      if (modal) modal.classList.remove('open');
      if (typeof window.showToast === 'function') {
        window.showToast('Preferences Saved', 'Your privacy and cookie selections have been stored.', 'info', 3000);
      }
    }

    if (!savedConsent) {
      setTimeout(function () {
        if (banner) banner.style.display = 'block';
      }, 800);
    }

    var acceptAllBtn = document.getElementById('acceptAllCookies');
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', function () {
        saveAndClose({
          necessary: true,
          analytics: true,
          functional: true,
          timestamp: new Date().toISOString()
        });
      });
    }

    var modalAcceptAll = document.getElementById('modalAcceptAll');
    if (modalAcceptAll) {
      modalAcceptAll.addEventListener('click', function () {
        saveAndClose({
          necessary: true,
          analytics: true,
          functional: true,
          timestamp: new Date().toISOString()
        });
      });
    }

    var declineBtn = document.getElementById('declineOptional');
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        saveAndClose({
          necessary: true,
          analytics: false,
          functional: false,
          timestamp: new Date().toISOString()
        });
      });
    }

    var openPrefBtn = document.getElementById('openPreferences');
    if (openPrefBtn) {
      openPrefBtn.addEventListener('click', function () {
        if (modal) modal.classList.add('open');
      });
    }

    var closePrefBtn = document.getElementById('hmModalClose');
    if (closePrefBtn) {
      closePrefBtn.addEventListener('click', function () {
        if (modal) modal.classList.remove('open');
      });
    }

    var savePrefBtn = document.getElementById('savePreferences');
    if (savePrefBtn) {
      savePrefBtn.addEventListener('click', function () {
        saveAndClose({
          necessary: true,
          analytics: prefAnalytics ? prefAnalytics.checked : true,
          functional: prefFunctional ? prefFunctional.checked : true,
          timestamp: new Date().toISOString()
        });
      });
    }

    document.querySelectorAll('#openCookieSettings, [data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        if (savedConsent) {
          if (prefAnalytics) prefAnalytics.checked = !!savedConsent.analytics;
          if (prefFunctional) prefFunctional.checked = !!savedConsent.functional;
        }
        if (modal) modal.classList.add('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
