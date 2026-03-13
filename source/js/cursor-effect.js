// source/js/cursor-effect.js
// 技术方案：Canvas 2D + CSS custom cursor + RAF 60fps

// 检查是否启用效果
if (window.enableEffects === false) {
  console.log('Cursor effects disabled');
  // 确保默认光标显示
  document.body.style.cursor = 'auto';
  // 退出脚本执行
  throw new Error('Cursor effects disabled by configuration');
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// Canvas 全屏覆盖（pointer-events:none 不干扰点击）
Object.assign(canvas.style, {
  position: "fixed",
  inset: "0",
  width: "100vw",
  height: "100vh",
  zIndex: "9999",
  pointerEvents: "none",
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const COLORS = ["#6C63FF", "#00D4FF", "#F0C040", "#FF6B9D", "#4ECDC4"];
const particles = [];
let mx = 0, my = 0;

// 每次 mousemove 生成 3 个粒子
document.addEventListener("mousemove", e => {
  mx = e.clientX;
  my = e.clientY;
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: mx,
      y: my,
      r: Math.random() * 8 + 4,               // 初始半径
      life: 1.0,                               // 生命值 1→0
      decay: Math.random() * 0.025 + 0.015,    // 衰减速率
      vx: (Math.random() - 0.5) * 2.5,         // x 速度
      vy: (Math.random() - 0.5) * 2.5 - 1,     // y 速度（微向上）
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
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
  const grad = ctx.createRadialGradient(haloX, haloY, 0, haloX, haloY, 60);
  grad.addColorStop(0, "rgba(108,99,255,0.18)");
  grad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(haloX, haloY, 60, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 粒子系统
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;  // 重力
    p.life -= p.decay;
    p.r *= 0.97;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(animate);
}
animate();

// 窗口大小调整
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// CSS 自定义光标
document.head.insertAdjacentHTML("beforeend", `<style>
body { cursor: none !important; }
#cursor-ring {
  position: fixed;
  width: 24px;
  height: 24px;
  border: 2px solid var(--clr-accent-cyan);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: width .2s, height .2s, border-color .2s;
  z-index: 10000;
  mix-blend-mode: screen;
}
#cursor-dot {
  position: fixed;
  width: 6px;
  height: 6px;
  background: var(--clr-accent);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10001;
}
</style>`);

// 创建光标元素
const cursorRing = document.createElement("div");
cursorRing.id = "cursor-ring";
const cursorDot = document.createElement("div");
cursorDot.id = "cursor-dot";
document.body.appendChild(cursorRing);
document.body.appendChild(cursorDot);

// 光标跟随
document.addEventListener("mousemove", e => {
  cursorRing.style.left = e.clientX + "px";
  cursorRing.style.top = e.clientY + "px";
  cursorDot.style.left = e.clientX + "px";
  cursorDot.style.top = e.clientY + "px";
});

// 点击效果
document.addEventListener("mousedown", () => {
  cursorRing.style.width = "18px";
  cursorRing.style.height = "18px";
});

document.addEventListener("mouseup", () => {
  cursorRing.style.width = "24px";
  cursorRing.style.height = "24px";
});