/**
 * Portfolio Main JavaScript
 * Data Engineer Portfolio — Vanilla JS, no dependencies
 */

(() => {
  'use strict';

  // ─── DOM References ────────────────────────────────────────────────
  const bgCanvas     = document.getElementById('bgCanvas');
  const cursorGlow   = document.getElementById('cursorGlow');
  const typedText    = document.getElementById('typedText');
  const navToggle    = document.getElementById('navToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const navbar        = document.querySelector('.navbar');

  // ─── Utility ───────────────────────────────────────────────────────
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const lerp = (start, end, factor) => start + (end - start) * factor;

  const throttle = (fn, delay) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn(...args);
      }
    };
  };

  // ─── Touch Device Detection ────────────────────────────────────────
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }

  // ─── 1. Animated Canvas Background ─────────────────────────────────
  const initCanvasBackground = () => {
    if (!bgCanvas) return;

    const ctx = bgCanvas.getContext('2d');
    let particles = [];
    let width, height;
    const CONNECTION_DISTANCE = 120;
    const PARTICLE_COLOR     = '0, 255, 255'; // cyan

    const resize = () => {
      width  = bgCanvas.width  = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const count = Math.min(Math.floor((width * height) / 18000), 80);
      particles = Array.from({ length: count }, () => ({
        x:  Math.random() * width,
        y:  Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 1.5 + 0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.5)`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', throttle(() => {
      resize();
      createParticles();
    }, 300));
  };

  // ─── 2. Cursor Glow ────────────────────────────────────────────────
  const initCursorGlow = () => {
    if (!cursorGlow || isTouchDevice()) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let visible = false;

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.12);
      currentY = lerp(currentY, targetY, 0.12);

      cursorGlow.style.transform = `translate(${currentX - 150}px, ${currentY - 150}px)`;
      cursorGlow.style.opacity = visible ? '1' : '0';

      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        cursorGlow.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => { visible = false; });
    document.addEventListener('mouseenter', () => { visible = true; });

    animate();
  };

  // ─── 3. Typing Animation ───────────────────────────────────────────
  const initTypingAnimation = () => {
    if (!typedText) return;

    const words = [
      'data pipelines',
      'streaming systems',
      'analytics platforms',
      'scalable architectures',
      'real-time engines',
    ];

    let wordIdx  = 0;
    let charIdx  = 0;
    let deleting = false;

    const type = () => {
      const current = words[wordIdx];

      if (!deleting) {
        typedText.textContent = current.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx === current.length) {
          setTimeout(() => { deleting = true; type(); }, 2000);
          return;
        }
        setTimeout(type, 80 + Math.random() * 20);
      } else {
        typedText.textContent = current.substring(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          deleting = false;
          wordIdx = (wordIdx + 1) % words.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, 50);
      }
    };

    type();
  };

  // ─── 4. Navbar ─────────────────────────────────────────────────────
  const initNavbar = () => {
    // Scroll class
    const onScroll = throttle(() => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });

      // Close on mobile-link click
      mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');

    const highlightActive = throttle(() => {
      let currentId = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }, 150);

    window.addEventListener('scroll', highlightActive, { passive: true });
    highlightActive();
  };

  // ─── 5. Scroll Reveal Animations ───────────────────────────────────
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!revealElements.length) return;

    // Stagger siblings
    const parentMap = new Map();
    revealElements.forEach((el) => {
      const parent = el.parentElement;
      if (!parentMap.has(parent)) parentMap.set(parent, []);
      parentMap.get(parent).push(el);
    });

    parentMap.forEach((children) => {
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.1}s`;
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  };

  // ─── 6. Counter Animation ──────────────────────────────────────────
  const initCounters = () => {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.floor(easeOut(progress) * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  // ─── 7. Project Filtering ──────────────────────────────────────────
  const initProjectFilter = () => {
    const filterBtns = document.querySelectorAll('[data-filter]');
    const projectCards = document.querySelectorAll('[data-category]');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Active button
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;

          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

          if (match) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.display = '';
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => { card.style.display = 'none'; }, 300);
          }
        });
      });
    });
  };

  // ─── 8. Smooth Scroll ──────────────────────────────────────────────
  const initSmoothScroll = () => {
    const NAVBAR_OFFSET = 80;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  // ─── 9. Scroll Progress Bar ────────────────────────────────────────
  const initScrollProgress = () => {
    const update = throttle(() => {
      const scrollTop    = window.scrollY;
      const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
      const percentage   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      document.documentElement.style.setProperty('--scroll-progress', `${percentage}%`);
    }, 16);

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  // ─── Initialise Everything ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initCanvasBackground();
    initCursorGlow();
    initTypingAnimation();
    initNavbar();
    initScrollReveal();
    initCounters();
    initProjectFilter();
    initSmoothScroll();
    initScrollProgress();
  });
})();
