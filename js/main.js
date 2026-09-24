/* Holistor — premium redesign interactions
   Lenis smooth scroll + GSAP ScrollTrigger reveals + light UI wiring. */

(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function () {
    var loader = document.querySelector('.loader');
    if (loader) setTimeout(function () { loader.classList.add('hidden'); }, 250);
  });

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- GSAP reveals ---------- */
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () { el.classList.add('is-visible'); }
      });
    });

    document.querySelectorAll('[data-reveal-stagger]').forEach(function (el) {
      var items = el.children;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          el.classList.add('is-visible');
          gsap.fromTo(items, { opacity: 0, y: 28 }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08
          });
        }
      });
    });

    /* Hero parallax */
    var heroVisual = document.querySelector('.hero-visual');
    if (heroVisual && !reduced) {
      gsap.to(heroVisual, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: heroVisual, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    }

    /* Counters */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target, duration: 1.6, ease: 'power2.out',
            onUpdate: function () { el.textContent = obj.val.toFixed(decimals); }
          });
        }
      });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    /* Fallback: IntersectionObserver if GSAP fails to load */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function (el) { io.observe(el); });
  }

  /* Safety net: never leave content permanently invisible (e.g. a CDN
     hiccup mid-load, a layout shift that desyncs ScrollTrigger's cached
     offsets, or a direct jump to a hash mid-page) — force-reveal anything
     still hidden shortly after load. */
  setTimeout(function () {
    document.querySelectorAll('[data-reveal]:not(.is-visible), [data-reveal-stagger]:not(.is-visible)').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }, 2500);

  /* ---------- Nav scroll state ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    var toTop = document.querySelector('.to-top');
    if (toTop) { if (window.scrollY > 700) toTop.classList.add('show'); else toTop.classList.remove('show'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var mobileClose = document.querySelector('.mobile-close');
  function openMobile() {
    mobileNav && mobileNav.classList.add('open');
    mobileClose && mobileClose.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }
  function closeMobile() {
    mobileNav && mobileNav.classList.remove('open');
    mobileClose && mobileClose.classList.remove('show');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }
  toggle && toggle.addEventListener('click', openMobile);
  mobileClose && mobileClose.addEventListener('click', closeMobile);
  mobileNav && mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobile); });

  /* ---------- Tabs (product pages) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var buttons = group.querySelectorAll('.tabs button');
    var panelsWrap = document.querySelector(group.getAttribute('data-tabs'));
    if (!panelsWrap) return;
    var panels = panelsWrap.querySelectorAll('.tab-panel');
    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        panels[i].classList.add('active');
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  });

  /* ---------- Pricing toggle (Gestión ERP / Estudios Contables) ---------- */
  document.querySelectorAll('[data-pricing-toggle]').forEach(function (group) {
    var buttons = group.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-show');
        document.querySelectorAll('[data-pricing-panel]').forEach(function (panel) {
          panel.style.display = (panel.getAttribute('data-pricing-panel') === target) ? '' : 'none';
        });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  });

  /* ---------- Back to top ---------- */
  var toTopBtn = document.querySelector('.to-top');
  toTopBtn && toTopBtn.addEventListener('click', function () {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Smooth anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.1, offset: -90 });
      else target.scrollIntoView({ behavior: 'smooth' });
      closeMobile();
    });
  });

  /* ---------- Contact form (static demo, no backend) ---------- */
  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-status');
      if (msg) {
        msg.textContent = 'Gracias, recibimos tu mensaje. Un asesor de Holistor se va a comunicar a la brevedad.';
        msg.style.color = 'var(--accent-ink)';
      }
      form.reset();
    });
  }
})();
