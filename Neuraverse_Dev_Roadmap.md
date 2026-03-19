# Neuraverse — Realm of Negentropy
## GitHub 个人主页开发全过程路线图

> **主题定位**：深邃宇宙背景 × 荧光神经科学视觉 × 高级感交互体验
> **技术栈**：Vanilla HTML / CSS / JS（无构建工具）+ PDF.js + Canvas 2D
> **部署平台**：GitHub Pages（gh-pages 分支自动部署）

---

## 概览

| 维度 | 内容 |
|------|------|
| 阶段数 | 5 个 Phase（Phase 0 → Phase 4） |
| 核心功能 | 鼠标交互系统 / PDF 全局展示 / 粒子宇宙背景 |
| 目标风格 | 无 AI 味、高级感、美观清晰 |
| 移动端 | 粒子降级（÷3 数量）+ prefers-reduced-motion 无障碍支持 |

---

## 视觉设计基调

### 背景图片描述

**第一张（宏观神经宇宙）**：电蓝色与橙黄色交织的主光带，宏观神经元结构散布其中，五彩微小光点营造既像宇宙又像大脑网络的壮观景象，象征广泛的神经连接与信息流动。

**第二张（突触信号微观）**：两个透明蓝色水滴状神经元相对而立，左侧向右侧释放大量白色光点，模拟神经信号通过突触传递的关键瞬间，轴突从右侧延伸而出强化动态感。

两张图从宏观与微观两个视角，诗意诠释了生命与能量的奥秘。

### 色彩系统（CSS 变量）

```css
:root {
  --cosmos-bg:     #0a0e1a;   /* 深宇宙底色 */
  --nebula-layer:  #1a1f35;   /* 星云次层 */
  --glow-cyan:     #00e5ff;   /* 荧光青（主强调色）*/
  --glow-blue:     #4fc3f7;   /* 电蓝（粒子/连线）*/
  --glow-purple:   #b388ff;   /* 淡紫（光标/悬停）*/
  --neural-pink:   #f48fb1;   /* 神经粉（点缀）*/
  --text-primary:  #e8eaf6;   /* 主文字 */
  --text-muted:    #7986cb;   /* 次要文字 */
}
```

### 字体选型

| 用途 | 字体 | 引入方式 |
|------|------|---------|
| 标题 / Hero | **Syne** | Google Fonts CDN |
| 数据 / 代码 | **DM Mono** | Google Fonts CDN |
| 正文 | **Geist** | Google Fonts CDN |
| 图标 | **Phosphor Icons** | CDN `<script>` |

> 严禁使用 Inter / Roboto / Arial — 这是 AI 味的主要来源之一

---

## Phase 0 — 项目脚手架 & 资产准备

### 目录结构

```
neuraverse.github.io/
├── index.html          # 单页主文件
├── assets/
│   ├── css/
│   │   ├── main.css    # 全局样式 & CSS 变量
│   │   └── animations.css
│   ├── js/
│   │   ├── canvas-bg.js    # 粒子背景系统
│   │   ├── cursor.js       # 鼠标交互系统
│   │   └── pdf-viewer.js   # PDF 渲染器
│   └── pdf/
│       └── resume.pdf      # 待展示 PDF
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署
└── README.md
```

### Claude Code 启动提示词

```
帮我从 Phase 0 开始搭建 Neuraverse 个人主页，先初始化项目结构和
CSS 变量系统，主题色：深宇宙蓝 #0a0e1a + 荧光青 #00e5ff + 淡紫 #b388ff。
```

---

## Phase 1 — 视觉骨架 & 背景层

### 任务 1-A：Canvas 宇宙粒子背景

**实现方案**：Canvas 2D（不用 Three.js，减少体积，移动端易降级）

```javascript
// 核心参数
const CONFIG = {
  desktop: { count: 150, connectionThreshold: 120 },
  mobile:  { count: 50,  connectionThreshold: 80 },  // 移动端降级
};

// 粒子具备：位置、速度、半径、颜色（cyan/blue/purple 随机）
// 连线条件：两粒子距离 < connectionThreshold，透明度随距离衰减
// 能量流：中心绘制橙黄色光带（ctx.createLinearGradient）
```

