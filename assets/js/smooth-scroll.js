// Smooth Scroll System - Phase B
// Lenis inertia scroll + GSAP ScrollTrigger integration

class SmoothScroll {
  constructor() {
    this.lenis = null;
    this.init();
  }

  init() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('[Smooth Scroll] Reduced motion detected, using native scroll');
      return;
    }

    // Initialize Lenis
    this.lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 2.0,
    });

    // Sync Lenis with GSAP ticker
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Setup ScrollTrigger proxy
    this.setupScrollTriggerProxy();

    // Start animation loop
    this.animate();

    // Setup section animations
    this.setupSectionAnimations();

    console.log('[Smooth Scroll] Lenis initialized');
  }

  setupScrollTriggerProxy() {
    // Tell ScrollTrigger to use Lenis scroll position
    this.lenis.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop: (value) => {
        if (value !== undefined) {
          this.lenis.scrollTo(value);
        }
        return this.lenis.scroll;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    });

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.lenis.raf(performance.now());
  }

  setupSectionAnimations() {
    // Hero section - subtle parallax and fade
    this.setupHeroAnimation();

    // About section - 3D timeline
    this.setupTimelineAnimation();

    // Projects section - staggered card reveal
    this.setupProjectsAnimation();

    // Contact section - fade in
    this.setupContactAnimation();

    // Horizontal scroll gallery
    this.setupHorizontalScroll();

    // Progress bar update
    this.setupProgressBar();
  }

  setupHorizontalScroll() {
    const horizontalSection = document.querySelector('.section-horizontal');
    const track = document.querySelector('.horizontal-track');

    if (!horizontalSection || !track) return;

    const cards = track.querySelectorAll('.project-card-v2');
    const totalWidth = track.scrollWidth - window.innerWidth;

    // Horizontal scroll animation
    const horizontalTween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth + 100),
      ease: 'none',
      scrollTrigger: {
        trigger: horizontalSection,
        start: 'top top',
        end: () => `+=${track.scrollWidth}`,
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Update progress indicator
          const progress = self.progress;
          const progressFill = document.querySelector('.progress-fill');
          const dots = document.querySelectorAll('.progress-dots .dot');

          if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
          }

          // Update active dot
          const activeIndex = Math.floor(progress * cards.length);
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIndex);
          });
        }
      }
    });

    // Card hover effects with skew based on scroll velocity
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.03,
          y: -10,
          duration: 0.4,
          ease: 'power2.out'
        });

        // Glitch effect on hover
        const glitchOverlay = card.querySelector('.card-glitch-overlay');
        if (glitchOverlay) {
          gsap.fromTo(glitchOverlay,
            { x: '-100%', opacity: 0 },
            { x: '100%', opacity: 1, duration: 0.4, ease: 'power2.inOut' }
          );
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    });

    // Velocity-based skew effect
    let currentSkew = 0;
    let targetSkew = 0;

    ScrollTrigger.create({
      trigger: horizontalSection,
      start: 'top top',
      end: () => `+=${track.scrollWidth}`,
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        targetSkew = gsap.utils.clamp(-5, 5, velocity / 500);
      }
    });

    // Smooth skew animation
    gsap.ticker.add(() => {
      currentSkew += (targetSkew - currentSkew) * 0.1;
      targetSkew *= 0.9; // Decay

      cards.forEach((card) => {
        gsap.set(card, { skewX: currentSkew });
      });
    });

    console.log('[Horizontal Scroll] Gallery initialized with', cards.length, 'cards');

    // Drag-to-scroll functionality
    this.initDragScroll(track, horizontalSection);
  }

  initDragScroll(track, section) {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let currentX = 0;
    let velocity = 0;
    let lastX = 0;
    let rafId = null;
    let dragStartTime = 0;
    let dragStartElement = null;
    let hasMoved = false;
    const DRAG_THRESHOLD = 5; // pixels to consider it a drag vs click

    // Helper to get current X transform
    const getCurrentX = () => {
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      return matrix.m41 || 0;
    };

    // Mouse events
    track.addEventListener('mousedown', (e) => {
      // Only left mouse button
      if (e.button !== 0) return;

      isDragging = true;
      hasMoved = false;
      dragStartTime = Date.now();
      dragStartElement = e.target;
      startX = e.pageX;
      track.style.cursor = 'grabbing';
      track.style.userSelect = 'none';

      // Get current transform X value
      scrollLeft = getCurrentX();
      lastX = e.pageX;

      // Pause scroll-triggered animation while dragging
      const st = ScrollTrigger.getAll().find(t => t.trigger === section);
      if (st) {
        st.disable();
        // Kill any active GSAP tweens on the track
        gsap.killTweensOf(track);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const x = e.pageX;
      const deltaX = Math.abs(x - startX);

      // Check if we've moved enough to consider it a drag
      if (deltaX > DRAG_THRESHOLD) {
        hasMoved = true;
      }

      // Only prevent default if we're actually dragging (not just clicking)
      if (hasMoved) {
        e.preventDefault();
      }

      const walk = (x - startX) * 1.5; // Drag sensitivity
      currentX = scrollLeft + walk;

      // Clamp to bounds
      const maxScroll = -(track.scrollWidth - window.innerWidth + 100);
      currentX = Math.max(maxScroll, Math.min(0, currentX));

      // Calculate velocity for inertia
      velocity = x - lastX;
      lastX = x;

      // Apply transform using CSS (no GSAP dependency)
      track.style.transform = `translateX(${currentX}px)`;

      // Update progress indicator
      this.updateDragProgress(track, section);
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;

      const dragDuration = Date.now() - dragStartTime;

      // If it was a quick click without much movement, treat it as a click
      if (!hasMoved && dragDuration < 300) {
        // Find closest clickable element
        const clickable = dragStartElement?.closest('a, button');
        if (clickable) {
          clickable.click();
        }
      }

      isDragging = false;
      track.style.cursor = 'grab';
      track.style.userSelect = '';

      // Only apply inertia if we actually dragged
      if (hasMoved) {
        this.applyInertia(track, velocity, section);
      }

      // Re-enable scroll trigger
      const st = ScrollTrigger.getAll().find(t => t.trigger === section);
      if (st) {
        // Sync scroll position to match drag position
        const transform = getCurrentX();
        const maxScroll = track.scrollWidth - window.innerWidth + 100;
        const progress = Math.abs(transform) / maxScroll;
        st.scroll(st.start + (st.end - st.start) * progress);
        st.enable();
      }
    });

    // Touch events for mobile
    track.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
      scrollLeft = getCurrentX();
      lastX = e.touches[0].pageX;

      const st = ScrollTrigger.getAll().find(t => t.trigger === section);
      if (st) {
        st.disable();
        gsap.killTweensOf(track);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX;
      const walk = (x - startX) * 1.5;
      currentX = scrollLeft + walk;

      // Clamp to bounds
      const maxScroll = -(track.scrollWidth - window.innerWidth + 100);
      currentX = Math.max(maxScroll, Math.min(0, currentX));

      velocity = x - lastX;
      lastX = x;
      track.style.transform = `translateX(${currentX}px)`;
      this.updateDragProgress(track, section);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      this.applyInertia(track, velocity, section);

      const st = ScrollTrigger.getAll().find(t => t.trigger === section);
      if (st) {
        const style = window.getComputedStyle(track);
        const matrix = new DOMMatrix(style.transform);
        const transform = matrix.m41 || 0;
        const maxScroll = track.scrollWidth - window.innerWidth + 100;
        const progress = Math.min(Math.abs(transform) / maxScroll, 1);
        st.scroll(st.start + (st.end - st.start) * progress);
        st.enable();
      }
    });

    // Set initial cursor
    track.style.cursor = 'grab';
  }

  updateDragProgress(track, section) {
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    const transform = matrix.m41 || 0;
    const maxScroll = track.scrollWidth - window.innerWidth + 100;
    const progress = Math.min(Math.abs(transform) / maxScroll, 1);

    const progressFill = document.querySelector('.progress-fill');
    const dots = document.querySelectorAll('.progress-dots .dot');
    const cards = track.querySelectorAll('.project-card-v2');

    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`;
    }

    const activeIndex = Math.min(Math.floor(progress * cards.length), cards.length - 1);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  applyInertia(track, velocity, section) {
    if (Math.abs(velocity) < 0.5) return;

    const friction = 0.95;
    let currentVelocity = velocity * 2;
    const maxScroll = -(track.scrollWidth - window.innerWidth + 100);

    const animate = () => {
      currentVelocity *= friction;
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      const currentX = matrix.m41 || 0;
      let newX = currentX + currentVelocity;

      // Clamp to bounds
      newX = Math.max(maxScroll, Math.min(0, newX));

      track.style.transform = `translateX(${newX}px)`;
      this.updateDragProgress(track, section);

      if (Math.abs(currentVelocity) > 0.5) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  setupTimelineAnimation() {
    // 3D Timeline reveal animation
    const timelineNodes = document.querySelectorAll('.timeline-node');
    const timelineProgress = document.querySelector('.timeline-progress');

    if (timelineNodes.length === 0) return;

    // Reveal nodes on scroll
    timelineNodes.forEach((node, index) => {
      gsap.fromTo(node,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: node,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            onEnter: () => node.classList.add('visible'),
            onLeaveBack: () => node.classList.remove('visible'),
          },
          delay: index * 0.1,
        }
      );
    });

    // Progress line animation
    if (timelineProgress) {
      ScrollTrigger.create({
        trigger: '.about-timeline',
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: (self) => {
          timelineProgress.style.height = `${self.progress * 100}%`;
        },
      });
    }

    // Stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
      const targetValue = parseInt(stat.dataset.value, 10);
      if (!targetValue) return;

      gsap.fromTo(stat,
        { textContent: 0 },
        {
          textContent: targetValue,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Avatar orb rotation on scroll
    const avatarOrb = document.querySelector('.avatar-orb');
    if (avatarOrb) {
      gsap.to(avatarOrb, {
        rotationY: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about-v2',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });
    }

    console.log('[Timeline] 3D timeline animations initialized');
  }

  setupHeroAnimation() {
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    heroTimeline
      .to('.hero-content', {
        y: -100,
        opacity: 0.3,
        ease: 'none',
      })
      .to('.hero-title', {
        y: -50,
        ease: 'none',
      }, 0);
  }

  setupAboutAnimation() {
    // Avatar pulse animation on scroll into view
    gsap.from('.avatar', {
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1,
      },
      scale: 0.8,
      opacity: 0,
      rotation: -5,
      ease: 'power2.out',
    });

    // Text reveal
    gsap.from('.about-text p', {
      scrollTrigger: {
        trigger: '#about',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
    });
  }

  setupProjectsAnimation() {
    // Project cards stagger reveal
    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: '#projects',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
    });

    // Hover effect enhancement
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      });
    });
  }

  setupContactAnimation() {
    gsap.from('.contact-link', {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }

  setupProgressBar() {
    // Update progress bar on scroll
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
          progressBar.style.width = `${self.progress * 100}%`;
        }
      },
    });
  }

  // Scroll to section
  scrollTo(target) {
    if (this.lenis) {
      this.lenis.scrollTo(target);
    } else {
      // Fallback to native scroll
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Destroy Lenis instance
  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }
  }
}

// Text Split Animation Utility
class TextSplitter {
  split(element) {
    const text = element.textContent;
    element.innerHTML = text
      .split('')
      .map(
        (char, i) =>
          `<span class="char" style="--i:${i}">${char === ' ' ? '&nbsp;' : char}</span>`
      )
      .join('');
    return element.querySelectorAll('.char');
  }

  animateIn(element, options = {}) {
    const chars = this.split(element);
    const config = {
      y: '120%',
      rotateX: 90,
      opacity: 0,
      duration: 0.8,
      stagger: 0.025,
      ease: 'back.out(1.7)',
      transformOrigin: 'bottom center',
      ...options,
    };

    gsap.from(chars, config);
    return chars;
  }
}

// Magnetic cursor effect for interactive elements
class MagneticElements {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const strength = parseFloat(el.dataset.magnetic) || 0.4;

        gsap.to(el, {
          x: dx * strength,
          y: dy * strength,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)',
        });
      });
    });
  }
}

// Initialize on DOM ready - wait for libraries to load
function initSmoothScroll() {
  if (typeof gsap === 'undefined') {
    console.log('[Smooth Scroll] GSAP not loaded yet, retrying...');
    return false;
  }
  if (typeof Lenis === 'undefined') {
    console.log('[Smooth Scroll] Lenis not loaded yet, retrying...');
    return false;
  }
  if (typeof ScrollTrigger === 'undefined') {
    console.log('[Smooth Scroll] ScrollTrigger not loaded yet, retrying...');
    return false;
  }

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Initialize smooth scroll
  window.smoothScroll = new SmoothScroll();

  // Initialize magnetic elements
  new MagneticElements();

  // Add magnetic attribute to buttons and cards
  document.querySelectorAll('.btn-primary, .project-card, .pdf-category-btn').forEach((el) => {
    el.dataset.magnetic = '0.3';
  });

  console.log('[Smooth Scroll] All systems initialized');
  return true;
}

// Try on DOM ready with multiple retries
document.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  const maxAttempts = 20; // Try for up to 2 seconds

  function tryInit() {
    attempts++;
    if (initSmoothScroll()) {
      return; // Success
    }

    if (attempts < maxAttempts) {
      setTimeout(tryInit, 100);
    } else {
      console.error('[Smooth Scroll] Failed to initialize after', maxAttempts, 'attempts');
    }
  }

  tryInit();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmoothScroll, TextSplitter, MagneticElements };
}
