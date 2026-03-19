# Neuraverse · Singularity Edition

## 个人主页 V2 全维度进化路线图

> **设计哲学**：不是"好看的网站"，是一个有灵魂的数字宇宙体验装置。
> 每一次交互都应该让人感受到：这个人的思维方式本身就与众不同。
>
> **技术基座**：Vanilla HTML / CSS / JS + GSAP 3 + Three.js r158 + Lenis.js + PDF.js
> **部署**：GitHub Pages · Cloudflare CDN 加速 · 自动化 CI/CD

---

```
V1 → V2 进化方向
─────────────────────────────────────────────────────────────────
V1：Canvas 2D 粒子背景 + 基础 PDF 展示 + 简单自定义光标
V2：Three.js 3D 宇宙场景 + 着色器特效 + 全站流体交互 +
    智能内容呈现系统 + WebGL 后处理 + 空间音效响应
─────────────────────────────────────────────────────────────────
```

---

## 全局技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     RENDERING PIPELINE                          │
│                                                                 │
│  Three.js WebGL Scene                                           │
│  ├── PointCloud Galaxy (400k particles, custom shader)         │
│  ├── Neural Mesh Network (dynamic topology)                     │
│  ├── Bloom + ChromaticAberration PostProcessing                 │
│  └── Environment HDRI Reflection                               │
│                                                                 │
│  DOM Layer (z-index hierarchy)                                  │
│  ├── Smooth Scroll (Lenis)                                     │
│  ├── GSAP ScrollTrigger pinned sections                        │
│  ├── CSS Houdini Paint Worklets (noise texture)                │
│  └── Web Animations API micro-interactions                     │
│                                                                 │
│  Data Layer                                                     │
│  ├── Static JSON manifests (projects, timeline)                │
│  ├── PDF.js lazy rendering                                     │
│  └── LocalStorage preference persistence                       │
└─────────────────────────────────────────────────────────────────┘
```

### CDN 依赖清单（按加载优先级）

```html
<!-- 预连接加速 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://cdnjs.cloudflare.com" />

<!-- 字体（Phase 0 保留）-->
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Instrument+Serif:ital@0;1&display=swap"
  rel="stylesheet"
/>

<!-- 核心运行时 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js"></script>

<!-- PDF.js（notes.html 页面单独引入）-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
```

---

## 扩展色彩系统 V2

```css
:root {
  /* ── 基础宇宙色 ── */
  --cosmos-bg: #060810; /* 更深的太空黑 */
  --nebula-layer: #0d1122;
  --void-depth: #020308; /* 最深处 */

  /* ── 主发光色 ── */
  --glow-cyan: #00e5ff;
  --glow-blue: #4fc3f7;
  --glow-purple: #b388ff;
  --neural-pink: #f48fb1;
  --singularity: #ff6b35; /* 新增：奇点橙，用于关键交互反馈 */
  --antimatter: #e040fb; /* 新增：反物质紫，用于警示/高亮 */

  /* ── 材质/质感 ── */
  --glass-fill: rgba(13, 17, 34, 0.65);
  --glass-border: rgba(0, 229, 255, 0.12);
  --glass-border-hover: rgba(0, 229, 255, 0.45);
  --surface-raised: rgba(20, 26, 50, 0.8);

  /* ── 文字 ── */
  --text-primary: #eef0f8;
  --text-secondary: #8892b0;
  --text-muted: #4a5478;
  --text-accent: var(--glow-cyan);

  /* ── 阴影/光晕 ── */
  --shadow-glow: 0 0 40px rgba(0, 229, 255, 0.12);
  --shadow-deep: 0 24px 80px rgba(0, 0, 0, 0.6);
  --shadow-singularity: 0 0 60px rgba(255, 107, 53, 0.25);

  /* ── 动效时间曲线 ── */
  --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-inertia: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Phase A — 沉浸式 3D 宇宙背景系统

> **目标**：用 Three.js 替换 V1 的 Canvas 2D 粒子系统，打造真正的三维宇宙场景

### A-1：银河粒子场（WebGL Points + 自定义顶点着色器）

```javascript
// galaxy.js — 40万粒子银河系

const GALAXY_CONFIG = {
  count: 400_000,
  radius: 8,
  branches: 6, // 旋臂数量
  spin: 1.2, // 旋臂弯曲度
  randomness: 0.2,
  randomPower: 3,
  colors: {
    inner: new THREE.Color("#ff6b35"), // 星核橙
    outer: new THREE.Color("#1a237e"), // 星晕深蓝
  },
};

// 顶点着色器 — 自定义大小衰减 + 距离感
const vertexShader = `
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  uniform   float uTime;
  uniform   float uPixelRatio;

  void main() {
    vColor = aColor;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // 旋转动画
    float angle = atan(modelPosition.x, modelPosition.z);
    float dist  = length(modelPosition.xz);
    float angleOffset = (1.0 / dist) * uTime * 0.15;
    modelPosition.x = cos(angle + angleOffset) * dist;
    modelPosition.z = sin(angle + angleOffset) * dist;

    vec4 viewPosition  = viewMatrix * modelPosition;
    vec4 projPosition  = projectionMatrix * viewPosition;
    gl_Position = projPosition;

    // 粒子大小随摄像机距离衰减
    gl_PointSize = aSize * uPixelRatio * (1.0 / -viewPosition.z) * 200.0;
  }
`;

// 片元着色器 — 软边圆点
const fragmentShader = `
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha);
  }
