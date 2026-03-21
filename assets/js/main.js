// Main JavaScript Entry Point
// Handles global functionality and coordination between modules

// Main: Neuraverse site loaded

// Global state
const AppState = {
  isMobile: window.matchMedia('(max-width: 768px)').matches,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  visibility: document.visibilityState,
  lenis: null,
  performanceTier: 'HIGH', // HIGH, MEDIUM, LOW
  fps: 60
};

// Performance Monitor (Phase H)
class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.lastTime = performance.now();
    this.rafId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.measure();
  }

  measure() {
    const now = performance.now();
    const delta = now - this.lastTime;
    const fps = 1000 / delta;

    this.frames.push(fps);
    if (this.frames.length > 60) this.frames.shift();

    // Calculate average FPS every 60 frames
    if (this.frames.length === 60) {
      const avgFPS = this.frames.reduce((a, b) => a + b, 0) / 60;
      AppState.fps = Math.round(avgFPS);

      // Adjust performance tier
      if (avgFPS < 30) {
        this.setPerformanceTier('LOW');
      } else if (avgFPS < 50) {
        this.setPerformanceTier('MEDIUM');
      }
    }

    this.lastTime = now;
    this.rafId = requestAnimationFrame(() => this.measure());
  }

  setPerformanceTier(tier) {
    if (AppState.performanceTier === tier) return;
    AppState.performanceTier = tier;

    console.log(`[Performance] Tier changed to ${tier}`);

    // Apply optimizations
    document.body.dataset.performanceTier = tier;

    if (tier === 'LOW') {
      // Disable heavy effects
      if (window.GalaxyScene) {
        window.GalaxyScene.setPerformanceTier('LOW');
      }
      // Reduce particle counts
      document.querySelectorAll('.data-column').forEach(el => el.style.display = 'none');
    }
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

// Lazy Load Images
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback: load all images immediately
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

// Resource Hints
function addResourceHints() {
  const hints = [
    { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://unpkg.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Main: Initializing Neuraverse application

  // Detect mobile devices for performance adjustments
  // Device: ${AppState.isMobile ? 'Mobile' : 'Desktop'}
  // Reduced motion: ${AppState.prefersReducedMotion ? 'Yes' : 'No'}

  // Setup intersection observers for scroll animations
  initScrollAnimations();

  // Setup progress bar
  initProgressBar();

  // Setup page indicator
  initPageIndicator();

  // Setup hero animations
  initHeroAnimations();

  // Setup neural cursor
  initNeuralCursor();

  // Setup Lenis smooth scroll (V2)
  initLenisSmoothScroll();

  // Setup GSAP ScrollTrigger animations (V2)
  initGSAPAnimations();

  // Performance optimizations (Phase H)
  initPerformanceOptimizations();

  // Initialize GitHub Widget
  initGitHubWidget();

  // Handle visibility changes (pause animations when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    AppState.visibility = document.visibilityState;
    // Visibility changed: ${AppState.visibility}
  });
});

// --------------------------------------------------------------------------
// Performance Optimizations (Phase H)
// --------------------------------------------------------------------------
function initPerformanceOptimizations() {
  // Add resource hints for faster loading
  addResourceHints();

  // Initialize lazy loading for images
  initLazyLoading();

  // Start performance monitoring (non-mobile only)
  if (!AppState.isMobile) {
    const monitor = new PerformanceMonitor();
    monitor.start();

    // Stop monitoring after 10 seconds
    setTimeout(() => monitor.stop(), 10000);
  }

  // Preload critical resources
  preloadCriticalResources();

  console.log('[Performance] Optimizations initialized');
}

function preloadCriticalResources() {
  const criticalResources = [
    'assets/css/main.css',
    'assets/css/animations.css',
  ];

  criticalResources.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = href.endsWith('.css') ? 'style' : 'script';
    link.href = href;
    document.head.appendChild(link);
  });
}

