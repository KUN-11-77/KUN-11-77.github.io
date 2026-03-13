<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

:root {
  --clr-bg-deep: #0D0F1A;
  --clr-bg-mid: #141726;
  --clr-bg-card: #1B2038;
  --clr-accent: #6C63FF;
  --clr-accent-cyan: #00D4FF;
  --clr-accent-gold: #F0C040;
  --clr-text-main: #C8CDD8;
  --clr-text-muted: #6B7280;
  --clr-border: #2E3560;
}

body {
  background-color: var(--clr-bg-deep);
  color: var(--clr-text-main);
  font-family: 'Space Grotesk', 'Noto Serif SC', sans-serif;
  line-height: 1.85;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* ── 动态彩色标题动画 ── */
@keyframes rainbow-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes glow-pulse {
  0%, 100% { text-shadow: 0 0 10px rgba(108,99,255,0.6), 0 0 30px rgba(0,212,255,0.3); }
  33%       { text-shadow: 0 0 15px rgba(0,212,255,0.8), 0 0 35px rgba(240,192,64,0.4); }
  66%       { text-shadow: 0 0 12px rgba(240,192,64,0.7), 0 0 28px rgba(108,99,255,0.5); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 主标题（H1） */
h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  font-weight: 900;
  letter-spacing: 0.08em;
  background: linear-gradient(270deg, #6C63FF, #00D4FF, #F0C040, #FF6B9D, #4ECDC4, #6C63FF);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 5s ease infinite, slide-in 0.8s ease;
  margin: 2rem 0 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--clr-border);
}

/* 二级标题（H2） */
h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.75rem);
  font-weight: 700;
  background: linear-gradient(270deg, #00D4FF, #6C63FF, #F0C040, #00D4FF);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 6s ease infinite 0.5s;
  letter-spacing: 0.05em;
  margin: 1.8rem 0 0.8rem;
}

/* 三级标题（H3） */
h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1rem, 2.2vw, 1.3rem);
  font-weight: 700;
  background: linear-gradient(270deg, #F0C040, #FF6B9D, #6C63FF, #F0C040);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 7s ease infinite 1s;
  margin: 1.4rem 0 0.6rem;
}

/* 代码块 */
pre {
  background: var(--clr-bg-card);
  border: 1px solid var(--clr-border);
  border-left: 3px solid var(--clr-accent);
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.7;
  color: #C8CDD8;
}

code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(108,99,255,0.12);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.88em;
  color: var(--clr-accent-cyan);
}

pre code {
  background: none;
  padding: 0;
  color: inherit;
}

/* 表格 */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2rem 0;
  background: var(--clr-bg-card);
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.9rem;
}

th {
  background: rgba(108,99,255,0.25);
  color: var(--clr-accent-cyan);
  font-family: 'Orbitron', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--clr-border);
}

td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid rgba(46,53,96,0.6);
  color: var(--clr-text-main);
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: rgba(108,99,255,0.06); }

/* 水平线 */
hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--clr-accent), var(--clr-accent-cyan), transparent);
  margin: 2.5rem 0;
  opacity: 0.5;
}

/* 强调 */
strong {
  color: var(--clr-accent-gold);
  font-weight: 600;
}

em { color: var(--clr-accent-cyan); font-style: italic; }

/* 超链接 */
a {
  color: var(--clr-accent);
  text-decoration: none;
  border-bottom: 1px dotted rgba(108,99,255,0.4);
  transition: color 0.2s, border-color 0.2s;
}

a:hover {
  color: var(--clr-accent-cyan);
  border-color: var(--clr-accent-cyan);
}