`;
```

### A-2：动态神经网络拓扑（LineSegments + 动画拓扑变换）

```javascript
// neural-mesh.js — 实时生成/溶解的神经连接网络

class NeuralMesh {
  constructor(scene) {
    this.nodes = [];
    this.edges = [];
    this.maxEdges = 800;
    this.threshold = 1.8; // 连线距离阈值
  }

  // 节点在空间中缓慢游走（Perlin噪声驱动位移）
  update(time) {
    this.nodes.forEach((node, i) => {
      node.x += Math.sin(time * 0.3 + i * 1.7) * 0.002;
      node.y += Math.cos(time * 0.2 + i * 2.3) * 0.002;
      node.z += Math.sin(time * 0.4 + i * 0.9) * 0.001;
    });
    this.rebuildEdges();
  }

  // 边缘透明度随距离指数衰减，制造雾感深度
  getEdgeOpacity(dist) {
    return Math.exp((-dist * dist) / (this.threshold * this.threshold));
  }
}
```

### A-3：WebGL 后处理管线（UnrealBloom + 色像差）

```javascript
// postprocessing.js
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

// Bloom 参数（高强度 = 星光感）
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2, // 强度 (strength)
  0.4, // 半径 (radius)
  0.1, // 阈值 (threshold) — 越低越多元素发光
);

// 自定义色像差 Shader（摄像机移动时偏移加强）
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOffset: { value: new THREE.Vector2(0.002, 0.002) },
    uStrength: { value: 1.0 },
  },
  vertexShader: `...`,
  fragmentShader: `
    // RGB 三通道空间偏移
    vec2 rUV = vUv + uOffset * uStrength;
    vec2 bUV = vUv - uOffset * uStrength;
    gl_FragColor = vec4(
      texture2D(tDiffuse, rUV).r,
      texture2D(tDiffuse, vUv).g,
      texture2D(tDiffuse, bUV).b,
      1.0
    );
  `,
};
```

### A-4：摄像机电影叙事运动系统

```javascript
// camera-director.js — 摄像机根据滚动位置执行电影级运动

class CameraDirector {
  constructor(camera) {
    this.camera = camera;
    this.keyframes = [
      // [进度(0-1), 位置xyz, lookAt xyz, bloomStrength]
      [0.0, [0, 2, 12], [0, 0, 0], 1.2], // Hero：正面俯视银河
      [0.2, [-6, 4, 8], [0, 0, 0], 1.8], // About：侧飞进入
      [0.45, [0, 8, 3], [0, 0, 0], 2.4], // Projects：垂直俯冲
      [0.7, [8, 1, 6], [0, 0, 0], 1.0], // Notes：轨道环绕
      [1.0, [0, 0, 15], [0, 0, 0], 0.6], // Contact：退出全景
    ];
  }

  // 平滑插值当前进度对应的摄像机状态
  update(scrollProgress) {
    const [pos, lookAt, bloom] = this.interpolate(scrollProgress);
    gsap.to(this.camera.position, {
      x: pos[0],
      y: pos[1],
      z: pos[2],
      duration: 1.2,
      ease: "power2.out",
    });
  }
}
```

---

## Phase B — 流体滚动与叙事动效系统

> **目标**：把"页面滚动"变成"时间轴穿越"体验

### B-1：Lenis 惯性滚动 + GSAP ScrollTrigger 集成

```javascript
// smooth-scroll.js

const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 0.8,
  touchMultiplier: 2.0,
});

// 关键：Lenis 与 GSAP ticker 同步
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ScrollTrigger 使用 Lenis 的 scroll 事件
lenis.on("scroll", ScrollTrigger.update);
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop: (value) =>
    value !== undefined ? lenis.scrollTo(value) : lenis.scroll,
  getBoundingClientRect: () => ({
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }),
});
```

### B-2：章节叙事过渡（Pinned Section + Timeline 动画）

```javascript
// narrative-scroll.js — 每个 section 拥有独立故事线

// === Hero Section ===
const heroTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: 1.5, // scrub 越大越顺滑
    pin: true,
  },
});
heroTimeline
  .from(".hero-eyebrow", { y: 40, opacity: 0, duration: 0.3 })
  .from(
    ".hero-title span",
    { y: 80, opacity: 0, stagger: 0.08, duration: 0.5 },
    "-=0.1",
  )
  .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.3 })
  .from(".hero-cta", { scale: 0.8, opacity: 0, duration: 0.3 }, "-=0.1")
  .to(".hero-bg-overlay", { opacity: 0.85, duration: 0.5 }, 0) // 背景逐渐加深
  .to(camera.position, { z: 6, duration: 1 }, 0); // 镜头推近

// === Projects Section（水平滚动轨道）===
const projectsTrack = gsap.timeline({
  scrollTrigger: {
    trigger: "#projects",
    start: "top top",
    end: () => `+=${document.querySelector(".projects-rail").scrollWidth}`,
    scrub: 1,
    pin: true,
  },
});
projectsTrack.to(".projects-rail", {
  x: () =>
    -(document.querySelector(".projects-rail").scrollWidth - window.innerWidth),
  ease: "none",
});
```