**注意事项**：
- 用 `requestAnimationFrame` 驱动，不用 `setInterval`
- `resize` 事件重新计算 canvas 尺寸（防移动端旋转崩）
- `matchMedia('(max-width: 768px)')` 检测设备，切换粒子数量配置

### 任务 1-B：页面布局 & 毛玻璃 UI

```css
/* 导航栏毛玻璃效果 */
nav {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  background: rgba(10, 14, 26, 0.7);
  border-bottom: 0.5px solid rgba(0, 229, 255, 0.15);
}

/* Hero 文字叠加背景 */
.hero-title {
  mix-blend-mode: screen;
  color: var(--glow-cyan);
}
```

### 任务 1-C：Hero 文字入场动画

```css
/* 逐字淡入 + 上移 */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 无障碍：动画偏好降级 */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Phase 2 — 🖱 鼠标交互系统（Feature 1）

> 分三层实现，各层独立不干扰

### 层级结构

```
z-index 层级：
[背景粒子 Canvas: z-index -1]
[页面内容: z-index 0]
[点击粒子 Canvas: z-index 100]
[光标 div: z-index 9999]
```

### 任务 2-A：双层自定义光标

```javascript
// 内圈：精准跟随鼠标
// 外圈：lerp 插值延迟跟随（营造"液态"质感）
function lerp(a, b, t) { return a + (b - a) * t; }

let outerX = 0, outerY = 0;
document.addEventListener('mousemove', (e) => {
  // 内圈立即到位
  inner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  // 外圈目标位置
  targetX = e.clientX;
  targetY = e.clientY;
});

function animateCursor() {
  // lerp 系数 0.08 → 延迟越大越黏
  outerX = lerp(outerX, targetX, 0.08);
  outerY = lerp(outerY, targetY, 0.08);
  outer.style.transform = `translate(${outerX}px, ${outerY}px)`;
  requestAnimationFrame(animateCursor);
}

// 悬停可点击元素时：外圈放大 + 变色为 --glow-purple
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => outer.classList.add('hover'));
  el.addEventListener('mouseleave', () => outer.classList.remove('hover'));
});
```

### 任务 2-B：点击粒子爆炸效果

```javascript
// 对象池复用粒子，避免 GC 压力
class ParticlePool {
  constructor(size = 200) {
    this.pool = Array.from({ length: size }, () => new Particle());
    this.active = [];
  }
  spawn(x, y) {
    const p = this.pool.pop() || new Particle();
    p.reset(x, y);
    this.active.push(p);
  }
}

// 每次点击生成 12-18 个粒子
document.addEventListener('click', (e) => {
  const count = 12 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    pool.spawn(e.clientX, e.clientY);
  }
});

// 粒子属性：径向随机速度 + 颜色随机取 cyan/purple/pink + 生命周期 0.6s
```

### 任务 2-C：背景粒子引力交互

```javascript
// 在背景粒子更新循环中加入鼠标引力
particles.forEach(p => {
  const dx = mouse.x - p.x;
  const dy = mouse.y - p.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const RADIUS = 150;
  if (dist < RADIUS) {
    const force = (RADIUS - dist) / RADIUS * 0.3;
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }
});
```

---

## Phase 3 — 📄 PDF 全局展示系统（Feature 2 — 核心）

> 这是最核心的功能，也是最容易踩坑的地方

**用途说明**：PDF 展示系统将用于汇总课程笔记，按学科分类：
- **AI** — 人工智能相关课程笔记
- **CS** — 计算机科学核心课程
- **Physics** — 物理学课程笔记
- **MATH** — 数学课程笔记
- **ECE** — 电子与计算机工程课程笔记

每个分类对应独立的 PDF 文件。课程笔记将部署在独立页面（notes.html），通过主页导航访问，提供更好的专注阅读体验。页面内采用选项卡式切换界面，支持按学科分类查看。

### 任务 3-A：PDF.js 全页渲染器

**引入方式（CDN，无需打包）**：
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
</script>
```

**核心渲染逻辑**：
```javascript
async function renderPDF(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // 宽度自适应容器（max-width: 860px）
    const containerWidth = Math.min(document.body.clientWidth - 48, 860);
    const scale = containerWidth / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // ⚠️ 关键：解决高清屏模糊
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = viewport.width  * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width  = viewport.width  + 'px';
    canvas.style.height = viewport.height + 'px';
    ctx.scale(dpr, dpr);

    await page.render({ canvasContext: ctx, viewport }).promise;
    container.appendChild(canvas);
  }
}
```

