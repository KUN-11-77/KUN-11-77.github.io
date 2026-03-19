// PDF.js Viewer System
// Phase 3 — Full-page PDF renderer with lazy loading, high-DPI support, and page indicators

// PDF Viewer loaded - Phase 3 implementation

// Configuration
const PDF_CONFIG = {
  maxWidth: 1000, // Slightly smaller to fit within container with proper aspect ratio
  lazyLoadMargin: '200px', // Start loading 200px before page enters viewport
  pageSpacing: 16, // px between pages
  backgroundColor: 'rgba(26, 31, 53, 0.85)', // Glassmorph background for canvas

  // PDF files for each category - array of {name: '显示名称', path: '文件路径'}
  pdfFilesByCategory: {
    ai: [
      { name: '机器学习笔记.pdf', path: 'assets/notes/AI/机器学习笔记.pdf' },
      { name: 'CS231n Notes.pdf', path: 'assets/notes/AI/CS231n Notes.pdf' },
      { name: 'Transformer论文阅读笔记.pdf', path: 'assets/notes/AI/Transformer论文阅读笔记.pdf' },
      { name: 'ViT论文阅读笔记.pdf', path: 'assets/notes/AI/ViT论文阅读笔记.pdf' },
      { name: 'NeRF论文阅读笔记.pdf', path: 'assets/notes/AI/NeRF论文阅读笔记.pdf' },
      { name: 'DDPM论文阅读笔记.pdf', path: 'assets/notes/AI/DDPM论文阅读笔记.pdf' },
      { name: 'DDIM论文阅读笔记.pdf', path: 'assets/notes/AI/DDIM论文阅读笔记.pdf' },
      { name: 'LDM论文阅读笔记.pdf', path: 'assets/notes/AI/LDM论文阅读笔记.pdf' },
      { name: 'SAM论文阅读笔记.pdf', path: 'assets/notes/AI/SAM论文阅读笔记.pdf' },
      { name: '3DGS论文阅读笔记.pdf', path: 'assets/notes/AI/3DGS论文阅读笔记.pdf' },
      { name: 'ML-4360 Notes.pdf', path: 'assets/notes/AI/ML-4360 Notes.pdf' }
    ],
    cs: [
      { name: 'CS231n Notes.pdf', path: 'assets/notes/AI/CS231n Notes.pdf' } // Placeholder
    ],
    physics: [
      { name: '大学物理笔记.pdf', path: 'assets/notes/Physics/大学物理笔记.pdf' }
    ],
    math: [
      { name: '线性代数_I.pdf', path: 'assets/notes/MATH/线性代数_I.pdf' },
      { name: '线性代数_II.pdf', path: 'assets/notes/MATH/线性代数_II.pdf' },
      { name: '线性代数_III.pdf', path: 'assets/notes/MATH/线性代数_III.pdf' },
      { name: '微积分_I.pdf', path: 'assets/notes/MATH/微积分_I.pdf' },
      { name: '微积分_II.pdf', path: 'assets/notes/MATH/微积分_II.pdf' },
      { name: '微积分_III.pdf', path: 'assets/notes/MATH/微积分_III.pdf' },
      { name: '微积分_IV.pdf', path: 'assets/notes/MATH/微积分_IV.pdf' },
      { name: '微积分_V.pdf', path: 'assets/notes/MATH/微积分_V.pdf' },
      { name: '微积分_VI.pdf', path: 'assets/notes/MATH/微积分_VI.pdf' },
      { name: '概率论与数理统计.pdf', path: 'assets/notes/MATH/概率论与数理统计.pdf' },
      { name: '复变函数与拉普拉斯变换.pdf', path: 'assets/notes/MATH/复变函数与拉普拉斯变换.pdf' },
      { name: '常微分方程笔记.pdf', path: 'assets/notes/MATH/常微分方程笔记.pdf' },
      { name: '数值分析.pdf', path: 'assets/notes/MATH/Numerical_Analysis.pdf' },
      { name: '数学建模.pdf', path: 'assets/notes/MATH/数学建模.pdf' }
    ],
    ece: [
      { name: '电子电路基础.pdf', path: 'assets/notes/ECE/电子电路基础.pdf' }
    ]
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
  currentCategory: PDF_CONFIG.defaultCategory,
  currentPdfFile: null,     // Currently selected PDF file object {name, path}
  currentPdfIndex: 0        // Index in current category's PDF list
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

// Utility: Easing function for smooth scroll (ease-in-out-cubic)
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Smooth scroll with inertia effect
function smoothScrollTo(element, targetY, duration = 800) {
  if (!element) return;

  const startY = element.scrollTop;
  const diff = targetY - startY;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    element.scrollTop = startY + diff * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
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

// Render PDF list for current category
function renderPDFList(category = PDFState.currentCategory) {
  const pdfList = document.getElementById('pdf-list');
  const pdfCount = document.querySelector('.pdf-count');

  if (!pdfList) return;

  const pdfFiles = PDF_CONFIG.pdfFilesByCategory[category] || [];

  // Update count
  if (pdfCount) {
    pdfCount.textContent = `${pdfFiles.length} files`;
  }

  // Clear existing list
  pdfList.innerHTML = '';

  if (pdfFiles.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'pdf-list-empty';
    emptyMsg.innerHTML = `
      <i class="ph ph-file-pdf"></i>
      <p>No PDF files found for ${category.toUpperCase()}</p>
    `;
    pdfList.appendChild(emptyMsg);
    return;
  }

  // Create list items
  pdfFiles.forEach((pdfFile, index) => {
    const listItem = document.createElement('div');
    listItem.className = 'pdf-list-item';
    if (PDFState.currentPdfFile && PDFState.currentPdfFile.path === pdfFile.path) {
      listItem.classList.add('active');
      PDFState.currentPdfIndex = index;
    }

    listItem.dataset.pdfIndex = index;
    listItem.dataset.pdfPath = pdfFile.path;

    listItem.innerHTML = `
      <i class="ph ph-file-pdf"></i>
      <span>${pdfFile.name}</span>
    `;

    listItem.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.pdf-list-item').forEach(item => {
        item.classList.remove('active');
      });

      // Add active class to clicked item
      listItem.classList.add('active');

      // Smooth scroll PDF container to top with inertia effect
      const pdfContainer = document.getElementById('pdf-container');
      if (pdfContainer) {
        smoothScrollTo(pdfContainer, 0, 600);
      }

      // Load the selected PDF
      loadPDFFile(pdfFile, index);
    });

    pdfList.appendChild(listItem);
  });

  // If no PDF is selected, select the first one
  if (!PDFState.currentPdfFile && pdfFiles.length > 0) {
    const firstItem = pdfList.querySelector('.pdf-list-item');
    if (firstItem) {
      firstItem.classList.add('active');
      PDFState.currentPdfIndex = 0;
      PDFState.currentPdfFile = pdfFiles[0];
    }
  }
}