### B-3：文字分层视差（Clip-path + Split Text）

```javascript
// text-split.js — 将标题拆分为字母级动画单元

class TextSplitter {
  split(element) {
    const text = element.textContent;
    element.innerHTML = text
      .split("")
      .map(
        (char, i) =>
          `<span class="char" style="--i:${i}">${char === " " ? "&nbsp;" : char}</span>`,
      )
      .join("");
    return element.querySelectorAll(".char");
  }

  // 每字母独立 3D 旋转入场
  animateIn(chars) {
    gsap.from(chars, {
      y: "120%",
      rotateX: 90,
      opacity: 0,
      duration: 0.8,
      stagger: 0.025,
      ease: "back.out(1.7)",
      transformOrigin: "bottom center",
    });
  }
}
```

### B-4：视差多层背景（CSS Perspective + JS 深度驱动）

```css
/* 三层视差容器 */
.parallax-world {
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
}

/* 图层速度公式：translateZ 越负，滚动越慢（视觉上越远）*/
.layer-deep {
  transform: translateZ(-200px) scale(1.2);
} /* 最远 0.5x 速度 */
.layer-mid {
  transform: translateZ(-100px) scale(1.1);
} /* 中景 0.75x 速度 */
.layer-surface {
  transform: translateZ(0);
} /* 前景 1x 速度 */
```

---

## Phase C — 高级光标与物理交互系统

> **升级方向**：V1 是跟随光标，V2 是光标影响整个场景物理

### C-1：磁力场光标系统（Magnetic UI Elements）

```javascript
// magnetic-cursor.js

class MagneticCursor {
  constructor() {
    this.cursor = { x: 0, y: 0 };
    this.dot = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.initMagnets();
  }

  // 按钮/卡片进入磁力范围时被吸附
  initMagnets() {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const strength = parseFloat(el.dataset.magnetic) || 0.4;

        gsap.to(el, {
          x: dx * strength,
          y: dy * strength,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      });
    });
  }

  // 光标拖尾：8个残影 div，透明度和大小递减
  initTrail() {
    this.trail = Array.from({ length: 8 }, (_, i) => {
      const el = document.createElement("div");
      el.className = "cursor-trail";
      el.style.cssText = `
        opacity: ${((8 - i) / 8) * 0.3};
        width:   ${8 - i}px;
        height:  ${8 - i}px;
        transition-duration: ${50 + i * 30}ms;
      `;
      document.body.appendChild(el);
      return el;
    });
  }
}
```

### C-2：上下文感知光标形态变换

```javascript
// cursor-morphing.js
// 光标根据悬停元素自动变形

const CURSOR_MODES = {
  default: {
    scale: 1,
    color: "var(--glow-cyan)",
    mixBlend: "screen",
    label: "",
    shape: "circle",
  },
  link: {
    scale: 1.8,
    color: "var(--glow-purple)",
    mixBlend: "difference",
    label: "",
    shape: "circle",
  },
  pdf: {
    scale: 2.5,
    color: "var(--neural-pink)",
    mixBlend: "screen",
    label: "READ",
    shape: "circle",
    showLabel: true,
  },
  video: {
    scale: 3.0,
    color: "var(--singularity)",
    mixBlend: "screen",
    label: "▶",
    shape: "circle",
    showLabel: true,
  },
  drag: {
    scale: 1.5,
    color: "white",
    mixBlend: "difference",
    label: "DRAG",
    shape: "crosshair",
    showLabel: true,
  },
  code: {
    scale: 1.2,
    color: "var(--glow-blue)",
    mixBlend: "screen",
    label: "</>",
    shape: "square",
    showLabel: true,
  },
};

// 通过 data-cursor 属性声明模式
// <a data-cursor="link"> <canvas data-cursor="pdf">
document.addEventListener("mouseover", (e) => {
  const mode = e.target.closest("[data-cursor]")?.dataset.cursor || "default";
  cursor.morph(CURSOR_MODES[mode]);
});
```

### C-3：点击涟漪 · 引力场 · 扰动场

```javascript
// interactions.js

// 点击：SVG 同心涟漪扩散（比 Canvas 粒子更优雅）
function createRipple(x, y) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.cssText = `position:fixed; left:${x}px; top:${y}px; pointer-events:none; z-index:9998`;
  svg.innerHTML = [1, 2, 3]
    .map(
      (i) => `
    <circle cx="0" cy="0" r="0" fill="none"
      stroke="${i === 1 ? "var(--glow-cyan)" : i === 2 ? "var(--glow-purple)" : "var(--neural-pink)"}"
      stroke-width="${4 - i}" opacity="${1 - i * 0.25}">
      <animate attributeName="r"   values="0;${60 * i}" dur="${0.5 + i * 0.2}s" fill="freeze"/>
      <animate attributeName="opacity" values="${1 - i * 0.25};0" dur="${0.5 + i * 0.2}s" fill="freeze"/>
    </circle>
  `,
    )
    .join("");
  document.body.appendChild(svg);
  setTimeout(() => svg.remove(), 1500);
}

// 背景粒子：鼠标附近形成动态排斥场（而非 V1 的简单引力）
// 排斥场使粒子在光标周围形成空洞，营造"能量撕裂"视觉
function applyRepulsionField(particle, mousePos) {
  const dx = particle.x - mousePos.x;
  const dy = particle.y - mousePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const RADIUS = 200;

  if (dist < RADIUS) {
    const force = Math.pow((RADIUS - dist) / RADIUS, 2) * 0.8;
    particle.vx += (dx / dist) * force;
    particle.vy += (dy / dist) * force;
  }
}
```