/* 封面标题特殊样式 */
.site-title {
  text-align: center;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  background: linear-gradient(270deg, #6C63FF, #00D4FF, #F0C040, #FF6B9D, #4ECDC4, #6C63FF);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 4s ease infinite;
  letter-spacing: 0.15em;
  margin: 1rem 0 0.3rem;
}

.site-subtitle {
  text-align: center;
  color: var(--clr-accent-gold);
  font-style: italic;
  letter-spacing: 0.2em;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
}

.doc-title {
  text-align: center;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.1rem, 3vw, 1.8rem);
  font-weight: 700;
  background: linear-gradient(270deg, #00D4FF, #6C63FF, #F0C040, #00D4FF);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 5s ease infinite 1s;
  margin: 0.5rem 0 0.2rem;
}

.doc-subtitle {
  text-align: center;
  color: var(--clr-text-muted);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.footer-text {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--clr-border);
  background: linear-gradient(270deg, #6C63FF, #00D4FF, #F0C040, #FF6B9D, #6C63FF);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 4s ease infinite;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.phase-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(108,99,255,0.25), rgba(0,212,255,0.15));
  border: 1px solid rgba(108,99,255,0.4);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  margin: 0.8rem 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  color: var(--clr-accent-cyan);
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<div class="site-title">✦ KUN's Tech Realm ✦</div>
<div class="site-subtitle">Realm of Negentropy</div>
<div class="doc-title">Claude Code 全栈实现路线计划书</div>
<div class="doc-subtitle">Full-Stack Implementation Roadmap for GitHub Pages Website</div>

| 仓库 Repository | KUN-11-77.github.io |
|---|---|
| **框架 Framework** | Hexo + NexT Theme |
| **实施工具 Tool** | Claude Code (CLI) |
| **文档版本 Version** | v1.0 · 2026-03-13 |

---

# 00 项目总览 / Project Overview

本计划书是为 KUN's Tech Realm 个人博客网站提供的、面向 Claude Code 的完整工程实现路线。以下七大核心功能模块将被系统性地设计、实施与验证，最终交付一个具有极高视觉质感与交互深度的科技感个人主页。

This roadmap covers **7 major feature modules** across **6 implementation phases**, engineered to transform a standard Hexo/NexT scaffold into a premium, high-fidelity personal tech portal with immersive interactivity.

| 功能模块 / Feature | 技术实现 / Implementation |
|---|---|
| **① 鼠标彩色光影跟随** | Canvas / CSS custom cursor + radial gradient trail |
| **② 中英文字体美化** | Google Fonts + 霞鹜文楷 / Noto Serif SC + variable font |
| **③ 排版布局优化** | CSS Grid, golden ratio spacing, responsive breakpoints |
| **④ 主题色调与风格** | 深色科技系 dark palette + glassmorphism + particle BG |
| **⑤ 动态效果与互动** | GSAP ScrollTrigger + Three.js starfield + Intersection Observer |
| **⑥ 云朵科技融合元素** | SVG animated clouds with neon glow + drift keyframes |
| **⑦ PDF 笔记展示系统** | PDF.js viewer + 4-category nav + search + lazy load |

---

# 六阶段实施概览 / Six-Phase Overview

| 阶段 | 主要内容 | 工期 | 优先级 |
|---|---|---|---|
| **Phase 1** | 环境核查 + 主题色彩系统 + 字体全局替换 | Day 1 | 🔴 Critical |
| **Phase 2** | 全局布局重构 + 排版优化 + 响应式 | Day 2 | 🔴 Critical |
| **Phase 3** | 鼠标光影 + Particle 背景 + ScrollTrigger | Day 2–3 | 🟠 High |
| **Phase 4** | 云朵科技元素 + Hero 动画 + 星空背景 | Day 3 | 🟠 High |
| **Phase 5** | PDF 笔记展示系统 + 四大分类导航 | Day 4–5 | 🟡 Medium |
| **Phase 6** | 性能优化 + 部署验证 + 细节精修 | Day 6 | 🟡 Medium |

---

<div class="phase-badge"><span>⬡ Phase 1 · 环境核查 · 色彩系统 · 字体美化</span><span>⏱ Day 1 &nbsp;(2–3h)</span></div>

## 1.1 前置环境检查 / Environment Audit

在 Claude Code 中首先执行以下检查命令，确认当前仓库结构完整：

```bash
# Claude Code 执行序列：
ls -la                        # 确认根目录结构
cat _config.yml | head -40    # 检查 Hexo 主配置
cat _config.next.yml | head -60  # 检查 NexT 主题配置
cat package.json              # 确认依赖版本
ls themes/                    # 确认主题目录
ls source/                    # 确认 source 目录结构
ls public/                    # 确认构建输出目录
```

## 1.2 色彩系统设计 / Color System

在 `source/css/` 目录下新建 `_variables.styl` 或 `custom.css`，定义以下 CSS 自定义属性：

```css
:root {
  /* ── Core Palette ── */
  --clr-bg-deep:     #0D0F1A;   /* 极深宇宙黑 */
  --clr-bg-mid:      #141726;   /* 面板背景 */
  --clr-bg-card:     #1B2038;   /* 卡片背景 */
  --clr-accent:      #6C63FF;   /* 主色调：量子紫 */
  --clr-accent-cyan: #00D4FF;   /* 辅助色：霓虹青 */
  --clr-accent-gold: #F0C040;   /* 点缀色：负熵金 */
  --clr-text-main:   #C8CDD8;   /* 正文色 */
  --clr-text-muted:  #6B7280;   /* 弱化文字 */
  --clr-border:      #2E3560;   /* 边框线 */

  /* ── Glow Effects ── */
  --glow-purple: 0 0 20px rgba(108,99,255,0.4);
  --glow-cyan:   0 0 20px rgba(0,212,255,0.4);
  --glow-gold:   0 0 15px rgba(240,192,64,0.35);

  /* ── Gradients ── */
  --grad-hero:   linear-gradient(135deg,#0D0F1A 0%,#141726 50%,#0D0F1A 100%);
  --grad-card:   linear-gradient(145deg,#1B2038,#141726);
  --grad-accent: linear-gradient(90deg,#6C63FF,#00D4FF);
}
```

## 1.3 字体美化系统 / Typography Enhancement

在 `_config.next.yml` 的 head 部分注入字体，并在 `custom.css` 中完成字体栈定义：

```html
<!-- _config.next.yml → custom_file_path → head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=
  Orbitron:wght@400;600;700;900&
  Space+Grotesk:wght@300;400;500;600;700&
  JetBrains+Mono:ital,wght@0,300;0,400;0,700;1,400&
  Noto+Serif+SC:wght@300;400;500;700&
  display=swap" rel="stylesheet">
```

```css
/* 本地字体（需下载）：霞鹜文楷 LXGW WenKai */
@font-face {
  font-family: "LXGW WenKai";
  src: url("/fonts/LXGWWenKai-Regular.woff2") format("woff2");
  font-display: swap;
}

/* 字体栈 */
body {
  font-family: "Space Grotesk","LXGW WenKai","Noto Serif SC",sans-serif;
  -webkit-font-smoothing: antialiased;
}
h1,h2,h3,h4 { font-family: "Orbitron","Space Grotesk",sans-serif; }
code, pre    { font-family: "JetBrains Mono",monospace; }
.site-title  { font-family: "Orbitron",sans-serif; letter-spacing: 0.15em; }
```

---

<div class="phase-badge"><span>⬡ Phase 2 · 全局布局重构 · 排版优化 · 响应式设计</span><span>⏱ Day 2 &nbsp;(3–4h)</span></div>

## 2.1 全局背景与 Hero 区域

```css
/* source/css/custom.css */
body {
  background-color: var(--clr-bg-deep);
  background-image:
    radial-gradient(ellipse 80% 60% at 50% -10%,
      rgba(108,99,255,0.18) 0%, transparent 65%),
    radial-gradient(ellipse 50% 40% at 90% 80%,
      rgba(0,212,255,0.10) 0%, transparent 60%);
  min-height: 100vh;
}

.header-inner {
  background: rgba(13,15,26,0.85);
  backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid rgba(108,99,255,0.25);
  position: sticky; top: 0; z-index: 100;
}

/* Hero Banner (首页大标题区) */
#hero {
  min-height: 100svh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

#hero .hero-title {
  font-size: clamp(2.4rem, 6vw, 5rem);
  font-family: "Orbitron", sans-serif;
  background: var(--grad-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  letter-spacing: 0.08em;
}

#hero .hero-sub {
  font-size: clamp(1rem, 2.5vw, 1.6rem);
  color: var(--clr-accent-gold);
  font-style: italic;
  letter-spacing: 0.2em;
}
```

## 2.2 文章卡片 Glassmorphism 效果

```css
.post-block, .post-article, article.post {
  background: rgba(27,32,56,0.55);
  backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid rgba(108,99,255,0.20);
  border-radius: 16px;
  padding: 2rem 2.4rem;
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
  position: relative;
  overflow: hidden;
}

.post-block::before {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg,
    rgba(108,99,255,0.06) 0%, transparent 50%);
  pointer-events: none;
}

.post-block:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: var(--glow-purple), 0 16px 48px rgba(0,0,0,0.5);
  border-color: rgba(108,99,255,0.5);
}
```

## 2.3 排版黄金比例系统

| 参数 Parameter | 数值 Value | 说明 Notes |
|---|---|---|
| `--spacing-base` | 1rem (16px) | 基础间距单位 |
| 内容最大宽 | 760px | 黄金比例阅读宽度 |
| 行高 line-height | 1.85 | 中文最佳阅读行高 |
| 正文字号 | `clamp(1rem,1.1vw,1.15rem)` | 流体字体缩放 |
| 段间距 | 1.6em | 中文段落推荐值 |

---

<div class="phase-badge"><span>⬡ Phase 3 · 鼠标光影 · 粒子背景 · ScrollTrigger</span><span>⏱ Day 2–3 &nbsp;(4–5h)</span></div>

## 3.1 鼠标彩色光影跟随特效 / Cursor Halo Effect

在 `source/js/cursor-effect.js` 中创建自定义光标和彩色轨迹系统：

```javascript
// source/js/cursor-effect.js
// 技术方案：Canvas 2D + CSS custom cursor + RAF 60fps

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// Canvas 全屏覆盖（pointer-events:none 不干扰点击）
Object.assign(canvas.style, {
  position: "fixed", inset: "0",
  width: "100vw", height: "100vh",
  zIndex: "9999", pointerEvents: "none",
});

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const COLORS = ["#6C63FF","#00D4FF","#F0C040","#FF6B9D","#4ECDC4"];
const particles = [];
let mx = 0, my = 0;

// 每次 mousemove 生成 3 个粒子
document.addEventListener("mousemove", e => {
  mx = e.clientX; my = e.clientY;
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: mx, y: my,
      r: Math.random() * 8 + 4,               // 初始半径
      life: 1.0,                               // 生命值 1→0
      decay: Math.random()*0.025+0.015,        // 衰减速率
      vx: (Math.random()-0.5)*2.5,             // x 速度
      vy: (Math.random()-0.5)*2.5 - 1,         // y 速度（微向上）
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
    });
  }
});

// 主光圈（跟随鼠标）
let haloX = 0, haloY = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  haloX += (mx - haloX) * 0.12;  // 插值跟随
  haloY += (my - haloY) * 0.12;

  // 主光圈渐变
  const grad = ctx.createRadialGradient(haloX,haloY,0,haloX,haloY,60);
  grad.addColorStop(0, "rgba(108,99,255,0.18)");
  grad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(haloX, haloY, 60, 0, Math.PI*2);
  ctx.fillStyle = grad; ctx.fill();

  // 粒子系统
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.06;  // 重力
    p.life -= p.decay; p.r *= 0.97;
    if (p.life <= 0) { particles.splice(i,1); continue; }
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = p.color; ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(animate);
}
animate();

// CSS 自定义光标
document.head.insertAdjacentHTML("beforeend", `<style>
body { cursor: none !important; }
#cursor-ring {
  position:fixed; width:24px; height:24px;
  border:2px solid var(--clr-accent-cyan);
  border-radius:50%; pointer-events:none;
  transform:translate(-50%,-50%);
  transition:width .2s,height .2s,border-color .2s;
  z-index:10000; mix-blend-mode: screen;
}
#cursor-dot {
  position:fixed; width:6px; height:6px;
  background:var(--clr-accent); border-radius:50%;
  pointer-events:none; transform:translate(-50%,-50%);
  z-index:10001;
}
</style>`);
```

## 3.2 粒子星空背景 / Particle Starfield

在 Hero 区域添加轻量 Canvas 星空背景：

```javascript
// source/js/starfield.js （轻量 Canvas 方案，无需 Three.js）
const STAR_COUNT = 180;
const stars = Array.from({length: STAR_COUNT}, () => ({
  x:     Math.random(),
  y:     Math.random(),
  r:     Math.random() * 1.8 + 0.3,
  speed: Math.random() * 0.00015 + 0.00005,
  alpha: Math.random() * 0.7 + 0.3,
  pulse: Math.random() * Math.PI * 2,
}));

function drawStars(canvas) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  stars.forEach(s => {
    s.pulse += s.speed * 60;
    const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${a})`;
    ctx.fill();
  });
}
```

## 3.3 GSAP ScrollTrigger 动画入场

```javascript
// _config.next.yml → vendors → custom_cdn 注入 GSAP
// 或直接在 head 注入:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