### ⚠️ 高清屏模糊问题（必须处理）

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| Canvas 内容模糊 | devicePixelRatio = 2 时 canvas 实际像素不足 | canvas 物理尺寸 × dpr，CSS 尺寸保持不变，ctx.scale(dpr, dpr) |

### 任务 3-B：PDF 容器样式

```css
#pdf-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;              /* 页面间距 */
}

#pdf-container canvas {
  width: 100%;
  border-radius: 8px;
  background: rgba(26, 31, 53, 0.85);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.08);
}

/* 浮动页码指示器 */
#page-indicator {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: rgba(10, 14, 26, 0.9);
  border: 0.5px solid rgba(0, 229, 255, 0.3);
  border-radius: 99px;
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--glow-cyan);
  backdrop-filter: blur(8px);
}
```

### 任务 3-C：懒加载 + 加载态 + 进度条

```javascript
// IntersectionObserver 滚动到视口才渲染该页
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const placeholder = entry.target;
      renderPage(placeholder.dataset.pageNum, placeholder);
      observer.unobserve(placeholder);
    }
  });
}, { rootMargin: '200px' });  // 提前 200px 开始渲染

// 骨架屏占位（防止布局偏移）
function createPlaceholder(pageNum, width, height) {
  const div = document.createElement('div');
  div.dataset.pageNum = pageNum;
  div.style.cssText = `width:${width}px; height:${height}px; background: rgba(26,31,53,0.5);`;
  div.classList.add('skeleton');
  observer.observe(div);
  return div;
}

// 顶部进度条
function updateProgress() {
  const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  progressBar.style.width = (scrollPercent * 100) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
```

**Claude Code 直接启动提示词**：
```
直接帮我实现 PDF.js 全页展示功能：所有页面渲染为 canvas 垂直排列，
max-width 860px，解决高清屏模糊（devicePixelRatio 处理），
加懒加载（IntersectionObserver），加骨架屏占位，
加浮动页码指示器，整体样式毛玻璃深色风格。
```

---

## Phase 4 — 内容区块 & 收尾打磨

### 任务 4-A：About 区块

```css
/* 头像荧光脉冲动画 */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); }
  50%       { box-shadow: 0 0 0 16px rgba(0, 229, 255, 0); }
}

.avatar {
  border: 2px solid var(--glow-cyan);
  border-radius: 50%;
  animation: pulseGlow 3s ease-in-out infinite;
}
```

滚动入场：用 `IntersectionObserver` + `opacity: 0 → 1` + `translateY(30px → 0)` 实现

### 任务 4-B：项目卡片 3D 悬停效果

```javascript
// CSS perspective + JS 跟踪鼠标位置
card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 ~ 0.5
  const y = (e.clientY - rect.top)  / rect.height - 0.5;
  card.style.transform = `
    perspective(600px)
    rotateX(${-y * 10}deg)
    rotateY(${x * 10}deg)
    translateZ(8px)
  `;
});
card.addEventListener('mouseleave', () => {
  card.style.transform = '';
});
```

```css
.card {
  transition: transform 0.1s ease;
  transform-style: preserve-3d;
  border: 0.5px solid rgba(0, 229, 255, 0.2);
  /* 荧光边框悬停增强 */
}
.card:hover {
  border-color: rgba(0, 229, 255, 0.6);
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.15);
}
```

### 任务 4-C：性能优化 & 移动端降级

```javascript
// 移动端检测 & 降级
const isMobile = matchMedia('(max-width: 768px)').matches;
const PARTICLE_COUNT = isMobile ? 40 : 150;

// Canvas 性能优化：仅在粒子有变化时重绘
let needsRedraw = true;
function animate() {
  if (needsRedraw) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles();
  }
  requestAnimationFrame(animate);
}

// 页面不可见时暂停动画（省电）
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else animate();
});
```

| 优化项 | 目标 |
|--------|------|
| Lighthouse 性能分 | ≥ 90 |
| 首屏加载 | ≤ 2s |
| 移动端 FPS | ≥ 30fps |
| SEO meta | og:image / description / keywords |

### 任务 4-D：GitHub Actions 自动部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'          # 直接上传根目录所有静态文件
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 任务 4-E：标题流动色彩效果