---

## Phase D — Hero Section 终极形态

> **目标**：打开网页的第一屏要让人停住，舍不得滚动

### D-1：打字机 + 词语变形动画（Morphing Text）

```javascript
// morphing-text.js
// 核心词语在"物理学家 → 工程师 → 构建者 → 思考者"之间变形

const IDENTITIES = ["Physicist", "Builder", "Thinker", "Explorer", "Engineer"];

class MorphingText {
  morph(fromText, toText) {
    // 逐字符交叉溶解，非整体切换
    // 算法：Levenshtein 编辑路径 → 对应字符位置做 opacity + translateY 动画
    const from = fromText.split("");
    const to = toText.split("");
    const maxLen = Math.max(from.length, to.length);

    return gsap
      .timeline()
      .to(this.chars, {
        y: -20,
        opacity: 0,
        duration: 0.2,
        stagger: 0.02,
        ease: "power1.in",
      })
      .call(() => this.setText(toText))
      .from(this.chars, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        stagger: 0.02,
        ease: "power2.out",
      });
  }
}
```

### D-2：Hero 背景：着色器扭曲场（GLSL Distortion Field）

```glsl
/* hero-distortion.frag — 用于 Three.js PlaneGeometry 作为 Hero 背景 */

uniform float uTime;
uniform vec2  uMouse;
uniform sampler2D uTexture1;  /* 神经宇宙背景图 1 */
uniform sampler2D uTexture2;  /* 突触特写图 2 */

varying vec2 vUv;

// 2D 旋转矩阵
mat2 rotate2D(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

// 分形布朗运动噪声（创造有机扭曲感）
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(p);
    p = rotate2D(0.5) * p * 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;

  // 鼠标位置驱动的局部扭曲
  vec2 mouseOffset = uMouse - vec2(0.5);
  float mouseDist  = length(mouseOffset);
  vec2 distortion  = normalize(mouseOffset) * mouseDist * 0.05;

  // FBM 叠加时间动画扭曲
  float noise1 = fbm(uv * 3.0 + uTime * 0.1);
  float noise2 = fbm(uv * 3.0 + uTime * 0.1 + 5.2);
  uv += vec2(noise1, noise2) * 0.02 + distortion;

  // 两张背景图根据噪声混合
  float blend = fbm(uv * 2.0 + uTime * 0.05) * 0.5 + 0.5;
  vec4 color1 = texture2D(uTexture1, uv);
  vec4 color2 = texture2D(uTexture2, uv);
  gl_FragColor = mix(color1, color2, blend * 0.3);
}
```

### D-3：Hero 统计数字动画（计数器 + 环形进度）

```javascript
// stats-counter.js
// 数字从 0 跑到目标值，配合 SVG 环形进度条

const STATS = [
  { label: "Research Papers Read", value: 847, unit: "+" },
  { label: "Lines of Code", value: 124_000, unit: "+", format: "k" },
  { label: "Projects Shipped", value: 23, unit: "" },
  { label: "GPA", value: 3.94, unit: "/4.0", decimals: 2 },
];

ScrollTrigger.create({
  trigger: ".stats-section",
  start: "top 80%",
  once: true,
  onEnter: () => {
    STATS.forEach(({ label, value, decimals }) => {
      gsap.to(
        { val: 0 },
        {
          val: value,
          duration: 2.0,
          ease: "power2.out",
          onUpdate: function () {
            const el = document.querySelector(`[data-stat="${label}"]`);
            el.textContent = decimals
              ? this.targets()[0].val.toFixed(decimals)
              : Math.floor(this.targets()[0].val).toLocaleString();
          },
        },
      );
    });
  },
});
```

---

## Phase E — Projects 水平滚动画廊

> **V2 的项目展示区是一条可以"驾驶"的信息轨道**

### E-1：水平滚动轨道 + 速度感视差

```javascript
// horizontal-scroll.js

function initProjectsRail() {
  const rail = document.querySelector(".projects-rail");
  const cards = rail.querySelectorAll(".project-card");
  const totalWidth = rail.scrollWidth - window.innerWidth;

  // 主滚动驱动水平位移
  gsap.to(rail, {
    x: -totalWidth,
    ease: "none",
    scrollTrigger: {
      trigger: "#projects",
      start: "top top",
      end: `+=${totalWidth * 1.3}`,
      scrub: 0.8,
      pin: true,
      anticipatePin: 1,
    },
  });

  // 卡片内图片视差（方向相反，营造深度）
  cards.forEach((card) => {
    const img = card.querySelector(".card-visual");
    gsap.to(img, {
      x: 60,
      ease: "none",
      scrollTrigger: {
        trigger: "#projects",
        start: "top top",
        end: `+=${totalWidth * 1.3}`,
        scrub: true,
        containerAnimation: gsap.getById("horizontal-scroll"),
      },
    });
  });
}
```

### E-2：项目卡片 — WebGL 折射悬停效果

