(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (!reduced) document.documentElement.classList.add('motion-ready');

  // Scroll reveals: use broad structural selectors so existing markup stays intact.
  const selectors = [
    '.card', '.service-card', '.project-card', '.timeline-item', '.resource-block',
    '.gallery-item', '.project', '.service', '.timeline > *',
    'main section', 'main article', '.detail-main > img'
  ];
  const revealNodes = [...new Set(selectors.flatMap(s => [...document.querySelectorAll(s)]))]
    .filter(el => !el.closest('header, nav'));

  revealNodes.forEach((el, i) => {
    el.classList.add('reveal-on-scroll');
    el.style.setProperty('--reveal-delay', `${Math.min((i % 4) * 70, 210)}ms`);
    if (i % 3 === 1) el.classList.add('reveal-left');
    if (i % 3 === 2) el.classList.add('reveal-right');
  });

  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    revealNodes.forEach(el => io.observe(el));
  } else {
    revealNodes.forEach(el => el.classList.add('is-visible'));
  }

  // Homepage/detail hero entrance.
  const heroParts = document.querySelectorAll(
    'main > .hero h1, main > .hero p, .hero h1, .hero p, .hero .kicker, .detail-hero h1, .detail-hero p'
  );
  heroParts.forEach((el, i) => {
    el.classList.add('hero-motion');
    el.style.setProperty('--hero-delay', `${90 + i * 90}ms`);
  });

  // Hover motion and image treatment.
  document.querySelectorAll(
    '.card, .service-card, .project-card, .resource-block, .project, .service'
  ).forEach(el => el.classList.add('motion-hover'));

  document.querySelectorAll('main img').forEach((img, i) => {
    img.classList.add('motion-image');
    if (i < 4) img.classList.add('motion-parallax');
  });

  // Gentle parallax.
  if (!reduced) {
    let ticking = false;
    const updateParallax = () => {
      document.querySelectorAll('.motion-parallax').forEach(img => {
        const r = img.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const center = r.top + r.height / 2 - innerHeight / 2;
          const y = Math.max(-10, Math.min(10, -center * .018));
          img.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
        }
      });
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  // Theme-matched cursor for mouse/trackpad only.
  if (finePointer && !reduced) {
    document.body.classList.add('custom-cursor');
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'motion-cursor-dot';
    ring.className = 'motion-cursor-ring';
    document.body.append(dot, ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-active');
      dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
    });
    addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-link'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-link'));
    });

    const animateCursor = () => {
      rx += (mx - rx) * .16;
      ry += (my - ry) * .16;
      ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }
})();