// Load a specific PDF file
async function loadPDFFile(pdfFile, index) {
  if (PDFState.isLoading) return;

  PDFState.currentPdfFile = pdfFile;
  PDFState.currentPdfIndex = index;

  PDFState.isLoading = true;
  console.log(`[PDF] Loading PDF: ${pdfFile.name} from ${pdfFile.path}`);

  try {
    // Show loading state
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }

    // Cleanup previous PDF
    cleanupPDF();

    // Wait a tick for DOM to update
    await new Promise(resolve => setTimeout(resolve, 10));

    // Load PDF document
    PDFState.pdfDoc = await pdfjsLib.getDocument(pdfFile.path).promise;
    PDFState.totalPages = PDFState.pdfDoc.numPages;

    console.log(`[PDF] Loaded successfully. Total pages: ${PDFState.totalPages}`);

    // Clear container and render first page directly
    pdfContainer.innerHTML = '';

    // Setup page indicator
    updatePageIndicator(1);

    // Render first page immediately
    console.log('[PDF] Rendering first page directly');
    await renderPageDirect(1);
    console.log('[PDF] First page rendered');

    // For remaining pages, create placeholders and setup lazy loading
    if (PDFState.totalPages > 1) {
      // Start from page 2 since page 1 is already rendered
      await initPagePlaceholders(2);

      // Start observing for lazy loading
      if (PDFState.pageObserver) {
        PDFState.pagePlaceholders.forEach((placeholder, index) => {
          if (placeholder && index > 0) { // index 0 is placeholder for page 1, skip it
            console.log('[PDF] Observing placeholder for page:', index + 1);
            PDFState.pageObserver.observe(placeholder);
          }
        });
      }
    }

  } catch (error) {
    console.error(`[PDF] Failed to load ${pdfFile.name}:`, error);
    showPDFError(`Failed to load ${pdfFile.name}. Please check the file path.`);
  } finally {
    PDFState.isLoading = false;
    // Hide loading element after a short delay to ensure rendering is complete
    setTimeout(() => {
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    }, 100);
  }
}