```javascript
// card-refraction.js
// 悬停时卡片背景出现水晶折射扭曲，比 V1 的 3D 倾斜更高级

class RefractionCard {
  constructor(el) {
    this.el = el;
    this.canvas = el.querySelector(".refraction-canvas");
    this.gl = this.canvas.getContext("webgl");
    this.mouse = { x: 0.5, y: 0.5 };
    this.target = { x: 0.5, y: 0.5 };
    this.initShader();
  }

  // 折射着色器：通过法线图模拟玻璃弯曲折射背景
  fragmentShader = `
    uniform sampler2D uBg;      // 网站背景快照
    uniform sampler2D uNormal;  // 玻璃法线图
    uniform vec2      uMouse;
    uniform float     uTime;
    varying vec2 vUv;

    void main() {
      vec3 normal = texture2D(uNormal, vUv).rgb * 2.0 - 1.0;

      // 鼠标影响折射强度
      float influence = 1.0 - length(uv - uMouse) * 1.5;
      influence = clamp(influence, 0.0, 1.0);

      vec2 refractedUV = vUv + normal.xy * 0.03 * influence;
      gl_FragColor = texture2D(uBg, refractedUV);
    }
  `;
}
```

### E-3：项目卡片数据结构与渲染

```javascript
// projects-data.js

const PROJECTS = [
  {
    id: "proj-001",
    title: "Neuraverse",
    tagline: "A digital cosmos for one",
    description: "将个人主页本身作为作品，探索 WebGL + 神经科学美学的边界",
    tech: ["Three.js", "GSAP", "GLSL", "PDF.js"],
    year: 2025,
    status: "live", // live | wip | archive
    accent: "#00e5ff",
    visual: "assets/img/proj-neuraverse.webp",
    links: {
      live: "https://neuraverse.github.io",
      github: "https://github.com/...",
      case: "#", // Case study（预留）
    },
    metrics: {
      // 可量化的项目成果
      label: "首屏加载",
      value: "< 1.2s",
    },
  },
  // ... 更多项目
];
```

---

## Phase F — 关于页 · 3D 时间轴

> **叙事目标**：不是简历，是一段穿越时间的旅程

### F-1：螺旋形时间轴（Helix Timeline）

```javascript
// helix-timeline.js
// 事件点沿螺旋线排布，滚动时摄像机沿螺旋飞行

const TIMELINE_EVENTS = [
  { year: 2020, title: "Started ECE", type: "education", color: "#00e5ff" },
  { year: 2021, title: "First ML Project", type: "project", color: "#b388ff" },
  { year: 2022, title: "Research Intern", type: "work", color: "#ff6b35" },
  { year: 2023, title: "Open Source", type: "project", color: "#4fc3f7" },
  { year: 2024, title: "Graduate", type: "milestone", color: "#f48fb1" },
];

// 螺旋坐标生成
function helixPosition(index, total) {
  const t = (index / total) * Math.PI * 4; // 两圈螺旋
  const radius = 3;
  return new THREE.Vector3(
    Math.cos(t) * radius,
    index * 0.8 - total * 0.4,
    Math.sin(t) * radius,
  );
}

// 摄像机路径：CatmullRomCurve3 沿螺旋轨道
const cameraPath = new THREE.CatmullRomCurve3(
  TIMELINE_EVENTS.map((_, i) => {
    const pos = helixPosition(i, TIMELINE_EVENTS.length);
    return pos.clone().multiplyScalar(1.8); // 摄像机在外圈
  }),
);
```

### F-3：个人陈述 — 文字扫描线效果

```css
/* 文段逐行"扫描"进入视口，配合高亮词 */
.about-paragraph .highlight {
  position: relative;
  color: var(--glow-cyan);
  display: inline-block;
}

.about-paragraph .highlight::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--glow-cyan);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease-smooth);
}

.about-paragraph.in-view .highlight::after {
  transform: scaleX(1);
}
```

---

## Phase G — 联系区 · 量子纠缠表单

> **设计意图**：联系表单不是表单，是一次"量子态坍缩"仪式

### G-1：终端风格 CLI 表单

```javascript
// contact-terminal.js
// 伪终端交互：用户"输入命令"来发送联系信息

const TERMINAL_FLOW = [
  { prompt: "> identify --name", field: "name", placeholder: "Your name..." },
  { prompt: "> set --channel", field: "email", placeholder: "your@email.com" },
  {
    prompt: "> compose --body",
    field: "message",
    placeholder: "Message body...",
  },
  { prompt: "> transmit", action: "submit" },
];

class ContactTerminal {
  constructor() {
    this.history = [];
    this.step = 0;
    this.data = {};
  }

  // 每一步完成后，输出"系统响应"再推进下一步
  async nextStep(input) {
    this.history.push({ role: "user", text: input });
    await this.typeResponse(
      `[OK] ${TERMINAL_FLOW[this.step].field} registered`,
    );
    this.step++;
    if (this.step < TERMINAL_FLOW.length - 1) {
      await this.typeResponse(TERMINAL_FLOW[this.step].prompt);
    }
  }

  // 打字机效果逐字符输出
  typeResponse(text, speed = 18) {
    return new Promise((resolve) => {
      let i = 0;
      const el = this.appendLine("system");
      const timer = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }
}
```

### G-2：提交动效 — 信号发射可视化