// source/js/scroll-animations.js
gsap.registerPlugin(ScrollTrigger);

// 文章卡片渐入
gsap.utils.toArray(".post-block").forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 60, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 0.7,
      delay: i * 0.08, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    }
  );
});

// 标题字符逐个显现（Hero）
gsap.from(".hero-title .char", {
  opacity: 0, y: 40, rotateX: 45,
  stagger: 0.04, duration: 0.8, ease: "back.out(1.5)",
});
```

---

<div class="phase-badge"><span>⬡ Phase 4 · 云朵科技元素 · Hero 动画 · 氛围光效</span><span>⏱ Day 3 &nbsp;(3–4h)</span></div>

## 4.1 云朵科技融合设计概念 / Cloud-Tech Aesthetic

云朵元素定位：将传统云朵形态与霓虹发光、像素化、数据流效果结合，形成**"数字云海"**视觉语言，与深色科技底色形成反差美感。

| 效果类型 | 实现技术 | 视觉特征 |
|---|---|---|
| SVG 霓虹云 | SVG filter + CSS animation | 蓝紫色发光漂浮云团 |
| 像素化云朵 | Canvas pixelation shader | 低像素风格，像素方块组成 |
| 数据流云 | CSS clip-path + particle | 云形粒子流动效果 |
| 分区装饰云 | HTML/CSS 伪元素 | section 间隔漂浮装饰 |

## 4.2 SVG 霓虹云朵核心代码

```html
<!-- source/_data/head.njk 或直接嵌入 layout -->
<svg class="cloud-deco" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow-cloud">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="cloud-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#6C63FF" stop-opacity="0.7"/>
      <stop offset="50%"  stop-color="#00D4FF" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#6C63FF" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <!-- 云体由多个重叠圆组成 -->
  <g filter="url(#glow-cloud)" fill="url(#cloud-grad)">
    <circle cx="120" cy="110" r="55"/>
    <circle cx="180" cy="90"  r="70"/>
    <circle cx="255" cy="105" r="55"/>
    <circle cx="305" cy="120" r="40"/>
    <rect   x="80"  y="120" width="265" height="55" rx="8"/>
  </g>
