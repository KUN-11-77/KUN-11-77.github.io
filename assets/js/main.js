// Main JavaScript Entry Point
// Handles global functionality and coordination between modules

// Main: Neuraverse site loaded

// Global state
const AppState = {
  isMobile: window.matchMedia('(max-width: 768px)').matches,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  visibility: document.visibilityState,
  lenis: null
};

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

  // Handle visibility changes (pause animations when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    AppState.visibility = document.visibilityState;
    // Visibility changed: ${AppState.visibility}
  });
});

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
  document.querySelectorAll('.project-card, .avatar, .contact-link, #page-indicator').forEach(el => {
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
// Hero Animations
// --------------------------------------------------------------------------
function initHeroAnimations() {
  const heroLines = document.querySelectorAll('.hero-line');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroScroll = document.querySelector('.hero-scroll');

  if (heroLines.length === 0) return;

  console.log('[Hero] Initializing hero animations, lines:', heroLines.length);

  // Add animation class to trigger any enhanced states
  heroLines.forEach((line, index) => {
    setTimeout(() => {
      line.classList.add('animate-fade-up');
    }, 100 + index * 150);
  });

  if (heroSubtitle) {
    setTimeout(() => {
      heroSubtitle.classList.add('animate-fade-up');
    }, 400);
  }

  if (heroScroll) {
    setTimeout(() => {
      heroScroll.classList.add('animate-fade-up');
    }, 600);
  }
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
  const hoverElements = document.querySelectorAll('a, button, .pdf-category-btn, .pdf-list-item, .project-card, input, textarea');
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

// Export for debugging
window.AppState = AppState;
window.Neuraverse = { initScrollAnimations, initProgressBar, initHeroAnimations, initNeuralCursor, initLenisSmoothScroll, initGSAPAnimations };