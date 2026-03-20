// Hero Section Enhancements - Phase D
// Morphing text, typing effect, and stats counter

// Morphing Text - Identity words transformation
class MorphingText {
  constructor(element, words) {
    this.element = element;
    this.words = words || ['Physicist', 'Builder', 'Thinker', 'Explorer', 'Engineer'];
    this.currentIndex = 0;
    this.isAnimating = false;

    this.init();
  }

  init() {
    // Set initial text
    this.element.textContent = this.words[0];

    // Start morphing loop
    setInterval(() => {
      this.morph();
    }, 3000);
  }

  morph() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const currentText = this.words[this.currentIndex];
    const nextIndex = (this.currentIndex + 1) % this.words.length;
    const nextText = this.words[nextIndex];

    // Fade out
    gsap.to(this.element, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.element.textContent = nextText;
        this.currentIndex = nextIndex;

        // Fade in
        gsap.fromTo(this.element,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              this.isAnimating = false;
            }
          }
        );
      }
    });
  }
}

// Typewriter Effect for Terminal-style text
class Typewriter {
  constructor(element, text, options = {}) {
    this.element = element;
    this.text = text;
    this.speed = options.speed || 50;
    this.cursor = options.cursor !== false;
    this.delay = options.delay || 0;

    this.init();
  }

  init() {
    this.element.textContent = '';
    this.element.style.opacity = '1';

    if (this.cursor) {
      this.element.classList.add('typewriter-cursor');
    }

    setTimeout(() => {
      this.type();
    }, this.delay);
  }

  type() {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < this.text.length) {
        this.element.textContent += this.text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        this.element.classList.remove('typewriter-cursor');
      }
    }, this.speed);
  }
}

// Stats Counter Animation
class StatsCounter {
  constructor() {
    this.stats = [
      { label: 'Research Papers', value: 847, suffix: '+' },
      { label: 'Lines of Code', value: 124, suffix: 'k+', decimals: 0, multiplier: 1000 },
      { label: 'Projects', value: 23, suffix: '' },
      { label: 'GPA', value: 3.94, suffix: '/4.0', decimals: 2 },
    ];
    this.init();
  }

  init() {
    // Create stats container
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const statsContainer = document.createElement('div');
    statsContainer.className = 'hero-stats';
    statsContainer.innerHTML = this.stats.map((stat, i) => `
      <div class="stat-item" data-stat="${i}">
        <div class="stat-value" data-target="${stat.value}" data-suffix="${stat.suffix}" data-decimals="${stat.decimals || 0}">0</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');

    // Insert after hero subtitle
    const heroContent = hero.querySelector('.hero-content');
    const heroSubtitle = hero.querySelector('.hero-subtitle');
    if (heroContent && heroSubtitle) {
      heroContent.insertBefore(statsContainer, heroSubtitle.nextSibling);
    }

    // Setup scroll trigger
    ScrollTrigger.create({
      trigger: '.hero-stats',
      start: 'top 80%',
      once: true,
      onEnter: () => this.animate()
    });
  }

  animate() {
    document.querySelectorAll('.stat-value').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals) || 0;

      gsap.to({ val: 0 }, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function() {
          const current = this.targets()[0].val;
          el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString()) + suffix;
        }
      });
    });

    // Fade in items
    gsap.from('.stat-item', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }
}

// Hero entrance animation
function initHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.5 });

  // Animate hero title lines
  tl.from('.hero-line', {
    y: 100,
    opacity: 0,
    rotateX: 90,
    duration: 1,
    stagger: 0.15,
    ease: 'power4.out',
    transformOrigin: 'bottom center'
  });

  // Animate subtitle
  tl.from('.hero-subtitle', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.4');

  // Animate scroll indicator
  tl.from('.hero-scroll', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.2');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for GSAP to be available
  if (typeof gsap !== 'undefined') {
    // Hero entrance animation
    initHeroEntrance();

    // Stats counter
    new StatsCounter();

    // Morphing text (if element exists)
    const morphingElement = document.querySelector('.morphing-text');
    if (morphingElement) {
      new MorphingText(morphingElement);
    }

    // Typewriter effects
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      const text = el.textContent;
      const speed = parseInt(el.dataset.typewriter) || 50;
      new Typewriter(el, text, { speed });
    });

    console.log('[Hero] Phase D enhancements initialized');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MorphingText, Typewriter, StatsCounter };
}
