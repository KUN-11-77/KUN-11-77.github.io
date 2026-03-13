// source/js/starfield.js （轻量 Canvas 方案，无需 Three.js）

// 检查是否启用效果
if (window.enableEffects === false) {
  console.log('Starfield effects disabled');
  // 退出脚本执行
  throw new Error('Starfield effects disabled by configuration');
}

const STAR_COUNT = 180;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 1.8 + 0.3,
  speed: Math.random() * 0.00015 + 0.00005,
  alpha: Math.random() * 0.7 + 0.3,
  pulse: Math.random() * Math.PI * 2,
}));

let canvas, ctx;
let animationId = null;

function initStarfield() {
  // 创建 Canvas 元素
  canvas = document.createElement("canvas");
  canvas.id = "starfield-canvas";
  ctx = canvas.getContext("2d");

  // 样式
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "-1",
    pointerEvents: "none",
    opacity: "0.6",
  });

  // 插入到 Hero 区域或 body
  const hero = document.getElementById("hero");
  if (hero) {
    hero.prepend(canvas);
  } else {
    document.body.prepend(canvas);
  }

  resizeCanvas();
  drawStars();

  // 开始动画循环
  if (animationId) cancelAnimationFrame(animationId);
  animateStars();

  // 响应式
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  drawStars();
}

function drawStars() {
  if (!canvas || !ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha})`;
    ctx.fill();
  });
}

function animateStars() {
  if (!canvas || !ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  stars.forEach(s => {
    s.pulse += s.speed * 60;
    const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
    ctx.fill();
  });
  animationId = requestAnimationFrame(animateStars);
}

// 延迟初始化，避免阻塞页面加载
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStarfield);
} else {
  initStarfield();
}

// 导出以供其他脚本使用（如果需要）
window.starfield = { initStarfield, resizeCanvas };