</svg>
```

```css
/* CSS 漂浮动画 */
.cloud-deco {
  position: absolute;
  animation: cloud-drift 8s ease-in-out infinite;
  opacity: 0.18;
}

@keyframes cloud-drift {
  0%,100% { transform: translateY(0)    translateX(0);   }
  33%      { transform: translateY(-18px) translateX(12px); }
  66%      { transform: translateY(-8px)  translateX(-8px); }
}
```

## 4.3 Hero 区域完整布局结构

```html
<!--
Hero 区域层次（从底到顶）：
  Layer 0: Canvas 星空背景
  Layer 1: 径向渐变光晕
  Layer 2: SVG 云朵（后层，左下角）
  Layer 3: 文字内容（主标题 + 副标题 + CTA）
  Layer 4: SVG 云朵（前层，右上角，半透明）
  Layer 5: 扫光动画线条（CSS animation）
-->
<section id="hero">
  <canvas id="starfield"></canvas>
  <div class="hero-glow"></div>
  <svg class="cloud-bg cloud-left">...</svg>

  <div class="hero-content">
    <p class="hero-eyebrow">✦ Realm of Negentropy ✦</p>
    <h1 class="hero-title">
      <span class="char-split">KUN's</span>
      <span class="char-split gradient-text">Tech</span>
      <span class="char-split">Realm</span>
    </h1>
    <p class="hero-desc">Exploring the boundary of order and chaos</p>
    <div class="hero-cta">
      <a href="/archives" class="btn-primary">Enter the Realm →</a>
      <a href="/notes"    class="btn-secondary">View Notes</a>
    </div>
  </div>

  <svg class="cloud-fg cloud-right">...</svg>
