document.addEventListener('DOMContentLoaded', () => {
  /** ---------- YEAR ---------- **/
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /** ---------- MOBILE DRAWER ---------- **/
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-menu');
  const drawerClose = document.getElementById('drawer-close');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);

  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) closeDrawer();
    });
  }

  /** ---------- HEADER SCROLL ---------- **/
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /** ---------- BASE INTERSECTION OBSERVER SETTINGS ---------- **/
  const isMobile = window.innerWidth < 700;
  const baseObserverOptions = {
    threshold: isMobile ? 0.35 : 0.45,
    rootMargin: '0px 0px 0px 0px',
  };

  /** ---------- COUNTER ANIMATION ---------- **/
  function animateCounter(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * (end - start) + start);
      element.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else element.textContent = end + suffix;
    };
    requestAnimationFrame(step);
  }

  /** ---------- SECTION OBSERVER (About, Before/After, How It Works) ---------- **/
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('inview');

      const statCards = entry.target.querySelectorAll('.stat-card[data-animate]');
      statCards.forEach((card) => {
        const numEl = card.querySelector('.stat-num');
        if (!numEl) return;
        const target = parseInt(numEl.getAttribute('data-target'), 10) || 0;
        const suffix = numEl.getAttribute('data-suffix') || '';
        animateCounter(numEl, 0, target, 1500, suffix);
      });

      obs.unobserve(entry.target);
    });
  }, baseObserverOptions);

  ['.about-mini', '.before-after', '.how-it-works'].forEach((selector) => {
    const section = document.querySelector(selector);
    if (section) sectionObserver.observe(section);
  });

  /** ---------- STEP CARD OBSERVER (Staggered Animation) ---------- **/
  const stepCards = document.querySelectorAll('.step-card');
  if (stepCards.length) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Array.from(stepCards).indexOf(entry.target);
          const delay = prefersReduced ? 0 : Math.min(idx * 80, 400);
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add('inview');
          setTimeout(() => (entry.target.style.transitionDelay = ''), delay + 450);
          staggerObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.45, rootMargin: '0px 0px 0px 0px' }
    );
    stepCards.forEach((card) => staggerObserver.observe(card));
  }

  /** ---------- CONTACT CARD OBSERVER ---------- **/
  const contactCards = document.querySelectorAll('.contact-card');
  if (contactCards.length) {
    const contactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('in-view'), i * 120);
            contactObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4, rootMargin: '0px 0px 0px 0px' }
    );
    contactCards.forEach((card) => contactObserver.observe(card));
  }

  /** ---------- STEP ELEMENTS (MOBILE ANIMATION BEHAVIOR) ---------- **/
  const animateElements = document.querySelectorAll('[data-animate]');
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('inview');
      stepObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35, rootMargin: '0px 0px 0px 0px' });

  animateElements.forEach((el) => stepObserver.observe(el));

  /** ---------- FAQ ACCORDION ---------- **/
  document.querySelectorAll('.faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const faqItem = this.closest('.faq-item');
      const isActive = faqItem?.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
        item.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });

      if (!isActive && faqItem) {
        faqItem.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /** ---------- SHOW MORE / LESS FAQS ---------- **/
  const showMoreBtn = document.getElementById('showMoreBtn');
  const hiddenFaqs = document.querySelectorAll('.hidden-faq');
  const faqSection = document.querySelector('.faqs');

  if (showMoreBtn && hiddenFaqs.length && faqSection) {
    showMoreBtn.addEventListener('click', function () {
      const isExpanded = !hiddenFaqs[0].classList.contains('hidden-faq');

      if (isExpanded) {
        const faqTop = faqSection.getBoundingClientRect().top + window.scrollY;
        hiddenFaqs.forEach((faq) => faq.classList.add('hidden-faq'));
        setTimeout(() => window.scrollTo({ top: faqTop - 100, behavior: 'smooth' }), 50);
        this.textContent = 'Show More Questions';
      } else {
        hiddenFaqs.forEach((faq) => faq.classList.remove('hidden-faq'));
        this.textContent = 'Show Less Questions';
      }
    });
  }
});
