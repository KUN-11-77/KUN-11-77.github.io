// Canvas Background Particle System - Phase 1 + Phase 2
// Deep space particle background with neural connections and mouse interaction

// Configuration
const CONFIG = {
  desktop: { count: 150, connectionThreshold: 120 },
  mobile: { count: 50, connectionThreshold: 80 },
  colors: ['#00e5ff', '#4fc3f7', '#b388ff'], // cyan, blue, purple
  mouseRadius: 150, // Gravitational radius
  mouseForce: 0.3, // Gravitational strength
  particleBaseSpeed: 0.5,
  particleMaxSpeed: 1.5
};

// State
let canvas, ctx;
let particles = [];
let animationId = null;
let isActive = true;
let isMobile = false;

// Mouse state
const mouse = {
  x: null,
  y: null,
  isActive: false
};

// Particle class
class Particle {
  constructor(x, y) {
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? Math.random() * canvas.height;

    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = CONFIG.particleBaseSpeed + Math.random() * (CONFIG.particleMaxSpeed - CONFIG.particleBaseSpeed);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Random size
    this.radius = 1.5 + Math.random() * 2;

    // Random color from palette
    this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

    // Opacity variation
    this.alpha = 0.3 + Math.random() * 0.5;

    // Pulse animation
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.03;
  }

  update() {
    // Update pulse
    this.pulsePhase += this.pulseSpeed;
    const pulseFactor = 0.8 + Math.sin(this.pulsePhase) * 0.2;

    // Mouse gravitational interaction
    if (mouse.isActive && !isMobile) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * CONFIG.mouseForce;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    // Apply velocity with damping
    this.x += this.vx;
    this.y += this.vy;

    // Damping to prevent excessive speed
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Ensure minimum movement
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed < CONFIG.particleBaseSpeed * 0.5) {
      const angle = Math.random() * Math.PI * 2;
      this.vx += Math.cos(angle) * 0.1;
      this.vy += Math.sin(angle) * 0.1;
    }

    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    return pulseFactor;
  }

  draw(pulseFactor) {
    const radius = this.radius * pulseFactor;

    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();

    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

// Initialize canvas
function initCanvas() {
  canvas = document.getElementById('bg-canvas');
  if (!canvas) {
    console.log('[Canvas BG] Canvas element not found');
    return false;
  }

  ctx = canvas.getContext('2d');

  // Check if mobile
  isMobile = window.matchMedia('(max-width: 768px)').matches ||
             window.matchMedia('(pointer: coarse)').matches;

  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', debounce(resizeCanvas, 200));

  // Initialize particles
  initParticles();

  // Setup mouse tracking
  setupMouseTracking();

  // Setup visibility handling
  setupVisibilityHandling();

  return true;
}

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Re-check mobile status on resize
  const wasMobile = isMobile;
  isMobile = window.matchMedia('(max-width: 768px)').matches ||
             window.matchMedia('(pointer: coarse)').matches;

  // If mobile status changed, reinitialize particles
  if (wasMobile !== isMobile) {
    initParticles();
  }
}

// Initialize particles
function initParticles() {
  particles = [];
  const count = isMobile ? CONFIG.mobile.count : CONFIG.desktop.count;

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  console.log(`[Canvas BG] Initialized ${count} particles (mobile: ${isMobile})`);
}

// Setup mouse tracking
function setupMouseTracking() {
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });
}

// Setup visibility handling
function setupVisibilityHandling() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      isActive = true;
      if (!animationId) {
        animate();
      }
    }
  });
}

// Draw connections between nearby particles
function drawConnections() {
  const threshold = isMobile ? CONFIG.mobile.connectionThreshold : CONFIG.desktop.connectionThreshold;
  const thresholdSq = threshold * threshold;

  ctx.lineWidth = 0.5;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distSq = dx * dx + dy * dy;

      if (distSq < thresholdSq) {
        const dist = Math.sqrt(distSq);
        const alpha = (1 - dist / threshold) * 0.3;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.stroke();
      }
    }
  }
}

// Animation loop
function animate() {
  if (!isActive) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  for (const particle of particles) {
    const pulseFactor = particle.update();
    particle.draw(pulseFactor);
  }

  // Draw connections
  drawConnections();

  animationId = requestAnimationFrame(animate);
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
  if (initCanvas()) {
    animate();
    console.log('[Canvas BG] Particle system initialized');
  }
});

// Export for external access
window.ParticleSystem = {
  particles,
  mouse,
  isMobile: () => isMobile,
  reinit: initParticles
};
