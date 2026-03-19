// PDF.js Viewer System
// Phase 3 — Full-page PDF renderer with lazy loading, high-DPI support, and page indicators

console.log('[PDF Viewer] Loaded - Phase 3 implementation');

// Configuration
const PDF_CONFIG = {
  maxWidth: 860,
  lazyLoadMargin: '200px', // Start loading 200px before page enters viewport
  pageSpacing: 16, // px between pages
  backgroundColor: 'rgba(26, 31, 53, 0.85)', // Glassmorph background for canvas

  // PDF files for each category (placeholder paths - update with actual files)
  pdfFiles: {
    ai: 'assets/pdf/ai.pdf',
    cs: 'assets/pdf/cs.pdf',
    physics: 'assets/pdf/physics.pdf',
    math: 'assets/pdf/math.pdf',
    ece: 'assets/pdf/ece.pdf'
  },

  // Default category
  defaultCategory: 'ai'
};

// State
const PDFState = {
  pdfDoc: null,
  totalPages: 0,
  renderedPages: new Set(),
  pagePlaceholders: [], // Array of placeholder elements
  pageObserver: null,
  currentPage: 1,
  isLoading: false,
  currentCategory: PDF_CONFIG.defaultCategory
};

// DOM Elements
let pdfContainer, pageIndicator, loadingElement;

// Utility: Linear interpolation for smooth animations
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Utility: Debounce for resize events
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

// --------------------------------------------------------------------------
// High-DPI Canvas Setup
// --------------------------------------------------------------------------
function setupHighDPICanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;

  // Set canvas physical dimensions (actual pixels)
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set canvas display dimensions (CSS pixels)
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // Scale context for high-DPI rendering
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return ctx;
}

// --------------------------------------------------------------------------
// PDF Loading & Initialization
// --------------------------------------------------------------------------
// Cleanup current PDF state
function cleanupPDF() {
  if (PDFState.pageObserver) {
    PDFState.pageObserver.disconnect();
  }

  if (pdfContainer) {
    pdfContainer.innerHTML = '';
    if (loadingElement) {
      pdfContainer.appendChild(loadingElement);
    }
  }

  PDFState.pdfDoc = null;
  PDFState.totalPages = 0;
  PDFState.renderedPages.clear();
  PDFState.pagePlaceholders = [];
  PDFState.currentPage = 1;
}

// Load PDF for a specific category
async function loadPDF(category = PDFState.currentCategory) {
  if (PDFState.isLoading) return;

  // Cleanup previous PDF if switching categories
  if (PDFState.pdfDoc && category !== PDFState.currentCategory) {
    cleanupPDF();
  }

  PDFState.currentCategory = category;
  const pdfUrl = PDF_CONFIG.pdfFiles[category] || PDF_CONFIG.pdfFiles[PDF_CONFIG.defaultCategory];

  PDFState.isLoading = true;
  console.log(`[PDF] Loading ${category.toUpperCase()} PDF from:`, pdfUrl);

  try {
    // Show loading state
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }

    // Load PDF document
    PDFState.pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    PDFState.totalPages = PDFState.pdfDoc.numPages;

    console.log(`[PDF] ${category.toUpperCase()} loaded successfully. Total pages: ${PDFState.totalPages}`);

    // Initialize page placeholders for lazy loading
    initPagePlaceholders();

    // Setup page indicator
    updatePageIndicator(1);

    // Start observing for lazy loading
    if (PDFState.pageObserver) {
      PDFState.pagePlaceholders.forEach(placeholder => {
        PDFState.pageObserver.observe(placeholder);
      });
    }

    // Render first page immediately (above the fold)
    if (PDFState.pagePlaceholders[0]) {
      renderPage(1, PDFState.pagePlaceholders[0]);
    }

  } catch (error) {
    console.error(`[PDF] Failed to load ${category.toUpperCase()} PDF:`, error);
    showPDFError(`Failed to load ${category.toUpperCase()} notes. Please check the file path.`);
  } finally {
    PDFState.isLoading = false;
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
}

