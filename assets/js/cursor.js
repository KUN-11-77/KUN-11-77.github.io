// Custom Cursor System - Phase 2
// Double-layer cursor with lerp-based smooth following, hover states, and click effects
// Author: Claude Code

// Cursor element references
let innerCursor, outerCursor, cursorContainer;
let targetX = 0, targetY = 0;
let outerX = 0, outerY = 0;
let innerX = 0, innerY = 0;
let isHovering = false;
let isVisible = false;
let rafId = null;

// Configuration
const CURSOR_CONFIG = {
  innerSize: 8,
  outerSize: 40,
  outerLerpFactor: 0.15, // Outer cursor delay (lower = more delay)
  innerLerpFactor: 0.35, // Inner cursor responsiveness
  hoverScale: 1.8, // Scale when hovering interactive elements
  clickScale: 0.8, // Scale when clicking
  magneticStrength: 0.3, // Magnetic pull strength
  hideOnTouch: true
};

// Linear interpolation function
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Check if device is touch-based
function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches ||
         'ontouchstart' in window ||
         navigator.maxTouchPoints > 0;
}

// Update cursor position
function updateCursorPosition(e) {
  targetX = e.clientX;
  targetY = e.clientY;

  if (!isVisible) {
    isVisible = true;
    if (cursorContainer) {
      cursorContainer.style.opacity = '1';
    }
  }
}

// Animation loop for smooth cursor following
function animateCursor() {
  if (!innerCursor || !outerCursor) return;

  // Smooth lerp for outer cursor (delayed follow)
  outerX = lerp(outerX, targetX, CURSOR_CONFIG.outerLerpFactor);
  outerY = lerp(outerY, targetY, CURSOR_CONFIG.outerLerpFactor);

  // Faster lerp for inner cursor (more responsive)
  innerX = lerp(innerX, targetX, CURSOR_CONFIG.innerLerpFactor);
  innerY = lerp(innerY, targetY, CURSOR_CONFIG.innerLerpFactor);

  // Apply transforms (center the cursors on the point)
  outerCursor.style.transform = `translate(${outerX - CURSOR_CONFIG.outerSize / 2}px, ${outerY - CURSOR_CONFIG.outerSize / 2}px) scale(${isHovering ? CURSOR_CONFIG.hoverScale : 1})`;
  innerCursor.style.transform = `translate(${innerX - CURSOR_CONFIG.innerSize / 2}px, ${innerY - CURSOR_CONFIG.innerSize / 2}px)`;

  rafId = requestAnimationFrame(animateCursor);
}

// Handle hover states on interactive elements
function setupHoverEffects() {
  const interactiveSelectors = 'a, button, .pdf-category-btn, .pdf-list-item, .project-card, input, textarea, [role="button"]';

  // Use event delegation for better performance
  document.addEventListener('mouseover', (e) => {
    const interactiveElement = e.target.closest(interactiveSelectors);
    if (interactiveElement) {
      isHovering = true;
      outerCursor?.classList.add('hover');
      innerCursor?.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const interactiveElement = e.target.closest(interactiveSelectors);
    if (interactiveElement) {
      isHovering = false;
      outerCursor?.classList.remove('hover');
      innerCursor?.classList.remove('hover');
    }
  });
}

// Handle click effects
function setupClickEffects() {
  document.addEventListener('mousedown', () => {
    outerCursor?.classList.add('click');
    innerCursor?.classList.add('click');
  });

  document.addEventListener('mouseup', () => {
    outerCursor?.classList.remove('click');
    innerCursor?.classList.remove('click');
  });
}

// Handle cursor visibility
function setupVisibilityHandling() {
  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    if (cursorContainer) {
      cursorContainer.style.opacity = '0';
    }
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    if (cursorContainer) {
      cursorContainer.style.opacity = '1';
    }
    isVisible = true;
  });

  // Hide when window loses focus
  window.addEventListener('blur', () => {
    if (cursorContainer) {
      cursorContainer.style.opacity = '0';
    }
    isVisible = false;
  });
}

// Pause animation when tab is hidden (performance optimization)
function setupVisibilityChangeHandling() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (isVisible && !rafId) {
      rafId = requestAnimationFrame(animateCursor);
    }
  });
}

// Initialize the custom cursor
function initCustomCursor() {
  // Skip on touch devices
  if (CURSOR_CONFIG.hideOnTouch && isTouchDevice()) {
    console.log('[Cursor] Touch device detected, hiding custom cursor');
    if (cursorContainer) {
      cursorContainer.style.display = 'none';
    }
    // Show default cursor
    document.body.style.cursor = 'auto';
    return;
  }

  // Get cursor elements
  cursorContainer = document.getElementById('cursor');
  innerCursor = document.querySelector('.cursor-inner');
  outerCursor = document.querySelector('.cursor-outer');

  if (!cursorContainer || !innerCursor || !outerCursor) {
    console.log('[Cursor] Cursor elements not found in DOM');
    return;
  }

  // Hide default cursor
  document.body.style.cursor = 'none';

  // Apply initial styles
  innerCursor.style.width = `${CURSOR_CONFIG.innerSize}px`;
  innerCursor.style.height = `${CURSOR_CONFIG.innerSize}px`;
  outerCursor.style.width = `${CURSOR_CONFIG.outerSize}px`;
  outerCursor.style.height = `${CURSOR_CONFIG.outerSize}px`;

  // Initial position (off-screen)
  targetX = window.innerWidth / 2;
  targetY = window.innerHeight / 2;
  outerX = targetX;
  outerY = targetY;
  innerX = targetX;
  innerY = targetY;

  // Set initial transform
  outerCursor.style.transform = `translate(${outerX - CURSOR_CONFIG.outerSize / 2}px, ${outerY - CURSOR_CONFIG.outerSize / 2}px)`;
  innerCursor.style.transform = `translate(${innerX - CURSOR_CONFIG.innerSize / 2}px, ${innerY - CURSOR_CONFIG.innerSize / 2}px)`;

  // Show cursor after a brief delay to prevent initial flash
  setTimeout(() => {
    cursorContainer.style.opacity = '1';
    isVisible = true;
  }, 100);

  // Event listeners
  document.addEventListener('mousemove', updateCursorPosition, { passive: true });

  // Setup effects
  setupHoverEffects();
  setupClickEffects();
  setupVisibilityHandling();
  setupVisibilityChangeHandling();

  // Start animation loop
  rafId = requestAnimationFrame(animateCursor);

  console.log('[Cursor] Custom cursor initialized');
}

// Cleanup function for page transitions
function destroyCustomCursor() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  document.removeEventListener('mousemove', updateCursorPosition);
  document.body.style.cursor = 'auto';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
});

// Export for external access
window.CustomCursor = {
  init: initCustomCursor,
  destroy: destroyCustomCursor,
  isTouchDevice: isTouchDevice
};