</section>
```

---

<div class="phase-badge"><span>⬡ Phase 5 · PDF 笔记展示系统 · 四大分类导航</span><span>⏱ Day 4–5 &nbsp;(6–8h)</span></div>

## 5.1 PDF 笔记目录结构规划

将本地 PDF 文件夹同步到仓库的 `source/notes/` 目录，按四大方向分类：

```
source/
└── notes/
    ├── math/            # 数学基础
    │   ├── linear-algebra.pdf
    │   ├── calculus.pdf
    │   └── probability.pdf
    ├── physics/         # 物理基础
    │   ├── electromagnetism.pdf
    │   └── quantum-mechanics.pdf
    ├── ee/              # 电子信息
    │   ├── signal-processing.pdf
    │   └── circuit-theory.pdf
    └── ai/              # 人工智能（计算机基础）
        ├── machine-learning.pdf
        ├── deep-learning.pdf
        └── algorithms.pdf

# 同时在 source/notes/ 创建索引文件：
source/notes/index.json   # 所有 PDF 的元数据索引
```

## 5.2 notes/index.json 元数据格式

```json
{
  "categories": [
    {
      "id": "math",
      "title": "数学基础",
      "title_en": "Mathematical Foundations",
      "icon": "∑",
      "color": "#6C63FF",
      "description": "线性代数 · 微积分 · 概率论与统计",
      "files": [
        {
          "name": "线性代数笔记",
          "filename": "linear-algebra.pdf",
          "path": "/notes/math/linear-algebra.pdf",
          "tags": ["矩阵","特征值","线性变换"],
          "updated": "2026-03",
          "pages": 48
        }
      ]
    },
    { "id": "physics", "title": "物理基础", "icon": "⚛", "color": "#00D4FF" },
    { "id": "ee",      "title": "电子信息", "icon": "📡", "color": "#F0C040" },
    { "id": "ai",      "title": "人工智能", "icon": "🧠", "color": "#4CAF50" }
  ]
}
```

## 5.3 Hexo 笔记页面创建

```bash
# Step 1: 创建 notes 页面
hexo new page notes
# → 生成 source/notes/index.md