// --------------------------------------------------------------------------
// Scroll Animations
// --------------------------------------------------------------------------
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
      }
    });
  }, observerOptions);

  // Observe elements that should animate on scroll
  document.querySelectorAll('.project-card, .project-card-3d, .avatar, .contact-link, #page-indicator').forEach(el => {
    observer.observe(el);
  });
}

// --------------------------------------------------------------------------
// Progress Bar
// --------------------------------------------------------------------------
function initProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;

  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.scrollY;
    const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // Initial call
}

// --------------------------------------------------------------------------
// Page Indicator
// --------------------------------------------------------------------------
function initPageIndicator() {
  const indicator = document.getElementById('page-indicator');
  if (!indicator) return;

  // For now, just show a static indicator
  // In Phase 3, this will update based on PDF page scroll
  indicator.textContent = 'Resume Preview';
}

// --------------------------------------------------------------------------
// Hero Animations V2 - Typewriter & Glitch Effects
// --------------------------------------------------------------------------
function initHeroAnimations() {
  // Legacy fallback for old hero structure
  const legacyHeroLines = document.querySelectorAll('.hero-line');
  if (legacyHeroLines.length > 0 && !document.querySelector('.hero-title-v2')) {
    legacyHeroLines.forEach((line, index) => {
      setTimeout(() => line.classList.add('animate-fade-up'), 100 + index * 150);
    });
    return;
  }

  // V2 Typewriter Hero
  initTypewriterHero();
  initGlitchEffect();
  initDataStream();
  initBinaryPills();
}

function initTypewriterHero() {
  const titleLines = document.querySelectorAll('.title-line');
  const subtitleText = document.querySelector('.subtitle-text');
  const fullSubtitle = 'A cosmic neural portfolio by KUN-11-77';

  // Phase 1: Type first line
  typeLine(titleLines[0], 0, () => {
    // Phase 2: Type second line with glitch
    setTimeout(() => {
      typeLine(titleLines[1], 0, () => {
        // Phase 3: Type subtitle character by character
        setTimeout(() => {
          typeCharacters(subtitleText, fullSubtitle, 0);
        }, 300);
      });
    }, 200);
  });
}

function typeLine(element, index, callback) {
  if (!element) {
    if (callback) callback();
    return;
  }

  const text = element.dataset.type || element.textContent;
  element.textContent = '';
  element.classList.add('typing');

  let charIndex = 0;
  const baseSpeed = 80;

  function type() {
    if (charIndex < text.length) {
      element.textContent += text[charIndex];
      charIndex++;

      // Variable typing speed for realism
      const variance = Math.random() * 60 - 30;
      const speed = baseSpeed + variance;

      setTimeout(type, speed);
    } else {
      element.classList.remove('typing');
      element.classList.add('typed');
      if (callback) callback();
    }
  }

  setTimeout(type, 100);
}

function typeCharacters(element, text, index) {
  if (!element) return;

  if (index < text.length) {
    element.textContent += text[index];
    setTimeout(() => typeCharacters(element, text, index + 1), 30);
  } else {
    element.classList.add('completed');
    // Hide cursor after completion
    const cursor = document.querySelector('.cursor-blink');
    if (cursor) {
      setTimeout(() => cursor.style.opacity = '0', 2000);
    }
  }
}

function initGlitchEffect() {
  const glitchElement = document.querySelector('.glitch');
  if (!glitchElement) return;

  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const originalText = glitchElement.dataset.type || 'Negentropy';

  glitchElement.addEventListener('mouseenter', () => {
    let iterations = 0;
    const maxIterations = 10;

    const interval = setInterval(() => {
      glitchElement.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      iterations += 1 / 2;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        glitchElement.textContent = originalText;
      }
    }, 50);
  });

  // Occasional auto-glitch
  setInterval(() => {
    if (Math.random() > 0.95) {
      glitchElement.classList.add('glitching');
      setTimeout(() => glitchElement.classList.remove('glitching'), 300);
    }
  }, 3000);
}

