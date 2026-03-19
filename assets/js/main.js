// Main JavaScript Entry Point
// Handles global functionality and coordination between modules

// Main: Neuraverse site loaded

// Global state
const AppState = {
  isMobile: window.matchMedia('(max-width: 768px)').matches,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  visibility: document.visibilityState
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

  if (heroLines.length === 0 || !heroSubtitle || !heroScroll) return;

  // Staggered entrance animation
  heroLines.forEach((line, index) => {
    line.style.animationDelay = `${0.3 + index * 0.2}s`;
    line.classList.add('animate-fade-up');
  });

  heroSubtitle.style.animationDelay = '0.8s';
  heroSubtitle.classList.add('animate-fade-up');

  heroScroll.style.animationDelay = '1.2s';
  heroScroll.classList.add('animate-fade-up');
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

// Export for debugging
window.AppState = AppState;
window.Neuraverse = { initScrollAnimations, initProgressBar, initHeroAnimations };