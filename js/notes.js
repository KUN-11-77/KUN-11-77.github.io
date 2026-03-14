// source/js/notes.js
// 依赖：PDF.js (cdn) + index.json

let notesData = null;
let currentCategory = 'all';
let currentSearch = '';
let pdfDoc = null;
let currentPage = 1;
let totalPages = 1;

// 1. 加载 PDFJS worker (通过 CDN)
const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/`;
const PDFJS_CDN_FALLBACK = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/`;

// 检查并加载 PDF.js
function checkPDFJS() {
  if (typeof pdfjsLib === 'undefined') {
    console.log('Loading PDF.js library...');
    const script = document.createElement('script');
    script.src = PDFJS_CDN + 'pdf.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      console.log('PDF.js loaded, setting worker src...');
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN + "pdf.worker.min.js";
      initNotes();
    };
    script.onerror = (err) => {
      console.warn('jsdelivr 失败，尝试 unpkg...', err);
      const fallback = document.createElement('script');
      fallback.src = PDFJS_CDN_FALLBACK + 'pdf.min.js';
      fallback.crossOrigin = 'anonymous';
      fallback.onload = () => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN_FALLBACK + 'pdf.worker.min.js';
        initNotes();
      };
      fallback.onerror = () => {
        console.error('两个 CDN 均加载失败');
        document.querySelector('.notes-loading').innerHTML = `
          <p style="color: #ff6b6b">PDF.js 加载失败，请检查网络</p>
          <button onclick="location.reload()">重试</button>
        `;
        initNotes(); // 降级：没有PDF预览，但标签/搜索仍可用
      };
      document.head.appendChild(fallback);
    };
    document.head.appendChild(script);
    return;
  }
  // 已经加载
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN + "pdf.worker.min.js";
  initNotes();
}

// 2. 初始化笔记系统
async function initNotes() {
  try {
    // 加载元数据
    const res = await fetch("/notes/index.json");
    notesData = await res.json();

    // 渲染网格
    renderGrid();

    // 初始化标签页
    initTabs();

    // 初始化搜索
    initSearch();

    // 初始化 PDF 查看器
    initPDFViewer();

    // 隐藏加载状态
    document.querySelector('.notes-loading')?.remove();
  } catch (error) {
    console.error('Failed to load notes:', error);
    document.querySelector('.notes-loading').innerHTML = `
      <p style="color: var(--clr-accent-cyan)">加载失败: ${error.message}</p>
      <button onclick="location.reload()">重试</button>
    `;
  }
}

// 3. 渲染网格
function renderGrid() {
  const grid = document.getElementById('notes-grid');
  if (!grid || !notesData) return;

  let html = '';
  notesData.categories.forEach(cat => {
    cat.files.forEach(file => {
      if (currentCategory !== 'all' && currentCategory !== cat.id) return;
      if (currentSearch && !matchesSearch(file, cat)) return;

      html += renderCard(file, cat);
    });
  });

  grid.innerHTML = html || '<div class="no-results">未找到匹配的笔记</div>';

  // 添加点击事件
  document.querySelectorAll('.note-card [data-action="view"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const path = e.target.closest('.note-card').dataset.path;
      const title = e.target.closest('.note-card').dataset.title;
      openPDF(path, title);
    });
  });
}

// 4. 渲染单个卡片
function renderCard(file, cat) {
  return `
    <div class="note-card" data-cat="${cat.id}" data-path="${file.path}" data-title="${file.name}">
      <div class="note-card-icon">${cat.icon}</div>
      <div class="note-card-body">
        <h3>${file.name}</h3>
        <div class="note-tags">${file.tags.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="note-meta">${file.pages}页 · ${file.updated}</div>
      </div>
      <div class="note-card-actions">
        <button data-action="view">阅读</button>
        <a href="${file.path}" download>下载</a>
      </div>
    </div>
  `;
}

// 5. 初始化标签页
function initTabs() {
  const tabs = document.getElementById('notes-tabs');
  if (!tabs) return;

  tabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      renderGrid();
    });
  });
}

// 6. 初始化搜索
function initSearch() {
  const searchInput = document.getElementById('notes-search');
  if (!searchInput) return;

  let timeout = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderGrid();
    }, 300);
  });
}