function initDataStream() {
  const columns = document.querySelectorAll('.data-column');
  if (columns.length === 0) return;

  columns.forEach((column, i) => {
    const speed = parseFloat(column.dataset.speed) || 0.5;
    const spans = column.querySelectorAll('span');

    spans.forEach((span, j) => {
      span.style.animationDelay = `${j * 0.2}s`;
      span.style.animationDuration = `${3 / speed}s`;
    });
  });
}

function initBinaryPills() {
  const pills = document.querySelectorAll('.pill');
  if (pills.length === 0) return;

  const binaryChars = ['0', '1'];

  pills.forEach(pill => {
    const originalValue = pill.dataset.value || pill.textContent;

    pill.addEventListener('mouseenter', () => {
      let iterations = 0;
      const maxIterations = 8;

      const interval = setInterval(() => {
        pill.textContent = originalValue
          .split('')
          .map((_, i) => {
            if (i < iterations / 2) return originalValue[i];
            return binaryChars[Math.random() > 0.5 ? 0 : 1];
          })
          .join('');

        iterations++;
        if (iterations >= maxIterations) {
          clearInterval(interval);
          pill.textContent = originalValue;
        }
      }, 60);
    });
  });
}

// --------------------------------------------------------------------------
// Utility Functions
// --------------------------------------------------------------------------
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// --------------------------------------------------------------------------
// Neural Cursor - Advanced Neuron-themed Mouse Interaction
// --------------------------------------------------------------------------
function initNeuralCursor() {
  const cursor = document.getElementById('cursor');
  const soma = document.querySelector('.cursor-soma');
  const axon = document.querySelector('.cursor-axon');

  if (!cursor || !soma || !axon) return;

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    return;
  }

  // Position tracking
  let mouseX = 0, mouseY = 0;
  let somaX = 0, somaY = 0;
  let axonX = 0, axonY = 0;
  let lastX = 0, lastY = 0;
  let lastTrailTime = 0;
  let lastRippleTime = 0;
  let rafId = null;

  // Movement tracking for direction changes
  let velocityX = 0, velocityY = 0;
  let lastVelocityX = 0, lastVelocityY = 0;

  // Show cursor after initial movement
  document.addEventListener('mousemove', () => {
    cursor.style.opacity = '1';
  }, { once: true, passive: true });

  // Update mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Animation loop
  function animate() {
    // Calculate velocity for ripple detection
    velocityX = mouseX - lastX;
    velocityY = mouseY - lastY;

    // Smooth follow with different lerp speeds for soma and axon
    somaX += (mouseX - somaX) * 0.25;
    somaY += (mouseY - somaY) * 0.25;

    // Axon follows slowly (delayed effect - lerp)
    axonX += (mouseX - axonX) * 0.08;
    axonY += (mouseY - axonY) * 0.08;

    // Update positions
    soma.style.transform = `translate(${somaX - 12}px, ${somaY - 12}px)`;
    axon.style.transform = `translate(${axonX - 30}px, ${axonY - 30}px)`;

    // Trail effect
    const now = performance.now();
    if (now - lastTrailTime > 25) {
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (speed > 2) {
        createTrailParticle(somaX, somaY, speed);
      }
      lastTrailTime = now;
    }

    // Ripple on direction change or high speed
    const velocityChange = Math.abs(velocityX - lastVelocityX) + Math.abs(velocityY - lastVelocityY);
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (now - lastRippleTime > 200 && (velocityChange > 15 || speed > 25)) {
      createRipple(somaX, somaY);
      lastRippleTime = now;
    }

    // Store for next frame
    lastX = mouseX;
    lastY = mouseY;
    lastVelocityX = velocityX;
    lastVelocityY = velocityY;

    rafId = requestAnimationFrame(animate);
  }

  // Create trail particle with varied colors
  function createTrailParticle(x, y, speed) {
    const particle = document.createElement('div');
    const types = ['trail-particle-1', 'trail-particle-2', 'trail-particle-3'];
    const type = types[Math.floor(Math.random() * types.length)];

    particle.className = `neural-trail ${type}`;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    const scatter = Math.min(speed * 0.5, 10);
    const offsetX = (Math.random() - 0.5) * scatter;
    const offsetY = (Math.random() - 0.5) * scatter;

    document.body.appendChild(particle);

    const duration = 400 + Math.random() * 400;
    particle.animate([
      { opacity: 0.8, transform: `translate(-50%, -50%) scale(1)` },
      { opacity: 0, transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(0.3)` }
    ], {
      duration: duration,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }

  // Create ripple effect
  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'neural-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '30px';
    ripple.style.height = '30px';

    document.body.appendChild(ripple);

    ripple.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.5 },
      { transform: 'translate(-50%, -50%) scale(2.5)', opacity: 0 }
    ], {
      duration: 500,
      easing: 'ease-out'
    }).onfinish = () => ripple.remove();
  }

  // Hover effect on interactive elements
  const hoverElements = document.querySelectorAll('a, button, .pdf-category-btn, .pdf-list-item, .project-card, .project-card-3d, input, textarea');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      soma.classList.add('hover');
      axon.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      soma.classList.remove('hover');
      axon.classList.remove('hover');
    });
  });

  // Click effects - synaptic burst
  document.addEventListener('mousedown', (e) => {
    soma.classList.add('click');
    createClickBurst(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    soma.classList.remove('click');
  });

  function createClickBurst(x, y) {
    const particleCount = 8 + Math.floor(Math.random() * 4);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-burst burst-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 25 + Math.random() * 35;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      document.body.appendChild(particle);

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.2)`, opacity: 0 }
      ], {
        duration: 300 + Math.random() * 200,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => particle.remove();
    }

    setTimeout(() => createSynapse(x, y), 200);
  }

  function createSynapse(x, y) {
    const synapse = document.createElement('div');
    synapse.className = 'synapse';
    synapse.style.left = x + 'px';
    synapse.style.top = y + 'px';

    const node1 = document.createElement('div');
    node1.className = 'synapse-node';
    node1.style.left = '-8px';
    node1.style.top = '0';

    const node2 = document.createElement('div');
    node2.className = 'synapse-node';
    node2.style.left = '8px';
    node2.style.top = '0';

    const line = document.createElement('div');
    line.className = 'synapse-line';
    line.style.width = '16px';
    line.style.left = '-8px';
    line.style.top = '2px';

    synapse.appendChild(node1);
    synapse.appendChild(node2);
    synapse.appendChild(line);
    document.body.appendChild(synapse);

    synapse.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.3 },
      { opacity: 0.5, transform: 'translate(-50%, -50%) scale(1)', offset: 0.6 },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(1)', offset: 1 }
    ], {
      duration: 600,
      easing: 'ease-in-out'
    }).onfinish = () => synapse.remove();
  }

  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
    } else if (!document.hidden) {
      animate();
    }
  });
}