```javascript
// transmit-animation.js
// 提交成功后：粒子从表单中心向四方宇宙爆发，背景脉冲

async function onFormSubmit() {
  // 1. 按钮转换为"发射"状态
  gsap.to(submitBtn, { scale: 0.9, duration: 0.1 });
  submitBtn.innerHTML = `<span class="loading-ring"></span> Transmitting...`;

  // 2. 等待 API 响应（Formspree / Web3Forms）
  await sendToAPI(formData);

  // 3. 成功：粒子爆炸 + 背景 Bloom 脉冲
  createTransmitBurst(submitBtn.getBoundingClientRect());
  bloomPass.strength = 3.5;
  gsap.to(bloomPass, { strength: 1.2, duration: 2, ease: "power2.out" });

  // 4. 终端输出成功信息
  terminal.typeResponse(
    "[QUANTUM_LINK_ESTABLISHED] Message entangled across spacetime. ✦",
  );
}
```

---

## Phase H — 全站性能工程与可访问性

### H-1：资源加载策略

```html
<!-- 关键资源预加载 -->
<link
  rel="preload"
  href="assets/fonts/syne-variable.woff2"
  as="font"
  crossorigin
/>
<link rel="preload" href="assets/img/hero-bg.webp" as="image" />
<link rel="modulepreload" href="assets/js/three-scene.js" />

<!-- Three.js 延迟加载（Hero 出现后才需要）-->
<script>
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      import("./assets/js/three-scene.js").then((m) => m.init());
      observer.disconnect();
    }
  });
  observer.observe(document.querySelector("#hero"));
</script>
```

### H-2：性能分级降级策略

```javascript
// performance-grade.js
// 根据设备能力自动选择渲染质量

async function detectPerformanceTier() {
  // GPU 基准测试：渲染 1000 个粒子，统计帧率
  const fps = await benchmarkGPU();

  if (fps >= 55) return "HIGH"; // 桌面高端
  if (fps >= 30) return "MEDIUM"; // 桌面/高端移动
  return "LOW"; // 低端移动端
}

const TIERS = {
  HIGH: {
    galaxyParticles: 400_000,
    bloomEnabled: true,
    neuralMesh: true,
    postProcessing: true,
    cursorTrail: true,
  },
  MEDIUM: {
    galaxyParticles: 80_000,
    bloomEnabled: true,
    neuralMesh: false,
    postProcessing: false,
    cursorTrail: true,
  },
  LOW: {
    galaxyParticles: 0, // 降级为 CSS 背景图
    bloomEnabled: false,
    neuralMesh: false,
    postProcessing: false,
    cursorTrail: false,
  },
};

// 应用配置
const tier = await detectPerformanceTier();
applyTierConfig(TIERS[tier]);
```

### H-3：无障碍合规清单

```javascript
// a11y.js

// 1. 焦点管理 — 自定义光标不替代系统焦点环
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.add("keyboard-nav");
});
document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-nav");
});

// 2. 所有动画遵守 prefers-reduced-motion
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced) {
  gsap.globalTimeline.timeScale(0); // 暂停所有 GSAP 动画
  lenis.destroy(); // 禁用惯性滚动
  // Three.js 场景静止，不旋转
}

// 3. ARIA 语义
document.querySelectorAll(".project-card").forEach((card, i) => {
  card.setAttribute("role", "article");
  card.setAttribute("aria-label", `Project ${i + 1}: ${card.dataset.title}`);
});

// 4. 颜色对比度 — 所有文字背景组合需通过 WCAG AA
// 工具：https://webaim.org/resources/contrastchecker/
// --text-primary #eef0f8 on --cosmos-bg #060810 → 对比度 17.3:1 ✓
```

### H-4：Lighthouse 目标与优化手段

| 指标           | V1 目标 | V2 目标 | 主要优化手段                 |
| -------------- | ------- | ------- | ---------------------------- |
| Performance    | ≥ 90    | ≥ 92    | 代码拆分 / WebP / 字体子集   |
| Accessibility  | ≥ 95    | ≥ 98    | ARIA / 对比度 / 焦点管理     |
| Best Practices | ≥ 95    | 100     | HTTPS / CSP headers          |
| SEO            | ≥ 90    | ≥ 95    | 结构化数据 / og:image        |
| FCP            | ≤ 1.5s  | ≤ 0.9s  | 内联关键 CSS / 预渲染        |
| LCP            | ≤ 2.5s  | ≤ 1.5s  | Hero 图片优先加载            |
| CLS            | 0       | 0       | 图片尺寸预留 / 字体 fallback |

---

## Phase I — SEO · 结构化数据 · 社交分享