// Load PDF for a specific category (switch category)
async function loadPDF(category = PDFState.currentCategory) {
  if (PDFState.isLoading) return;

  // Cleanup previous PDF if switching categories
  if (PDFState.pdfDoc && category !== PDFState.currentCategory) {
    cleanupPDF();
  }

  PDFState.currentCategory = category;

  // Render PDF list for this category
  renderPDFList(category);

  // Load the first PDF in this category (if any)
  const pdfFiles = PDF_CONFIG.pdfFilesByCategory[category] || [];
  if (pdfFiles.length > 0) {
    // Reset to first PDF
    PDFState.currentPdfFile = null;
    PDFState.currentPdfIndex = 0;

    // Load the first PDF file
    await loadPDFFile(pdfFiles[0], 0);
  } else {
    // No PDF files in this category - clear viewer
    cleanupPDF();
    const pdfList = document.getElementById('pdf-list');
    if (pdfList) {
      pdfList.innerHTML = '<div class="pdf-list-empty"><i class="ph ph-file-pdf"></i><p>No PDF files found for this category</p></div>';
    }
  }
}

// --------------------------------------------------------------------------
// Page Placeholder System (Lazy Loading)
// --------------------------------------------------------------------------
async function initPagePlaceholders(startPage = 1) {
  if (!pdfContainer || !PDFState.pdfDoc) {
    console.log('[PDF] initPagePlaceholders: missing container or pdfDoc');
    return;
  }

  console.log('[PDF] initPagePlaceholders started from page', startPage, 'container width:', pdfContainer.clientWidth);

  // Only clear container if starting from page 1 (full reset)
  // If starting from page > 1, we're adding to existing content (first page already rendered)
  if (startPage === 1) {
    pdfContainer.innerHTML = '';
    if (loadingElement) {
      pdfContainer.appendChild(loadingElement);
    }
    PDFState.pagePlaceholders = [];
    PDFState.renderedPages.clear();
  }

  // Create placeholder for each page from startPage
  const placeholderPromises = [];
  for (let pageNum = startPage; pageNum <= PDFState.totalPages; pageNum++) {
    placeholderPromises.push(createPagePlaceholder(pageNum));
  }
  await Promise.all(placeholderPromises);
  console.log('[PDF] initPagePlaceholders completed, total placeholders:', PDFState.pagePlaceholders.length);
}

