document.addEventListener('DOMContentLoaded', () => {
  
  // ========== UTILITY FUNCTIONS ==========
  
  /**
   * Animate counter from start to end with easing
   */
  function animateCounter(element, start, end, duration, suffix = '', prefix = '') {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * (end - start) + start);
      
      element.textContent = prefix + current + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = prefix + end + suffix;
      }
    };
    
    window.requestAnimationFrame(step);
  }

  // ========== YEAR UPDATE ==========
  
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ========== MOBILE DRAWER ==========
  
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

  // Close drawer when clicking outside
  mobileDrawer?.addEventListener('click', (e) => {
    if (e.target === mobileDrawer) closeDrawer();
  });

  // Close drawer when clicking nav links
  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ========== HEADER SCROLL EFFECT ==========
  
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ========== INTERSECTION OBSERVER SETTINGS ==========
  
  const isMobile = window.innerWidth < 700;
  const baseObserverOptions = {
    threshold: isMobile ? 0.35 : 0.45,
    rootMargin: '0px'
  };

  // ========== SECTION ANIMATIONS (About, Before/After, How It Works) ==========
  
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('inview');

      // Animate stat cards with counters
      const statCards = entry.target.querySelectorAll('.stat-card[data-animate]');
      statCards.forEach((card) => {
        const numEl = card.querySelector('.stat-num');
        if (!numEl) return;
        
        const target = parseInt(numEl.getAttribute('data-target'), 10) || 0;
        const suffix = numEl.getAttribute('data-suffix') || '';
        const prefix = numEl.getAttribute('data-prefix') || '';
        
        animateCounter(numEl, 0, target, 1500, suffix, prefix);
      });

      obs.unobserve(entry.target);
    });
  }, baseObserverOptions);

  // Observe sections
  const sectionsToObserve = ['.about-mini', '.before-after', '.how-it-works'];
  sectionsToObserve.forEach((selector) => {
    const section = document.querySelector(selector);
    if (section) sectionObserver.observe(section);
  });

  // ========== STEP CARDS STAGGER ANIMATION ==========
  
  const stepCards = document.querySelectorAll('.step-card');
  if (stepCards.length) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          
          const idx = Array.from(stepCards).indexOf(entry.target);
          const delay = prefersReduced ? 0 : Math.min(idx * 80, 400);
          
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add('inview');
          
          // Reset transition delay after animation
          setTimeout(() => {
            entry.target.style.transitionDelay = '';
          }, delay + 450);
          
          stepObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.45, rootMargin: '0px' }
    );
    
    stepCards.forEach((card) => stepObserver.observe(card));
  }

  // ========== CONTACT CARDS ANIMATION ==========
  
  const contactCards = document.querySelectorAll('.contact-card');
  if (contactCards.length) {
    const contactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('in-view');
            }, i * 120);
            contactObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4, rootMargin: '0px' }
    );
    
    contactCards.forEach((card) => contactObserver.observe(card));
  }

  // ========== GENERAL ANIMATE ELEMENTS ==========
  
  const animateElements = document.querySelectorAll('[data-animate]');
  if (animateElements.length) {
    const generalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('inview');
          generalObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: '0px' }
    );

    animateElements.forEach((el) => generalObserver.observe(el));
  }

  // ========== FAQ ACCORDION ==========
  
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const faqItem = this.closest('.faq-item');
      const isActive = faqItem?.classList.contains('active');

      // Close all FAQs
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
        item.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked FAQ if it wasn't active
      if (!isActive && faqItem) {
        faqItem.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ========== FAQ SHOW MORE/LESS ==========
  
  const showMoreBtn = document.getElementById('showMoreBtn');
  const hiddenFaqs = document.querySelectorAll('.hidden-faq');
  const faqSection = document.querySelector('.faqs');

  if (showMoreBtn && hiddenFaqs.length && faqSection) {
    showMoreBtn.addEventListener('click', function () {
      const isExpanded = !hiddenFaqs[0].classList.contains('hidden-faq');

      if (isExpanded) {
        // Collapsing
        const faqTop = faqSection.getBoundingClientRect().top + window.scrollY;
        
        hiddenFaqs.forEach((faq) => faq.classList.add('hidden-faq'));
        
        setTimeout(() => {
          window.scrollTo({ top: faqTop - 100, behavior: 'smooth' });
        }, 50);
        
        this.textContent = 'Show More Questions';
      } else {
        // Expanding
        hiddenFaqs.forEach((faq) => faq.classList.remove('hidden-faq'));
        this.textContent = 'Show Less Questions';
      }
    });
  }
  
  // ========== CONTACT FORM (FORMSPREE) ==========

  const contactForm = document.getElementById('contactForm');
  const formMessages = document.getElementById('form-messages');

  if (contactForm && formMessages) {
    const submitBtn = contactForm.querySelector('.btn-submit');

    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      formMessages.className = 'form-messages';
      formMessages.textContent = '';
      
      const formData = new FormData(contactForm);
      
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Success
          formMessages.textContent = '✓ Thank you! Your message has been sent successfully. We\'ll get back to you soon.';
          formMessages.className = 'form-messages success';
          formMessages.style.display = 'block';
          contactForm.reset();
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            formMessages.style.display = 'none';
          }, 5000);
        } else {
          // Error from Formspree
          const data = await response.json();
          if (data.errors) {
            formMessages.textContent = '✗ ' + data.errors.map(error => error.message).join(', ');
          } else {
            formMessages.textContent = '✗ Oops! There was a problem submitting your form. Please try again.';
          }
          formMessages.className = 'form-messages error';
          formMessages.style.display = 'block';
        }
      } catch (error) {
        // Network error
        formMessages.textContent = '✗ Oops! There was a problem submitting your form. Please check your connection and try again.';
        formMessages.className = 'form-messages error';
        formMessages.style.display = 'block';
      } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }
  
  // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Close mobile drawer if open
        if (mobileDrawer?.classList.contains('open')) {
          closeDrawer();
        }
        
        // Smooth scroll to target
        const offsetTop = target.offsetTop - 80; // Account for fixed header
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

});