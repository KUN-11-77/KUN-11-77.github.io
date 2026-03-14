/**
 * KUN's Tech Realm — Dragon Ball Sunset Starfield
 * 三层星空: 远景小星 + 中景星 + 近景大星 + 流星偶发
 */

// 检查是否启用效果
if (window.enableEffects === false) {
  console.log('Starfield effects disabled');
  // 退出脚本执行
  throw new Error('Starfield effects disabled by configuration');
}

(function () {
  "use strict";

  // 创建canvas元素
  const canvas = document.createElement("canvas");
  canvas.id = "starfield-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "-4"; // 在最底层，背景图片之上，其他效果之下
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = "0.9";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");

  // 调整canvas尺寸
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // 星星类
  class Star {
    constructor(layer) {
      this.layer = layer; // 1: 远景小星, 2: 中景星, 3: 近景大星
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.reset();
    }

    reset() {
      const layer = this.layer;
      if (layer === 1) {
        // 远景小星: 缓慢移动，小尺寸，低亮度
        this.size = Math.random() * 0.8 + 0.3;
        this.speedX = Math.random() * 0.1 - 0.05;
        this.speedY = Math.random() * 0.1 - 0.05;
        this.brightness = Math.random() * 0.4 + 0.2;
        this.color = `rgba(255, 255, 255, ${this.brightness})`;
      } else if (layer === 2) {
        // 中景星: 中等速度，中等尺寸，中等亮度
        this.size = Math.random() * 1.2 + 0.5;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.brightness = Math.random() * 0.6 + 0.3;
        this.color = `rgba(255, 215, 102, ${this.brightness})`; // 琥珀色
      } else {
        // 近景大星: 较快速度，大尺寸，高亮度
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.brightness = Math.random() * 0.8 + 0.4;
        this.color = `rgba(255, 107, 53, ${this.brightness})`; // 晚霞橙
      }
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.x += this.speedX;
      this.y += this.speedY;

      // 边界处理
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;

      // 闪烁效果
      const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3 + 0.7;
      this.currentBrightness = this.brightness * twinkle;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(/[\d\.]+\)$/, `${this.currentBrightness || this.brightness})`);
      ctx.fill();

      // 为近景大星添加光晕
      if (this.layer === 3) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, `rgba(255, 107, 53, ${0.2 * (this.currentBrightness || this.brightness)})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
  }

  // 流星类
  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height * 0.3; // 从顶部附近开始
      this.length = Math.random() * 50 + 30;
      this.speedX = Math.random() * 3 + 2;
      this.speedY = Math.random() * 1 + 0.5;
      this.size = Math.random() * 1.5 + 0.5;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.01;
      this.color = `rgba(255, 215, 102, 0.9)`; // 金色流星
      this.active = true;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;

      if (this.life <= 0 || this.x > canvas.width || this.y > canvas.height) {
        this.active = false;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.length * 0.8, this.y - this.length * 0.2);
      ctx.lineWidth = this.size;
      ctx.strokeStyle = this.color;
      ctx.stroke();

      // 流星头部光点
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.life})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // 初始化星星
  const stars = [];
  const starCounts = [150, 80, 30]; // 各层星星数量
  for (let layer = 1; layer <= 3; layer++) {
    for (let i = 0; i < starCounts[layer - 1]; i++) {
      stars.push(new Star(layer));
    }
  }

  // 流星数组
  const shootingStars = [];
  const maxShootingStars = 3;
  let shootingStarTimer = 0;

  // 动画循环
  let lastTime = 0;
  function animate(time) {
    const deltaTime = time - lastTime;
    lastTime = time;

    // 清空画布，使用透明背景以显示底层背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制星星
    stars.forEach(star => {
      star.update(time);
      star.draw();
    });

    // 流星生成
    shootingStarTimer += deltaTime;
    if (shootingStarTimer > 2000 && shootingStars.length < maxShootingStars && Math.random() < 0.01) {
      shootingStars.push(new ShootingStar());
      shootingStarTimer = 0;
    }

    // 更新和绘制流星
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const star = shootingStars[i];
      star.update();
      if (star.active) {
        star.draw();
      } else {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  // 性能优化：只在非移动设备且支持requestAnimationFrame时运行
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isMobile && !prefersReducedMotion && window.requestAnimationFrame) {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(animate);
      });
    } else {
      requestAnimationFrame(animate);
    }
  } else {
    // 降级处理：移除canvas
    canvas.remove();
  }

  // 导出全局变量（调试用）
  window.starfield = { stars, shootingStars, canvas, resize };
})();