async function createPagePlaceholder(pageNum) {
  if (!pdfContainer || !PDFState.pdfDoc) return;

  try {
    const page = await PDFState.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate dimensions to fit container
    // Ensure container has width, fallback to body width if needed
    let containerWidth = pdfContainer.clientWidth || document.body.clientWidth;
    containerWidth = Math.max(containerWidth - 48, 400); // Min 400px width
    containerWidth = Math.min(containerWidth, PDF_CONFIG.maxWidth);

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
    placeholder.style.border = '1px solid rgba(0, 229, 255, 0.1)';
    placeholder.style.boxShadow = `
      0 0 20px rgba(0, 229, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.03)
    `;

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
// Direct Page Rendering (for first page)
// --------------------------------------------------------------------------
async function renderPageDirect(pageNum) {
  if (!PDFState.pdfDoc) {
    console.error('[PDF] No PDF document loaded');
    return;
  }

  try {
    console.log(`[PDF] Direct rendering page ${pageNum}`);
    const page = await PDFState.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate dimensions - fit to container while maintaining aspect ratio
    const container = pdfContainer.getBoundingClientRect();
    let maxWidth = Math.min(container.width - 48, PDF_CONFIG.maxWidth);
    maxWidth = Math.max(maxWidth, 400); // Minimum width

    // Maintain aspect ratio based on PDF page dimensions
    const pageRatio = viewport.height / viewport.width;
    let width = maxWidth;
    let height = width * pageRatio;

    console.log(`[PDF] Page ${pageNum} dimensions: ${Math.round(width)}x${Math.round(height)}, ratio: ${pageRatio.toFixed(2)}`);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    canvas.dataset.pageNum = pageNum;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.marginBottom = `${PDF_CONFIG.pageSpacing}px`;
    canvas.style.borderRadius = '8px';
    canvas.style.border = '1px solid rgba(0, 229, 255, 0.2)';
    canvas.style.boxShadow = `
      0 0 40px rgba(0, 229, 255, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `;

    // Setup high-DPI canvas
    const ctx = setupHighDPICanvas(canvas, width, height);

    // Fill background
    ctx.fillStyle = PDF_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Render PDF page at correct scale
    const renderScale = width / viewport.width;
    const renderViewport = page.getViewport({ scale: renderScale });
    console.log(`[PDF] Starting render for page ${pageNum}`);
    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
    console.log(`[PDF] Page ${pageNum} rendered successfully`);

    // Add to container
    pdfContainer.appendChild(canvas);
    console.log(`[PDF] Page ${pageNum} added to DOM`);

    // Mark as rendered
    PDFState.renderedPages.add(pageNum);
    updateCurrentPage(pageNum);

  } catch (error) {
    console.error(`[PDF] Failed to render page ${pageNum}:`, error);
  }
}

// --------------------------------------------------------------------------
// Page Rendering (Lazy Loaded)
// --------------------------------------------------------------------------
async function renderPage(pageNum, placeholder) {
  // Skip if already rendered or rendering
  if (PDFState.renderedPages.has(pageNum) || !PDFState.pdfDoc) {
    console.log(`[PDF] Skipping page ${pageNum}, already rendered or no pdfDoc`);
    return;
  }

  console.log(`[PDF] Rendering page ${pageNum}, placeholder:`, placeholder?.dataset);
  PDFState.renderedPages.add(pageNum);

  try {
    const page = await PDFState.pdfDoc.getPage(pageNum);
    console.log(`[PDF] Got page ${pageNum} from pdfDoc`);

    // Get dimensions from placeholder
    const width = parseInt(placeholder.dataset.width);
    const height = parseInt(placeholder.dataset.height);
    console.log(`[PDF] Page ${pageNum} dimensions: ${width}x${height}`);

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page-canvas';
    canvas.dataset.pageNum = pageNum;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.marginBottom = `${PDF_CONFIG.pageSpacing}px`;
    canvas.style.borderRadius = '8px';
    canvas.style.border = '1px solid rgba(0, 229, 255, 0.2)';
    canvas.style.boxShadow = `
      0 0 40px rgba(0, 229, 255, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `;

    // Setup high-DPI canvas
    const ctx = setupHighDPICanvas(canvas, width, height);

    // Fill background
    ctx.fillStyle = PDF_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Render PDF page
    const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
    console.log(`[PDF] Starting render for page ${pageNum}`);
    await page.render({ canvasContext: ctx, viewport }).promise;
    console.log(`[PDF] Page ${pageNum} rendered successfully`);

    // Replace placeholder with rendered canvas
    if (placeholder.parentNode) {
      placeholder.parentNode.replaceChild(canvas, placeholder);
      console.log(`[PDF] Page ${pageNum} DOM updated`);
    } else {
      console.error(`[PDF] Placeholder for page ${pageNum} has no parentNode`);
    }

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

// Calculate which page is currently in view based on PDF container scroll
function updateCurrentPageFromScroll() {
  if (!pdfContainer) return;

  // Get all rendered canvases in the container
  const canvases = pdfContainer.querySelectorAll('.pdf-page-canvas');
  if (canvases.length === 0) return;

  const containerRect = pdfContainer.getBoundingClientRect();
  const containerCenter = containerRect.top + containerRect.height / 2;

  let closestPage = 1;
  let minDistance = Infinity;

  canvases.forEach((canvas) => {
    const pageNum = parseInt(canvas.dataset.pageNum);
    const canvasRect = canvas.getBoundingClientRect();
    const canvasCenter = canvasRect.top + canvasRect.height / 2;
    const distance = Math.abs(canvasCenter - containerCenter);

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
    console.log('[PDF] IntersectionObserver triggered, entries:', entries.length);
    entries.forEach(entry => {
      console.log('[PDF] Entry:', entry.target.dataset.pageNum, 'isIntersecting:', entry.isIntersecting);
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
async function handleResize() {
  // Recreate placeholders and re-render on resize
  if (PDFState.pdfDoc) {
    await initPagePlaceholders();

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
  // PDF Viewer initializing...

  // Get DOM elements
  pdfContainer = document.getElementById('pdf-container');
  pageIndicator = document.getElementById('page-indicator');
  loadingElement = document.querySelector('.pdf-loading');

  if (!pdfContainer) {
    // PDF container not found (expected on index page)
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

  // Setup scroll handler for page indicator - use pdfContainer scroll
  pdfContainer.addEventListener('scroll', () => {
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