// --------------------------------------------------------------------------
// Page Placeholder System (Lazy Loading)
// --------------------------------------------------------------------------
function initPagePlaceholders() {
  if (!pdfContainer || !PDFState.pdfDoc) return;

  // Clear existing content (except loading element)
  pdfContainer.innerHTML = '';
  if (loadingElement) {
    pdfContainer.appendChild(loadingElement);
  }

  PDFState.pagePlaceholders = [];
  PDFState.renderedPages.clear();

  // Create placeholder for each page
  for (let pageNum = 1; pageNum <= PDFState.totalPages; pageNum++) {
    createPagePlaceholder(pageNum);
  }
}

async function createPagePlaceholder(pageNum) {
  if (!pdfContainer || !PDFState.pdfDoc) return;

  try {
    const page = await PDFState.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate dimensions to fit container (max-width: 860px)
    const containerWidth = Math.min(
      document.body.clientWidth - 48, // 24px padding on each side
      PDF_CONFIG.maxWidth
    );
    const scale = containerWidth / viewport.width;
    const scaledWidth = viewport.width * scale;
    const scaledHeight = viewport.height * scale;

    // Create placeholder div
    const placeholder = document.createElement('div');
    placeholder.dataset.pageNum = pageNum;
    placeholder.dataset.width = scaledWidth;
    placeholder.dataset.height = scaledHeight;
    placeholder.className = 'pdf-page-placeholder';

    // Styling
    placeholder.style.width = `${scaledWidth}px`;
    placeholder.style.height = `${scaledHeight}px`;
    placeholder.style.marginBottom = `${PDF_CONFIG.pageSpacing}px`;
    placeholder.style.borderRadius = '8px';
    placeholder.style.background = 'rgba(26, 31, 53, 0.5)';
    placeholder.style.backdropFilter = 'blur(4px)';
    placeholder.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.05)';

    // Add subtle loading animation
    placeholder.style.position = 'relative';
    placeholder.style.overflow = 'hidden';

    const shimmer = document.createElement('div');
    shimmer.style.position = 'absolute';
    shimmer.style.top = '0';
    shimmer.style.left = '-100%';
    shimmer.style.width = '100%';
    shimmer.style.height = '100%';
    shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent)';
    shimmer.style.animation = 'shimmer 2s infinite';
    placeholder.appendChild(shimmer);

    // Add to DOM and tracking arrays
    pdfContainer.appendChild(placeholder);
    PDFState.pagePlaceholders[pageNum - 1] = placeholder;

    return placeholder;

  } catch (error) {
    console.error(`[PDF] Failed to create placeholder for page ${pageNum}:`, error);
    return null;
  }
}

// --------------------------------------------------------------------------
// Page Rendering (Lazy Loaded)
// --------------------------------------------------------------------------
async function renderPage(pageNum, placeholder) {
  // Skip if already rendered or rendering
  if (PDFState.renderedPages.has(pageNum) || !PDFState.pdfDoc) return;

  console.log(`[PDF] Rendering page ${pageNum}`);
  PDFState.renderedPages.add(pageNum);

  try {
    const page = await PDFState.pdfDoc.getPage(pageNum);

    // Get dimensions from placeholder
    const width = parseInt(placeholder.dataset.width);
    const height = parseInt(placeholder.dataset.height);

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.marginBottom = `${PDF_CONFIG.pageSpacing}px`;
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 0 40px rgba(0, 229, 255, 0.08)';

    // Setup high-DPI canvas
    const ctx = setupHighDPICanvas(canvas, width, height);

    // Fill background
    ctx.fillStyle = PDF_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Render PDF page
    const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
    await page.render({ canvasContext: ctx, viewport }).promise;

    console.log(`[PDF] Page ${pageNum} rendered successfully`);

    // Replace placeholder with rendered canvas
    placeholder.parentNode.replaceChild(canvas, placeholder);

    // Update current page for indicator
    updateCurrentPage(pageNum);

  } catch (error) {
    console.error(`[PDF] Failed to render page ${pageNum}:`, error);
    PDFState.renderedPages.delete(pageNum); // Allow retry
  }
}

// --------------------------------------------------------------------------
// Page Indicator & Progress
// --------------------------------------------------------------------------
function updatePageIndicator(pageNum) {
  if (!pageIndicator) return;

  pageIndicator.textContent = `Page ${pageNum} of ${PDFState.totalPages}`;
  pageIndicator.style.opacity = '1';
  pageIndicator.style.transform = 'translateY(0)';
}

