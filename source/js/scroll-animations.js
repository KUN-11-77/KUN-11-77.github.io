// source/js/scroll-animations.js
// 依赖：GSAP + ScrollTrigger (通过 CDN 加载)

// 检查是否启用效果
if (window.enableEffects === false) {
  console.log('Scroll animations disabled');
  // 执行基本的淡入动画作为回退
  document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.post-block, article.post');
    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 100);
    });
  });
  // 退出脚本执行
  throw new Error('Scroll animations disabled by configuration');
}

function initScrollAnimations() {
  // 检查 GSAP 和 ScrollTrigger 是否已加载
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger not loaded. Retrying in 500ms...");
    setTimeout(initScrollAnimations, 500);
    return;
  }

  // 注册插件
  gsap.registerPlugin(ScrollTrigger);

  // 文章卡片渐入
  const postBlocks = gsap.utils.toArray(".post-block, article.post, .card");
  postBlocks.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: i * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        }
      }
    );
  });

  // Hero 标题字符逐个显现（如果有 .hero-title .char 元素）
  const heroTitleChars = document.querySelectorAll(".hero-title .char");
  if (heroTitleChars.length > 0) {
    gsap.from(heroTitleChars, {
      opacity: 0,
      y: 40,
      rotateX: 45,
      stagger: 0.04,
      duration: 0.8,
      ease: "back.out(1.5)",
    });
  }

  // 导航菜单悬停效果
  const navItems = document.querySelectorAll(".menu-item, .nav-item");
  navItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      gsap.to(item, { scale: 1.05, duration: 0.2 });
    });
    item.addEventListener("mouseleave", () => {
      gsap.to(item, { scale: 1, duration: 0.2 });
    });
  });

  // 页面加载时的全局淡入
  gsap.from("main, .header-inner, .footer", {
    opacity: 0,
    y: 20,
    duration: 1,
    ease: "power2.out",
    delay: 0.2
  });

  // 滚动进度指示器（可选）
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress-bar";
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: var(--grad-accent);
    z-index: 10010;
    pointer-events: none;
    border-radius: 0 2px 2px 0;
  `;
  document.body.appendChild(progressBar);

  gsap.to(progressBar, {
    width: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    }
  });

  // 视差效果（可选）
  const parallaxSections = document.querySelectorAll(".parallax-section");
  parallaxSections.forEach(section => {
    gsap.to(section, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
  });

  console.log("Scroll animations initialized with GSAP");
}

// 延迟初始化，等待 GSAP 加载
function waitForGSAP() {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    initScrollAnimations();
  } else {
    // 如果 5 秒后仍未加载，尝试再次检查
    setTimeout(waitForGSAP, 100);
  }
}

// 启动
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForGSAP);
} else {
  waitForGSAP();
}