```html
<!-- index.html <head> 完整 meta -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Neuraverse — [Your Name] · Physics × Code × Design</title>
<meta
  name="description"
  content="A digital cosmos exploring the intersection of neural science, physics, and engineering. Built with WebGL, GSAP, and obsessive attention to detail."
/>
<meta
  name="keywords"
  content="physics, machine learning, WebGL, Three.js, personal website, portfolio"
/>

<!-- Open Graph（社交分享大图）-->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://neuraverse.github.io" />
<meta property="og:title" content="Neuraverse — Realm of Negentropy" />
<meta
  property="og:description"
  content="A digital cosmos at the intersection of neural science and engineering."
/>
<meta
  property="og:image"
  content="https://neuraverse.github.io/assets/og-image.png"
/>
<!-- og:image 规格：1200×630px，内容：网站 Hero 截图 + Logo -->

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Neuraverse" />
<meta name="twitter:description" content="Physics × Code × Design" />
<meta
  name="twitter:image"
  content="https://neuraverse.github.io/assets/og-image.png"
/>

<!-- 结构化数据（Person Schema）-->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "[Your Name]",
    "url": "https://neuraverse.github.io",
    "sameAs": [
      "https://github.com/...",
      "https://linkedin.com/in/...",
      "https://twitter.com/..."
    ],
    "knowsAbout": ["Physics", "Machine Learning", "WebGL", "Signal Processing"]
  }
</script>
```

---

## Phase J — CI/CD · 监控 · 分析

### J-1：GitHub Actions 增强部署流程

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy Neuraverse

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: "./lighthouserc.json"
          uploadArtifacts: true

      - name: Check bundle size
        run: |
          TOTAL=$(find assets/js -name "*.js" | xargs wc -c | tail -1 | awk '{print $1}')
          echo "Total JS: ${TOTAL} bytes"
          [ $TOTAL -lt 500000 ] || (echo "JS bundle > 500KB! Abort." && exit 1)

  deploy:
    needs: quality-check
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: "."
      - uses: actions/deploy-pages@v4
        id: deployment

      # 部署成功后 Ping Uptime 监控
      - name: Notify uptime monitor
        run: curl -s "https://uptime.betterstack.com/api/v1/heartbeat/${{ secrets.UPTIMEROBOT_KEY }}"
```

### J-2：访客分析（隐私优先）

```javascript
// analytics.js — 使用 Umami（自托管，无 Cookie，GDPR 合规）

// 自动追踪 PV / UV / 停留时长
// 手动追踪关键交互
function trackEvent(name, data = {}) {
  if (typeof umami !== "undefined") {
    umami.track(name, data);
  }
}

// 在关键位置调用：
trackEvent("pdf_opened", { category: "AI", file: "ml-notes.pdf" });
trackEvent("project_card_click", { project: "Neuraverse" });
trackEvent("contact_submitted", { method: "terminal" });
trackEvent("section_reached", { section: "projects" });
```

---

## 最终目录结构（V2 完整版）

```
neuraverse.github.io/
│
├── index.html              # 主页（Hero / Projects / About / Contact）
├── notes.html              # 笔记中心（PDF 浏览系统）
│
├── assets/
│   ├── css/
│   │   ├── reset.css       # 现代 CSS reset
│   │   ├── variables.css   # 色彩/字体 CSS 变量
│   │   ├── typography.css  # 字体排版系统
│   │   ├── layout.css      # 页面骨架与网格
│   │   ├── components.css  # 卡片/按钮/标签等组件
│   │   ├── animations.css  # 纯 CSS 动画定义
│   │   └── utilities.css   # 原子类工具
│   │
│   ├── js/
│   │   ├── main.js         # 入口：初始化所有模块
│   │   ├── three-scene.js  # Three.js 场景（银河 + 后处理）
│   │   ├── neural-mesh.js  # 动态神经网络拓扑
│   │   ├── camera.js       # 摄像机导演系统
│   │   ├── scroll.js       # Lenis + ScrollTrigger 集成
│   │   ├── cursor.js       # 磁力光标 + 形态变换
│   │   ├── interactions.js # 涟漪 / 排斥场 / 磁力
│   │   ├── text-split.js   # 文字拆分动画
│   │   ├── morphing-text.js# 词语变形动画
│   │   ├── hero.js         # Hero Section 专属逻辑
│   │   ├── projects.js     # 水平滚动轨道
│   │   ├── about.js        # 螺旋时间轴 + 雷达图
│   │   ├── contact.js      # 终端表单
│   │   ├── pdf-viewer.js   # PDF.js 渲染器（notes.html）
│   │   ├── performance.js  # 性能分级 + 降级
│   │   ├── analytics.js    # Umami 事件追踪
│   │   └── a11y.js         # 无障碍辅助
│   │
│   ├── shaders/
│   │   ├── galaxy.vert     # 银河粒子顶点着色器
│   │   ├── galaxy.frag     # 银河粒子片元着色器
│   │   ├── hero-distort.frag # Hero 背景扭曲场
│   │   └── chromatic.frag  # 色像差后处理
│   │
│   ├── img/
│   │   ├── hero-bg-1.webp  # 神经宇宙背景
│   │   ├── hero-bg-2.webp  # 突触特写背景
│   │   ├── og-image.png    # 社交分享封面 1200×630
│   │   └── projects/       # 项目截图（WebP）
│   │
│   ├── fonts/
│   │   └── syne-variable.woff2  # 本地字体备用
│   │
│   └── pdf/
│       ├── manifest.json   # PDF 目录配置文件
│       ├── ai/             # AI 课程笔记
│       ├── cs/             # CS 核心课程
│       ├── physics/        # 物理学
│       ├── math/           # 数学
│       └── ece/            # 电子工程
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── lighthouserc.json       # Lighthouse CI 配置
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## 开发优先级矩阵