为页面标题添加动态流动色彩，增强视觉吸引力：

**目标元素**：
- 导航栏 Logo "Neuraverse"（`.logo` 类）
- Hero 主标题 "Realm of Negentropy"（`.hero-title` 类）

**实现方案**：
1. **CSS 渐变动画**：使用 `background-clip: text` 配合 `linear-gradient` 动画
2. **色彩过渡**：在主题色（荧光青 `#00e5ff`、电蓝 `#4fc3f7`、淡紫 `#b388ff`）之间循环流动
3. **性能优化**：使用硬件加速（`transform: translateZ(0)`）确保流畅动画

**示例代码结构**：
```css
/* 流动渐变背景 */
@keyframes flowGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.logo, .hero-title {
  background: linear-gradient(
    90deg,
    var(--glow-cyan),
    var(--glow-blue),
    var(--glow-purple),
    var(--glow-cyan)
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: flowGradient 8s ease-in-out infinite;
}
```

**注意事项**：
- 确保 `background-clip: text` 浏览器兼容性（添加 `-webkit-` 前缀）
- 动画速度适中（8-10秒循环），避免视觉疲劳
- 支持 `prefers-reduced-motion` 无障碍降级

---

## 开发顺序建议

```
Phase 0 → Phase 1（骨架先跑通）→ Phase 3（PDF 核心功能）
→ Phase 2（鼠标特效叠加）→ Phase 4（内容完善 + 部署）
```

**原因**：PDF 功能是核心且最容易踩坑（高清屏、性能、布局），应优先验证；鼠标特效是视觉锦上添花，最后叠加风险最小。

---

## 常见坑 & 解决方案速查

| 坑 | 现象 | 解决方案 |
|----|------|---------|
| PDF Canvas 模糊 | 高清屏看起来很糊 | `canvas.width × dpr`，`ctx.scale(dpr, dpr)` |
| 粒子系统卡顿 | 移动端帧率 < 20fps | 减少粒子数量，关闭引力计算 |
| PDF 首屏加载慢 | 全部页面同时渲染 | IntersectionObserver 懒加载 |
| 光标闪烁 | lerp 更新频率不一致 | 统一在 `requestAnimationFrame` 里更新 |
| 字体 AI 味 | 使用了 Inter/Roboto | 换用 Syne + DM Mono |
| 背景色遮挡文字 | `mix-blend-mode` 失效 | 确保父元素无 `overflow: hidden` |

---

## Claude Code 快速提示词合集

**从头开始（推荐）**：
```
帮我从 Phase 0 开始搭建 Neuraverse 个人主页，先初始化项目结构和
CSS 变量系统，主题色：深宇宙蓝#0a0e1a + 荧光青#00e5ff + 淡紫#b388ff，
字体用 Syne（标题）+ DM Mono（代码）。
```

**直接做 PDF 功能**：
```
直接帮我实现 PDF.js 全页展示功能：所有页面渲染为 canvas 垂直排列，
max-width 860px，解决高清屏模糊（devicePixelRatio 处理），
加懒加载（IntersectionObserver），加浮动页码指示器，
毛玻璃深色风格容器样式。
```

**直接做鼠标效果**：
```
帮我实现 Neuraverse 网站的鼠标交互：双层荧光光标（内圈精准跟随 +
外圈 lerp 延迟）+ 点击粒子爆炸（对象池复用，12-18 个粒子径向扩散）
+ 背景粒子引力（150px 半径），颜色用 #00e5ff 和 #b388ff。
```

**背景粒子系统**：
```
用 Canvas 2D 实现深宇宙粒子背景：150 个粒子（移动端降级到 40），
粒子之间距离 < 120px 时连线（透明度随距离衰减），鼠标附近 150px
内产生引力吸附效果，粒子颜色随机取 #00e5ff / #4fc3f7 / #b388ff。
```

**3D 卡片效果**：
```
实现项目卡片 3D 透视悬停效果：CSS perspective 600px + JS 鼠标跟踪
rotateX/rotateY（各 ±10deg），悬停时荧光边框增强，鼠标离开平滑复位，
背景为半透明深色毛玻璃。
```

---

*文档版本：v1.0 | 主题：Neuraverse — Realm of Negentropy*
