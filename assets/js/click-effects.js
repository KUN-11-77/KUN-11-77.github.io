// Click Particle Explosion System - Phase 2
// Particle burst effect on click using object pool for performance

// Configuration
const CLICK_CONFIG = {
  poolSize: 300,          // Total particles in pool
  burstMin: 12,           // Min particles per click
  burstMax: 18,           // Max particles per click
  particleLife: 600,      // Particle lifetime in ms
  colors: ['#00e5ff', '#4fc3f7', '#b388ff', '#f48fb1'], // cyan, blue, purple, pink
  gravity: 0.1,           // Gravity effect
  friction: 0.98,         // Velocity damping
  spread: 5               // Initial velocity spread
};

// State
let clickCanvas, clickCtx;
let particlePool = [];
let activeParticles = [];
let clickAnimationId = null;
let isClickActive = true;

// Click particle class
class ClickParticle {
  constructor() {
    this.active = false;
    this.reset();
  }

  reset(x, y) {
    this.x = x;
    this.y = y;

    // Radial random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * CLICK_CONFIG.spread;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Random properties
    this.radius = 2 + Math.random() * 3;
    this.color = CLICK_CONFIG.colors[Math.floor(Math.random() * CLICK_CONFIG.colors.length)];
    this.alpha = 1;
    this.decay = 0.02 + Math.random() * 0.02;

    this.active = true;
  }

  update() {
    if (!this.active) return false;

    // Apply physics
    this.vy += CLICK_CONFIG.gravity;
    this.vx *= CLICK_CONFIG.friction;
    this.vy *= CLICK_CONFIG.friction;

    this.x += this.vx;
    this.y += this.vy;

    // Fade out
    this.alpha -= this.decay;

    if (this.alpha <= 0) {
      this.active = false;
      return false;
    }

    return true;
  }

  draw() {
    if (!this.active) return;

    clickCtx.save();
    clickCtx.globalAlpha = this.alpha;

    // Draw particle
    clickCtx.beginPath();
    clickCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    clickCtx.fillStyle = this.color;
    clickCtx.fill();

    // Glow
    clickCtx.shadowBlur = 15;
    clickCtx.shadowColor = this.color;
    clickCtx.fill();

    clickCtx.restore();
  }
}

// Initialize click effects
function initClickEffects() {
  clickCanvas = document.getElementById('click-canvas');
  if (!clickCanvas) {
    console.log('[Click Effects] Click canvas not found');
    return false;
  }

  clickCtx = clickCanvas.getContext('2d');

  // Set canvas size
  resizeClickCanvas();
  window.addEventListener('resize', debounce(resizeClickCanvas, 200));

  // Initialize particle pool
  initParticlePool();

  // Setup click handler
  setupClickHandler();

  // Setup visibility handling
  setupVisibilityHandling();

  // Start animation
  animateClickEffects();

  return true;
}

// Resize canvas
function resizeClickCanvas() {
  clickCanvas.width = window.innerWidth;
  clickCanvas.height = window.innerHeight;
}

// Initialize particle pool
function initParticlePool() {
  particlePool = [];
  for (let i = 0; i < CLICK_CONFIG.poolSize; i++) {
    particlePool.push(new ClickParticle());
  }
  console.log(`[Click Effects] Initialized pool with ${CLICK_CONFIG.poolSize} particles`);
}

// Spawn particles at position
function spawnBurst(x, y) {
  const count = CLICK_CONFIG.burstMin + Math.floor(Math.random() * (CLICK_CONFIG.burstMax - CLICK_CONFIG.burstMin));
  let spawned = 0;

  for (const particle of particlePool) {
    if (!particle.active) {
      particle.reset(x, y);
      activeParticles.push(particle);
      spawned++;

      if (spawned >= count) break;
    }
  }

  // If pool exhausted, reuse oldest active particles
  if (spawned < count) {
    for (let i = 0; i < count - spawned && i < activeParticles.length; i++) {
      activeParticles[i].reset(x, y);
    }
  }
}

// Setup click handler
function setupClickHandler() {
  // Use document for click detection but skip if clicking interactive elements
  document.addEventListener('click', (e) => {
    // Don't spawn particles on right-click or if clicking on interactive elements
    if (e.button !== 0) return;

    const interactiveSelectors = 'a, button, input, textarea, select, [role="button"]';
    const isInteractive = e.target.closest(interactiveSelectors);

    // Spawn burst at click position
    spawnBurst(e.clientX, e.clientY);

    // Debug log
    if (window.location.hash === '#debug') {
      console.log(`[Click Effects] Burst at (${e.clientX}, ${e.clientY}), active: ${activeParticles.length}`);
    }
  });
}

// Setup visibility handling
function setupVisibilityHandling() {
  document.addEventListener('visibilitychange', () => {
    isClickActive = !document.hidden;
    if (!isClickActive && clickAnimationId) {
      cancelAnimationFrame(clickAnimationId);
      clickAnimationId = null;
    } else if (isClickActive && !clickAnimationId) {
      animateClickEffects();
    }
  });
}

// Animation loop
function animateClickEffects() {
  if (!isClickActive) return;

  // Clear canvas
  clickCtx.clearRect(0, 0, clickCanvas.width, clickCanvas.height);

  // Update and draw active particles
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const particle = activeParticles[i];
    const stillActive = particle.update();

    if (stillActive) {
      particle.draw();
    } else {
      // Remove from active list
      activeParticles.splice(i, 1);
    }
  }

  clickAnimationId = requestAnimationFrame(animateClickEffects);
}

// Utility: Debounce
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (initClickEffects()) {
    console.log('[Click Effects] Click particle system initialized');
  }
});

// Export for external access
window.ClickEffects = {
  spawnBurst,
  getActiveCount: () => activeParticles.length,
  getPoolSize: () => CLICK_CONFIG.poolSize
};
