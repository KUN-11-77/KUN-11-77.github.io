// Projects Section - 3D Grid Scroll Animation
// Handles scroll-triggered 3D entrance animations for project cards

document.addEventListener('DOMContentLoaded', () => {
  initProjectCards3D();
  initTimeline3D();
});

// --------------------------------------------------------------------------
// Project Cards 3D Scroll Animation
// --------------------------------------------------------------------------
function initProjectCards3D() {
  const cards = document.querySelectorAll('.project-card-3d');

  if (cards.length === 0) {
    console.log('[Projects] No 3D cards found');
    return;
  }

  // Intersection Observer for scroll-triggered animation
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.15
  };

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, stop observing this card
        cardObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe each card
  cards.forEach(card => {
    cardObserver.observe(card);
  });

  // Mouse move parallax effect for cards
  cards.forEach(card => {
    const inner = card.querySelector('.card-3d-inner');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -8;
      const rotateY = (x - centerX) / centerX * 8;

      inner.style.transform = `
        translateZ(30px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });

  console.log('[Projects] 3D grid cards initialized:', cards.length);
}

// --------------------------------------------------------------------------
// Timeline 3D Scroll Animation
// --------------------------------------------------------------------------
function initTimeline3D() {
  const timelineNodes = document.querySelectorAll('.timeline-node');
  const timelineProgress = document.querySelector('.timeline-progress');

  if (timelineNodes.length === 0) {
    console.log('[Timeline] No nodes found');
    return;
  }

  // Intersection Observer for timeline nodes
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0.3
  };

  let visibleCount = 0;

  const nodeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        visibleCount++;

        // Update progress line based on visible nodes
        if (timelineProgress) {
          const progress = (visibleCount / timelineNodes.length) * 100;
          timelineProgress.style.height = `${progress}%`;
        }
      }
    });
  }, observerOptions);

  timelineNodes.forEach(node => {
    nodeObserver.observe(node);
  });

  // Scroll-based parallax for timeline
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTimelineParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  function updateTimelineParallax() {
    const timeline = document.querySelector('.about-timeline');
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Only animate when timeline is in view
    if (rect.top < viewportHeight && rect.bottom > 0) {
      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

      // Update timeline progress line
      if (timelineProgress) {
        timelineProgress.style.height = `${clampedProgress * 100}%`;
      }
    }
  }

  console.log('[Timeline] 3D timeline initialized:', timelineNodes.length, 'nodes');
}

// --------------------------------------------------------------------------
// Utility: Throttle
// --------------------------------------------------------------------------
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