// 7. 搜索匹配
function matchesSearch(file, cat) {
  const search = currentSearch;
  if (!search) return true;

  return file.name.toLowerCase().includes(search) ||
         file.tags.some(tag => tag.toLowerCase().includes(search)) ||
         cat.title.toLowerCase().includes(search) ||
         cat.title_en.toLowerCase().includes(search);
}

// 8. 初始化 PDF 查看器
function initPDFViewer() {
  const modal = document.getElementById('pdf-modal');
  const closeBtn = document.getElementById('pdf-close');
  const prevBtn = document.getElementById('pdf-prev');
  const nextBtn = document.getElementById('pdf-next');

  if (!modal) return;

  closeBtn?.addEventListener('click', closePDF);
  prevBtn?.addEventListener('click', prevPage);
  nextBtn?.addEventListener('click', nextPage);

  // 点击模态框外部关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePDF();
  });

  // ESC 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePDF();
  });
}

// 9. 打开 PDF
async function openPDF(path, title) {
  const modal = document.getElementById('pdf-modal');
  const titleEl = document.getElementById('pdf-title');
  const downloadEl = document.getElementById('pdf-download');
  const canvas = document.getElementById('pdf-canvas');
  const loadingEl = document.querySelector('.pdf-loading');

  if (!modal || !titleEl || !downloadEl || !canvas) return;

  // 显示模态框
  modal.classList.add('open');
  titleEl.textContent = title;
  downloadEl.href = path;

  // 显示加载状态
  canvas.style.display = 'none';
  if (loadingEl) {
    loadingEl.style.display = 'block';
    loadingEl.innerHTML = '加载 PDF 中...';
  }

  // 检查 PDF.js 是否可用
  if (typeof pdfjsLib === 'undefined') {
    console.error('PDF.js library not loaded');
    if (loadingEl) {
      loadingEl.innerHTML = `
        <p style="color: #ff6b6b">PDF 查看器不可用：PDF.js 库加载失败</p>
        <a href="${path}" download class="pdf-controls">直接下载</a>
      `;
    }
    return;
  }

  try {
    // 加载 PDF 文档
    pdfDoc = await pdfjsLib.getDocument(path).promise;
    totalPages = pdfDoc.numPages;
    currentPage = 1;

    // 渲染第一页
    await renderPage(currentPage);

    // 显示画布
    canvas.style.display = 'block';
    if (loadingEl) loadingEl.style.display = 'none';

    // 更新页面指示器
    updatePageIndicator();
  } catch (error) {
    console.error('Failed to load PDF:', error);
    if (loadingEl) {
      loadingEl.innerHTML = `
        <p style="color: #ff6b6b">加载失败: ${error.message}</p>
        <a href="${path}" download class="pdf-controls">直接下载</a>
      `;
    }
  }
}

// 10. 渲染页面
async function renderPage(pageNum) {
  if (!pdfDoc || pageNum < 1 || pageNum > totalPages) return;

  const page = await pdfDoc.getPage(pageNum);
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');

  // 计算缩放以适应宽度
  const viewport = page.getViewport({ scale: 1.5 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // 渲染页面
  await page.render({
    canvasContext: ctx,
    viewport: viewport
  }).promise;

  currentPage = pageNum;
  updatePageIndicator();
}

// 11. 更新页面指示器
function updatePageIndicator() {
  const indicator = document.getElementById('pdf-page');
  if (indicator) {
    indicator.textContent = `${currentPage} / ${totalPages}`;
  }

  // 更新按钮状态
  const prevBtn = document.getElementById('pdf-prev');
  const nextBtn = document.getElementById('pdf-next');
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

// 12. 上一页
function prevPage() {
  if (currentPage > 1) {
    renderPage(currentPage - 1);
  }
}

// 13. 下一页
function nextPage() {
  if (currentPage < totalPages) {
    renderPage(currentPage + 1);
  }
}

// 14. 关闭 PDF
function closePDF() {
  const modal = document.getElementById('pdf-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  pdfDoc = null;
  currentPage = 1;
}

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkPDFJS);
} else {
  checkPDFJS();
}

// 导出全局函数
window.openPDF = openPDF;
window.closePDF = closePDF;
window.prevPage = prevPage;
window.nextPage = nextPage;