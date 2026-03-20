// ============================================
// CANM LANDING PAGE — APP.JS
// Premium Visual Upgrade
// ============================================

(function () {
  'use strict';

  // --- Sticky nav scroll effect ---
  const nav = document.getElementById('nav');

  function onScroll() {
    const y = window.scrollY;
    if (y > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Mobile hamburger ---
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      mobileMenu.classList.toggle('nav__mobile--open');
      mobileMenu.setAttribute('aria-hidden', expanded);
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('nav__mobile--open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // --- Scroll reveal (IntersectionObserver) ---
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Animated number counters ---
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const display = el.getAttribute('data-display');
    
    // If it's a display-only stat (like "Ücretsiz"), skip counting
    if (display) {
      el.textContent = display;
      return;
    }

    const duration = 1800;
    const startTime = performance.now();
    const prefix = target > 10 ? '' : '';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + (target > 0 ? '+' : '') + suffix;
      
      if (target > 0) {
        el.textContent = current + '+' + suffix;
      } else {
        el.textContent = '0' + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (target > 0) {
          el.textContent = target + '+' + suffix;
        }
      }
    }

    requestAnimationFrame(update);
  }

  // Observe stat counters
  const statNumbers = document.querySelectorAll('.stat__number[data-target]');
  if ('IntersectionObserver' in window && statNumbers.length) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // --- Phone mockup 3D tilt on mouse move ---
  const phone = document.querySelector('.phone-mockup');
  const phoneContainer = document.querySelector('.hero__phone');

  if (phone && phoneContainer && window.matchMedia('(hover: hover)').matches) {
    phoneContainer.addEventListener('mousemove', function (e) {
      const rect = phoneContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 12;   // max 6deg each side
      const rotateX = -y * 8;   // max 4deg

      phone.style.transform =
        'rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg) translateY(-4px)';
    });

    phoneContainer.addEventListener('mouseleave', function () {
      phone.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(0px)';
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Parallax-lite for hero dots ---
  const heroDots = document.querySelectorAll('.hero__dot');
  if (heroDots.length && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;
      if (scrollY < 800) {
        heroDots.forEach(function (dot, i) {
          const speed = 0.03 + i * 0.015;
          dot.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        });
      }
    }, { passive: true });
  }
})();