// --------------------------------------------------------------------------
// Lenis Smooth Scroll (V2)
// --------------------------------------------------------------------------
function initLenisSmoothScroll() {
  // Skip if reduced motion preferred
  if (AppState.prefersReducedMotion) return;

  // Check if Lenis is available
  if (typeof Lenis === 'undefined') {
    console.log('[Lenis] Not available, using native scroll');
    return;
  }

  // Initialize Lenis with cosmic-neural feel
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  AppState.lenis = lenis;

  // Integrate with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Smooth scroll to anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: -80,
          duration: 1.5,
        });
      }
    });
  });

  console.log('[Lenis] Smooth scroll initialized');
}

// --------------------------------------------------------------------------
// GSAP ScrollTrigger Animations (V2)
// --------------------------------------------------------------------------
function initGSAPAnimations() {
  // Check if GSAP is available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.log('[GSAP] Not available, using native animations');
    return;
  }

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Store triggers for cleanup
  const triggers = [];

  // Hero parallax fade-out on scroll
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroTrigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        hero.style.opacity = 1 - progress * 1.5;
        hero.style.transform = `translateY(${progress * 100}px)`;
      }
    });
    triggers.push(heroTrigger);
  }

  // Section headers reveal
  gsap.utils.toArray('.section-header').forEach((header) => {
    const anim = gsap.fromTo(header,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
    if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
  });

  // Project cards staggered reveal
  const projectGrid = document.querySelector('.projects-grid');
  if (projectGrid) {
    const cards = projectGrid.querySelectorAll('.project-card');
    const anim = gsap.fromTo(cards,
      { opacity: 0, y: 60, rotateX: 10 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: projectGrid,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
    if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
  }

  // About section avatar 3D rotation on scroll
  const avatar = document.querySelector('.avatar-container');
  if (avatar) {
    const anim = gsap.fromTo(avatar,
      { rotateY: -15, scale: 0.9 },
      {
        rotateY: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: avatar,
          start: 'top 80%',
          end: 'center center',
          scrub: 1,
        }
      }
    );
    if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
  }

  // Contact links cascade reveal
  const contactLinks = document.querySelectorAll('.contact-link');
  if (contactLinks.length > 0) {
    const anim = gsap.fromTo(contactLinks,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      }
    );
    if (anim.scrollTrigger) triggers.push(anim.scrollTrigger);
  }

  // Speed-based skew effect for project cards
  let skewSetter = gsap.quickSetter('.project-card', 'skewY', 'deg');
  let proxy = { skew: 0 };
  let skewClamp = gsap.utils.clamp(-5, 5);

  const skewTrigger = ScrollTrigger.create({
    onUpdate: (self) => {
      let skew = skewClamp(self.getVelocity() / -300);
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew;
        gsap.to(proxy, {
          skew: 0,
          duration: 0.8,
          ease: 'power3',
          overwrite: true,
          onUpdate: () => skewSetter(proxy.skew)
        });
      }
    }
  });
  triggers.push(skewTrigger);

  // Neural cursor glow intensity on scroll speed
  const cursor = document.getElementById('cursor');
  if (cursor) {
    const glowTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity());
        const intensity = Math.min(velocity / 2000, 1);
        cursor.style.setProperty('--glow-intensity', intensity);
      }
    });
    triggers.push(glowTrigger);
  }

  console.log(`[GSAP] ${triggers.length} ScrollTrigger animations initialized`);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    triggers.forEach(t => t.kill());
  });
}

// --------------------------------------------------------------------------
// GitHub Widget — Fetch and display GitHub stats
// --------------------------------------------------------------------------
function initGitHubWidget() {
  const navGithub = document.getElementById('nav-github');
  if (!navGithub) return;

  const username = 'KUN-11-77';
  const navStarsEl = document.getElementById('nav-stars');

  // Fetch repos data for stars
  fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch repos');
      return res.json();
    })
    .then(repos => {
      let totalStars = 0;
      repos.forEach(repo => {
        totalStars += repo.stargazers_count || 0;
      });

      if (navStarsEl) {
        navStarsEl.textContent = formatNumber(totalStars);
      }
    })
    .catch(err => {
      console.log('[GitHub Widget] Repos fetch error:', err.message);
      if (navStarsEl) navStarsEl.textContent = '0';
    });
}

// Format large numbers (e.g., 1500 -> 1.5k)
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Export for debugging
window.AppState = AppState;
window.Neuraverse = { initScrollAnimations, initProgressBar, initHeroAnimations, initNeuralCursor, initLenisSmoothScroll, initGSAPAnimations };