# Step 2: 修改 source/notes/index.md
---
title:    "Tech Notes · 技术笔记"
date:     2026-03-13
layout:   notes   # 使用自定义 layout
comments: false
---

# Step 3: 在 themes/next/layout/ 创建 notes.njk
# (详见 5.4 节)
```

## 5.4 notes.njk 核心布局模板

```njk
{# themes/next/layout/notes.njk #}
{% extends "_layout.njk" %}
{% block content %}
<div class="notes-page">

  <!-- 页面 Hero -->
  <div class="notes-hero">
    <h1>Tech Notes <span class="grad">· 技术笔记</span></h1>
    <p>四大方向 · 系统整理 · 持续更新</p>
    <div class="notes-search">
      <input id="notes-search" placeholder="搜索笔记..." />
      <span class="search-icon">⌕</span>
    </div>
  </div>

  <!-- 分类 Tab 导航 -->
  <nav class="notes-tabs" id="notes-tabs">
    <button class="tab active" data-cat="all">全部</button>
    <button class="tab" data-cat="math">∑ 数学基础</button>
    <button class="tab" data-cat="physics">⚛ 物理基础</button>
    <button class="tab" data-cat="ee">📡 电子信息</button>
    <button class="tab" data-cat="ai">🧠 人工智能</button>
  </nav>

  <!-- 笔记卡片网格 -->
  <div class="notes-grid" id="notes-grid">
    <!-- 动态渲染，见 notes.js -->
  </div>

  <!-- PDF 查看器弹窗 -->
  <div class="pdf-modal" id="pdf-modal">
    <div class="pdf-modal-inner">
      <div class="pdf-modal-header">
        <span id="pdf-title">笔记标题</span>
        <div class="pdf-controls">
          <button id="pdf-prev">‹</button>
          <span id="pdf-page">1 / 1</span>
          <button id="pdf-next">›</button>
          <a id="pdf-download" download>↓ 下载</a>
          <button id="pdf-close">✕</button>
        </div>
      </div>
      <canvas id="pdf-canvas"></canvas>
    </div>
  </div>

</div>
{% endblock %}
```

## 5.5 PDF.js 查看器核心代码

```javascript
// source/js/notes.js
// 依赖：PDF.js (cdn) + index.json

// 1. 加载 PDFJS worker
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/";
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN + "pdf.worker.min.mjs";

// 2. 获取元数据 & 渲染卡片
async function loadNotes() {
  const res  = await fetch("/notes/index.json");
  const data = await res.json();
  renderGrid(data.categories);
  initTabs(data.categories);
  initSearch(data.categories);
}

// 3. 卡片渲染
function renderCard(file, cat) {
  return `
    <div class="note-card" data-cat="${cat.id}" data-path="${file.path}">
      <div class="note-card-icon" style="color:${cat.color}">${cat.icon}</div>
      <div class="note-card-body">
        <h3>${file.name}</h3>
        <div class="note-tags">${file.tags.map(t=>`<span>${t}</span>`).join("")}</div>
        <div class="note-meta">${file.pages}页 · ${file.updated}</div>
      </div>
      <div class="note-card-actions">
        <button onclick="openPDF('${file.path}','${file.name}')">阅读</button>
        <a href="${file.path}" download>下载</a>
      </div>
    </div>
  `;
}

// 4. PDF 渲染（第 1 页预览 + 翻页）
let pdfDoc = null, pageNum = 1;

async function openPDF(path, title) {
  document.getElementById("pdf-modal").classList.add("open");
  document.getElementById("pdf-title").textContent = title;
  document.getElementById("pdf-download").href = path;
  pdfDoc = await pdfjsLib.getDocument(path).promise;
  renderPage(1);
}

async function renderPage(n) {
  const page   = await pdfDoc.getPage(n);
  const canvas = document.getElementById("pdf-canvas");
  const ctx    = canvas.getContext("2d");
  const vp     = page.getViewport({ scale: 1.6 });
  canvas.width  = vp.width;
  canvas.height = vp.height;
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  document.getElementById("pdf-page").textContent = `${n} / ${pdfDoc.numPages}`;
  pageNum = n;
}
```

## 5.6 笔记卡片样式设计

```css
/* 四大分类颜色系统 */
[data-cat="math"]    { --cat-color: #6C63FF; }
[data-cat="physics"] { --cat-color: #00D4FF; }
[data-cat="ee"]      { --cat-color: #F0C040; }
[data-cat="ai"]      { --cat-color: #4CAF50; }

.note-card {
  background: var(--grad-card);
  border: 1px solid rgba(var(--cat-color-rgb, 108,99,255), 0.25);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.note-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 0 25px rgba(var(--cat-color-rgb),0.35),
              0 20px 50px rgba(0,0,0,0.6);
  border-color: var(--cat-color);
}

/* PDF Modal */
.pdf-modal {
  position: fixed; inset: 0; z-index: 9990;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(12px);
  display: none; place-items: center;
}
.pdf-modal.open { display: grid; }
.pdf-modal-inner {
  background: var(--clr-bg-mid);
  border: 1px solid var(--clr-accent);
  border-radius: 20px;
  max-width: min(900px, 94vw);
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--glow-purple);
}
```

---

<div class="phase-badge"><span>⬡ Phase 6 · 性能优化 · 部署验证 · 细节精修</span><span>⏱ Day 6 &nbsp;(2–3h)</span></div>

## 6.1 性能优化清单 / Performance Checklist

| 优化项 | 工具 / 方案 | 优先级 |
|---|---|---|
| 字体子集化（仅加载用到的字形） | pyftsubset / 在线工具 | 🔴 必做 |
| JS 懒加载（cursor/starfield/GSAP） | IntersectionObserver + dynamic import | 🔴 必做 |
| PDF 延迟加载（仅点击时加载） | 动态 `import()` PDF.js | 🔴 必做 |
| 图片 WebP 转换 + `loading="lazy"` | sharp / Hexo plugin | 🟠 推荐 |
| Canvas 动画 reduced-motion 适配 | `prefers-reduced-motion` CSS media | 🟠 推荐 |
| Hexo 静态资源压缩 | hexo-filter-optimize | 🟡 可选 |

## 6.2 Claude Code 完整执行命令序列

以下为交给 Claude Code 执行的完整命令链，按阶段组织：

```bash
# ────────────── Phase 1: 色彩系统 & 字体 ──────────────
touch source/css/custom.css
touch source/js/cursor-effect.js
touch source/js/starfield.js
touch source/js/scroll-animations.js
# 下载霞鹜文楷字体到 source/fonts/
mkdir -p source/fonts

# ────────────── Phase 2: 布局重构 ──────────────
# 编辑 _config.next.yml:
# custom_file_path → head_end → style_end → body_end

# ────────────── Phase 3: 交互特效 ──────────────
# 注入 JS 文件到 _config.next.yml custom_scripts

# ────────────── Phase 4: 云朵元素 ──────────────
# 修改 themes/next/layout/_layout.njk Hero 区域

# ────────────── Phase 5: 笔记系统 ──────────────
hexo new page notes
mkdir -p source/notes/math source/notes/physics
mkdir -p source/notes/ee source/notes/ai
# 将本地 PDF 文件复制到对应目录
# 创建 source/notes/index.json
# 创建 themes/next/layout/notes.njk
touch source/js/notes.js
touch source/css/notes.css

# ────────────── Phase 6: 构建验证 ──────────────
hexo clean && hexo generate
hexo server --debug  # 本地预览 http://localhost:4000

# 确认所有功能正常后：
git add -A
git commit -m "feat: complete Tech Realm redesign v2.0"
git push origin main  # 触发 GitHub Actions 部署
```

## 6.3 GitHub Actions 自动部署配置

```yaml
# .github/workflows/deploy.yml
name: Deploy Hexo to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - name: Install & Build
        run: |
          npm install -g pnpm
          pnpm install
          npx hexo generate
      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

---

# 附录 / Appendix

## A — `_config.next.yml` 关键配置项速查

```yaml
# 以下为需要在 _config.next.yml 中修改/添加的关键配置：

scheme: Gemini   # 或 Muse / Pisces — 推荐 Gemini 支持侧边栏
darkmode: true

custom_file_path:
  head:   source/_data/head.njk    # 字体注入、meta
  style:  source/_data/styles.styl # 自定义样式入口
  script: source/_data/scripts.njk # JS 注入

font:
  enable: true
  host:   https://fonts.googleapis.com
  global:
    family: Space Grotesk
    size:   1
  title:
    family: Orbitron

motion:
  enable: true
  async:  true
  transition:
    post_block: fadeIn
    header:     fadeInDown

# 导航菜单添加笔记入口：
menu:
  home:     / || fa fa-home
  archives: /archives/ || fa fa-archive
  notes:    /notes/ || fa fa-book    # 新增
```

## B — 文件修改清单 / File Change Index

| 文件路径 | 操作 | 说明 |
|---|---|---|
| `_config.yml` | **修改** | 站点基础配置 |
| `_config.next.yml` | **修改** | NexT 主题核心配置 |
| `source/css/custom.css` | **新建** | 全局自定义样式 |
| `source/css/notes.css` | **新建** | 笔记页面专属样式 |
| `source/js/cursor-effect.js` | **新建** | 鼠标光影特效 |
| `source/js/starfield.js` | **新建** | Canvas 星空背景 |
| `source/js/scroll-animations.js` | **新建** | GSAP 滚动动画 |
| `source/js/notes.js` | **新建** | PDF 笔记系统逻辑 |
| `source/notes/index.md` | **新建** | 笔记页面入口 |
| `source/notes/index.json` | **新建** | PDF 元数据索引 |
| `source/fonts/` (字体文件) | **新建** | 霞鹜文楷 WOFF2 |
| `themes/next/layout/notes.njk` | **新建** | 笔记页面布局模板 |
| `themes/next/layout/_layout.njk` | **修改** | Hero 区域云朵注入 |
| `source/_data/head.njk` | **新建** | Head 自定义注入 |
| `.github/workflows/deploy.yml` | **新建** | CI/CD 部署配置 |

## C — 参考资源 / References

| 资源名称 | 地址 / 说明 |
|---|---|
| Hexo Docs | https://hexo.io/docs/ |
| NexT Theme | https://theme-next.js.org/docs/ |
| PDF.js | https://mozilla.github.io/pdf.js/ |
| GSAP Docs | https://gsap.com/docs/v3/ |
| 霞鹜文楷字体 | https://github.com/lxgw/LxgwWenKai |
| Orbitron Font | https://fonts.google.com/specimen/Orbitron |
| cdnjs | https://cdnjs.com/ (GSAP, PDF.js, Three.js CDN) |

---

<div class="footer-text">✦ KUN's Tech Realm · Realm of Negentropy ✦<br><small style="-webkit-text-fill-color: #6B7280; font-family: 'Space Grotesk'; font-size: 0.78rem;">Claude Code Implementation Roadmap v1.0 · 2026-03-13</small></div>