function updateCurrentPage(pageNum) {
  PDFState.currentPage = pageNum;
  updatePageIndicator(pageNum);
}

// Calculate which page is currently in view
function updateCurrentPageFromScroll() {
  if (!PDFState.pagePlaceholders.length || !pdfContainer) return;

  const containerTop = pdfContainer.getBoundingClientRect().top;
  const viewportHeight = window.innerHeight;
  const viewportCenter = viewportHeight / 2;

  let closestPage = 1;
  let minDistance = Infinity;

  PDFState.pagePlaceholders.forEach((placeholder, index) => {
    if (!placeholder) return;

    const pageNum = index + 1;
    const placeholderRect = placeholder.getBoundingClientRect();
    const placeholderCenter = placeholderRect.top + placeholderRect.height / 2;
    const distance = Math.abs(placeholderCenter - viewportCenter);

    if (distance < minDistance) {
      minDistance = distance;
      closestPage = pageNum;
    }
  });

  if (closestPage !== PDFState.currentPage) {
    updateCurrentPage(closestPage);
  }
}

// --------------------------------------------------------------------------
// Error Handling
// --------------------------------------------------------------------------
function showPDFError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'pdf-error';
  errorDiv.style.padding = '40px';
  errorDiv.style.textAlign = 'center';
  errorDiv.style.color = 'var(--glow-cyan)';
  errorDiv.style.fontFamily = 'var(--font-mono)';
  errorDiv.innerHTML = `
    <p style="margin-bottom: 16px;">${message}</p>
    <p style="font-size: 0.875rem; color: var(--text-muted);">
      Check console for details
    </p>
  `;

  if (pdfContainer) {
    pdfContainer.innerHTML = '';
    pdfContainer.appendChild(errorDiv);
  }
}

// --------------------------------------------------------------------------
// Intersection Observer for Lazy Loading
// --------------------------------------------------------------------------
function initIntersectionObserver() {
  PDFState.pageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const placeholder = entry.target;
        const pageNum = parseInt(placeholder.dataset.pageNum);

        if (!PDFState.renderedPages.has(pageNum)) {
          renderPage(pageNum, placeholder);
        }

        // Stop observing once rendered
        PDFState.pageObserver.unobserve(placeholder);
      }
    });
  }, {
    root: null,
    rootMargin: PDF_CONFIG.lazyLoadMargin,
    threshold: 0.1
  });
}

// --------------------------------------------------------------------------
// Resize Handling
// --------------------------------------------------------------------------
function handleResize() {
  // Recreate placeholders and re-render on resize
  if (PDFState.pdfDoc) {
    initPagePlaceholders();

    // Re-render already rendered pages
    PDFState.renderedPages.forEach(pageNum => {
      const placeholder = PDFState.pagePlaceholders[pageNum - 1];
      if (placeholder && placeholder.parentNode) {
        renderPage(pageNum, placeholder);
      }
    });
  }
}

// --------------------------------------------------------------------------
// Public API & Initialization
// --------------------------------------------------------------------------
function initPDFViewer() {
  console.log('[PDF Viewer] Initializing...');

  // Get DOM elements
  pdfContainer = document.getElementById('pdf-container');
  pageIndicator = document.getElementById('page-indicator');
  loadingElement = document.querySelector('.pdf-loading');

  if (!pdfContainer) {
    console.warn('[PDF Viewer] PDF container not found');
    return;
  }

  // Initialize category selector buttons
  const categoryButtons = document.querySelectorAll('.pdf-category-btn');
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;

        // Update active state
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Load PDF for selected category
        loadPDF(category);
      });
    });
  }

  // Initialize intersection observer for lazy loading
  initIntersectionObserver();

  // Setup resize handler
  window.addEventListener('resize', debounce(handleResize, 250));

  // Setup scroll handler for page indicator
  window.addEventListener('scroll', () => {
    updateCurrentPageFromScroll();
  }, { passive: true });

  // Load default category PDF
  loadPDF(PDF_CONFIG.defaultCategory);
}


// --------------------------------------------------------------------------
// Export & Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Initialize PDF viewer
  initPDFViewer();
});

// Public API for debugging
window.PDFViewer = {
  loadPDF,
  renderPage,
  updateCurrentPage,
  getState: () => PDFState
};