```
                    高价值
                      │
  B（流体滚动）  ─────┼───── A（3D 宇宙背景）
                      │
  G（联系区）    ─────┼───── E（项目画廊）
 ─────────────────────┼──────────────────── 难度
  低难度                │                 高难度
                      │
  I（SEO）       ─────┼───── F（时间轴 3D）
                      │
  J（CI/CD）     ─────┼───── C（光标物理）
                      │
                    低价值

推荐执行顺序：
① A（视觉基座）→ ② B（滚动体验）→ ③ D（Hero 完善）
→ ④ E（项目展示）→ ⑤ C（光标升级）→ ⑥ F（关于页）
→ ⑦ G（联系区）→ ⑧ H（性能优化）→ ⑨ I/J（运维）
```

---

## Claude Code 快速提示词合集（V2）

**Three.js 银河粒子系统**：

```
用 Three.js 实现 40万粒子的旋涡银河系：
- 自定义顶点着色器驱动粒子大小随摄像机距离衰减
- 6条旋臂，粒子颜色从内圈橙 #ff6b35 渐变到外圈深蓝 #1a237e
- 旋臂随时间缓慢旋转（uniform uTime）
- UnrealBloom 后处理，strength=1.2 radius=0.4 threshold=0.1
- 移动端自动降级到 8万粒子
```

**GSAP ScrollTrigger 叙事滚动**：

```
用 Lenis + GSAP ScrollTrigger 实现：
1. 全站惯性滚动（Lenis duration=1.4）
2. Hero section pin + 文字 stagger 入场（逐字母 rotateX 90→0）
3. Projects section：水平滚动轨道，卡片内图片反向视差
4. 所有 trigger 基于 Lenis scroll 同步，不用原生 scroll 事件
```

**磁力光标系统**：

```
实现三层光标：
1. 内圈 6px 精准跟随，mix-blend-mode: difference
2. 外圈 30px lerp 延迟（系数0.08），悬停可点击元素时扩大至 50px + 变色 #b388ff
3. 8个拖尾残影 div，透明度和尺寸递减
4. data-magnetic 元素进入磁力范围时 GSAP 吸附（strength 参数化）
5. data-cursor 属性切换光标形态（link/pdf/drag/code 四种）
```

**GLSL Hero 背景扭曲**：

```
为 Three.js PlaneGeometry 写扭曲着色器：
- 输入两张纹理 uTexture1（神经宇宙）和 uTexture2（突触特写）
- fbm 分形布朗运动噪声驱动 UV 扭曲（6倍频叠加）
- uMouse uniform 控制鼠标附近局部扭曲增强
- uTime uniform 驱动慢速流动动画
- 两张纹理根据噪声值混合，blend 系数 0.3
```

**终端联系表单**：

```
实现伪终端交互联系表单：
- 三步流程：输入姓名 → 输入邮件 → 输入消息 → 发射
- 每步完成后输出[OK]系统响应，打字机效果（18ms/字符）
- 等宽字体，深色毛玻璃终端框，荧光青色光标闪烁
- 提交成功：粒子爆炸 + bloomPass.strength 脉冲到3.5再衰减
- 错误处理：输出红色 [ERR] 信息
```

**性能分级系统**：

```
实现三档性能自动降级：
- GPU 基准测试：用 Three.js 渲染1000个粒子，测量帧率
- HIGH(>=55fps)：全量 Three.js + 后处理 + 光标拖尾
- MEDIUM(>=30fps)：减少粒子，关闭后处理
- LOW(<30fps)：完全禁用 Three.js，降级为 CSS 背景图 + Canvas 2D
- 结果存 localStorage，二次访问跳过基准测试
```

---

## 常见坑 · V2 进阶版速查表

| 坑                             | 现象               | 解决方案                                                |
| ------------------------------ | ------------------ | ------------------------------------------------------- |
| Three.js + Lenis 冲突          | 滚动触发不稳定     | `ScrollTrigger.scrollerProxy` 绑定 Lenis                |
| WebGL 上下文丢失               | 切换标签后场景消失 | 监听 `webglcontextlost` 事件并重初始化                  |
| GSAP ScrollTrigger 在 iOS 失效 | 滚动动画卡顿或无效 | 改用 `markers: true` 调试，移动端降低 `scrub` 值        |
| GLSL 着色器 float 精度         | 低端设备粒子闪烁   | 着色器顶部加 `precision highp float;`                   |
| Three.js r150+ 模块路径变化    | `import` 路径错误  | CDN 直接用 `three.min.js`，addons 单独引 CDN            |
| Bloom 过度曝光文字             | 所有内容发白       | 用 `layers` 系统区分发光对象和 DOM 内容                 |
| 光标在触控设备显示             | 移动端出现光标     | `@media (pointer: fine)` 检测精确指针设备               |
| PDF.js Worker 跨域             | 渲染失败           | `workerSrc` 和主脚本必须同域或同 CDN 版本               |
| 水平滚动移动端失效             | 手势方向冲突       | 添加 `touch-action: pan-y` 或改为垂直布局               |
| GSAP 免费版缺少插件            | `SplitText` 报错   | SplitText 需 GSAP Club，替代方案：手动 `innerHTML` 拆分 |

---

```
文档版本：v2.0 · Singularity Edition
主题：Neuraverse — Realm of Negentropy
构建于 Phase 1 已完成基础之上
```
