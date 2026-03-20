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

    // About section - fade up on scroll
    this.setupAboutAnimation();

    // Projects section - staggered card reveal
    this.setupProjectsAnimation();

    // Contact section - fade in
    this.setupContactAnimation();

    // Progress bar update
    this.setupProgressBar();
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for GSAP and Lenis to be loaded
  if (typeof gsap !== 'undefined' && typeof Lenis !== 'undefined') {
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
  } else {
    console.log('[Smooth Scroll] GSAP or Lenis not loaded, skipping smooth scroll');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmoothScroll, TextSplitter, MagneticElements };
}
