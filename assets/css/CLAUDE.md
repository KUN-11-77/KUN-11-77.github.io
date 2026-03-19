# CLAUDE.md — Neuraverse 开发规范
> 本文件是 Claude Code 在整个开发过程中必须严格遵守的行为准则。
> 每一条规则都是强制性的，不得跳过或简化。

---

## 0. 黄金法则

```
写代码之前，先问：这个改动如果出错，回滚要多久？
答案超过 5 分钟 → 必须先建分支、先提交当前状态。
```

**永远不要在没有 commit 记录的情况下做大改动。**

---

## 1. Git 工作流规范

### 1.1 分支命名规则

| 类型 | 格式 | 示例 |
|------|------|------|
| 功能开发 | `feat/功能名` | `feat/pdf-viewer` |
| 样式调整 | `style/描述` | `style/hero-animation` |
| Bug 修复 | `fix/描述` | `fix/canvas-blur-hidpi` |
| 性能优化 | `perf/描述` | `perf/particle-pool` |
| 实验性功能 | `exp/描述` | `exp/webgl-background` |

### 1.2 必须遵守的分支操作顺序

```bash
# ❶ 开始任何新功能前，确认当前在 main 且状态干净
git status                        # 必须显示 nothing to commit
git checkout main
git pull origin main

# ❷ 从 main 新建功能分支
git checkout -b feat/功能名

# ❸ 开发过程中频繁小提交（见 1.3）

# ❹ 功能完成且验证通过后，合并回 main
git checkout main
git merge feat/功能名 --no-ff     # 必须用 --no-ff 保留分支记录
git push origin main

# ❺ 合并后删除功能分支（保持仓库整洁）
git branch -d feat/功能名
git push origin --delete feat/功能名
```

### 1.3 Commit 规范

**格式**：`类型(范围): 简短描述`

| 类型 | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `style` | 样式调整（不影响功能）|
| `perf` | 性能优化 |
| `chore` | 配置/工具/依赖 |
| `wip` | 进行中（临时保存，禁止合并到 main）|

**示例**：
```bash
git commit -m "feat(pdf): 实现 PDF.js 全页渲染基础结构"
git commit -m "fix(canvas): 修复 HiDPI 屏幕模糊问题"
git commit -m "perf(particles): 引入对象池减少 GC 压力"
git commit -m "style(hero): 调整文字入场动画时序"
git commit -m "wip(cursor): lerp 光标效果调试中"
```

**禁止的 commit 信息**：
```bash
# ❌ 以下提交信息不允许出现
git commit -m "update"
git commit -m "fix"
git commit -m "改了一些东西"
git commit -m "test"
git commit -m "aaa"
```

### 1.4 紧急回滚操作

```bash
# 查看最近提交记录
git log --oneline -10

# 软回滚（保留文件改动，仅撤销 commit）
git reset --soft HEAD~1

# 硬回滚（彻底回到某个提交，文件一起还原）⚠️ 谨慎使用
git reset --hard <commit-hash>

# 用新 commit 撤销某次提交（推荐，不破坏历史）
git revert <commit-hash>

# 查看某个文件的历史版本
git show <commit-hash>:path/to/file.js
```

---

## 2. 阶段验证清单（Phase Gate）

> **规则**：每个 Phase 完成后，必须逐项检查以下清单，全部通过才能进入下一阶段。

### Phase 0 完成验证
- [ ] 目录结构与路线图文档一致
- [ ] CSS 变量全部定义，在浏览器 DevTools 中可见
- [ ] 字体正确加载（Network 面板确认字体文件 200 状态）
- [ ] `index.html` 能在本地正常打开，无控制台报错
- [ ] GitHub Actions workflow 文件语法正确（yml 无缩进错误）
- [ ] 推送至 main 后 GitHub Pages 部署成功（Actions 页面显示绿色）

### Phase 1 完成验证
- [ ] 粒子背景在 Chrome / Safari / Firefox 三浏览器均正常渲染
- [ ] 移动端（375px 宽度模拟）粒子数量自动降级
- [ ] 导航栏毛玻璃效果在深色背景上可见
- [ ] Hero 文字入场动画正常播放，无跳帧
- [ ] `prefers-reduced-motion` 媒体查询生效（系统开启"减少动画"后动画停止）
- [ ] 页面 FPS ≥ 50（Chrome DevTools Performance 面板录制 3 秒确认）

### Phase 2 完成验证
- [ ] 鼠标移动时双层光标正常显示，无闪烁
- [ ] 外圈光标有明显的 lerp 延迟跟随感
- [ ] 悬停 `<a>` 和 `<button>` 时光标变形/变色
- [ ] 点击任意位置有粒子爆炸效果
- [ ] 鼠标靠近背景粒子时粒子有轻微偏移（引力效果）
- [ ] 移动端不显示自定义光标（touch 设备无光标）
- [ ] 三种效果同时运行时 FPS 不低于 45

### Phase 3 完成验证（最严格）
- [ ] PDF 所有页面全部渲染，无遗漏
- [ ] 普通屏（1x）和高清屏（2x/3x）内容均清晰不模糊
- [ ] 页面最大宽度不超过 860px，居中显示
- [ ] 每页之间有 16px 间距
- [ ] 滚动流畅，无明显卡顿（页面高度 > 5000px 时仍流畅）
- [ ] 懒加载生效：首屏只渲染前 1-2 页（Network 面板无大量 canvas 操作）
- [ ] 浮动页码指示器随滚动更新
- [ ] 顶部进度条随滚动更新
- [ ] 骨架屏在页面渲染前显示，渲染后消失
- [ ] 移动端（375px）PDF 宽度自适应，无横向滚动条

### Phase 4 完成验证
- [ ] About 区块滚动入场动画正常
- [ ] 项目卡片 3D 悬停效果流畅，鼠标离开后平滑复位
- [ ] Lighthouse 性能分 ≥ 90（在 Chrome DevTools 中运行）
- [ ] Lighthouse 可访问性分 ≥ 85
- [ ] 所有图片有 `alt` 属性
- [ ] SEO meta 标签完整（title / description / og:image）
- [ ] GitHub Pages 最终部署成功，线上版本与本地一致

---

## 3. 功能实现验证规范

### 3.1 每个功能实现后必须做的三件事

```
① 浏览器刷新验证（硬刷新：Ctrl+Shift+R / Cmd+Shift+R）
② 打开 DevTools Console，确认零报错、零警告
③ 提交一个 commit（哪怕功能还不完整，也要 wip 提交保存进度）
```

### 3.2 跨浏览器测试矩阵

| 功能 | Chrome | Safari | Firefox | 移动端 Chrome |
|------|--------|--------|---------|--------------|
| Canvas 粒子背景 | ✓必测 | ✓必测 | ✓必测 | ✓必测 |
| 毛玻璃效果 | ✓必测 | ✓必测 | — | ✓必测 |
| 自定义光标 | ✓必测 | ✓必测 | ✓必测 | ✗跳过(touch) |
| PDF 渲染清晰度 | ✓必测 | ✓必测 | ✓必测 | ✓必测 |
| 3D 卡片悬停 | ✓必测 | ✓必测 | ✓必测 | ✗跳过(touch) |

> Safari 对 `backdrop-filter` 需要 `-webkit-` 前缀，必须同时写两行。

### 3.3 性能红线（触发必须优化，不得合并到 main）

| 指标 | 红线 |
|------|------|
| 页面首屏加载时间 | > 3s |
| Canvas 动画 FPS | < 30fps |
| PDF 渲染单页时间 | > 2s |
| Lighthouse 性能分 | < 85 |
| JS 主线程阻塞 | > 100ms（长任务）|

---

## 4. 文件修改规范

### 4.1 修改前必须做的事

```bash
# 修改任何文件前，先确认当前 git 状态
git status

# 如果有未提交的改动，先保存
git stash         # 临时保存
# 或
git commit -m "wip: 保存当前进度"
```

### 4.2 禁止直接修改的文件

以下文件不得在功能分支以外修改，必须走 PR 或单独 commit：

- `index.html`（主结构文件，改动影响全局）
- `.github/workflows/deploy.yml`（部署配置，改错会导致部署失败）
- `assets/css/main.css` 中的 `:root` CSS 变量区块

### 4.3 大改动前的备份操作

```bash
# 改动超过 50 行，或涉及核心逻辑前，先打 tag 存档
git tag v0.1-before-pdf-refactor
git push origin v0.1-before-pdf-refactor

# 查看所有 tag
git tag -l

# 回到某个 tag 的状态（不破坏当前分支）
git checkout v0.1-before-pdf-refactor
```

---

## 5. 调试规范

### 5.1 Console 使用规范

```javascript
// ✅ 开发时允许使用，但合并前必须清除
console.log('[PDF] 第', pageNum, '页渲染完成');
console.log('[Cursor] lerp 位置:', outerX, outerY);

// ✅ 错误必须捕获并有意义的输出
try {
  const pdf = await pdfjsLib.getDocument(url).promise;
} catch (err) {
  console.error('[PDF] 加载失败，URL:', url, '错误:', err.message);
}

// ❌ 禁止的调试代码（合并前必须删除）
console.log('here');
console.log(111);
console.log('test');
debugger;           // ← 这个绝对不能提交
```

### 5.2 合并前的代码清洁检查

```bash
# 在合并到 main 前，搜索并清除所有调试代码
grep -r "console.log" assets/js/
grep -r "debugger" assets/js/
grep -r "TODO\|FIXME\|HACK" assets/js/   # 确认所有待办已处理
```

---

## 6. CSS 规范

### 6.1 必须使用 CSS 变量，禁止硬编码颜色

```css
/* ❌ 禁止 */
color: #00e5ff;
background: rgba(10, 14, 26, 0.85);

/* ✅ 正确 */
color: var(--glow-cyan);
background: rgba(var(--cosmos-bg-rgb), 0.85);
```

### 6.2 动画必须考虑无障碍

```css
/* 每写一个动画，都必须附带这个降级 */
@keyframes yourAnimation { /* ... */ }

@media (prefers-reduced-motion: reduce) {
  .your-element {
    animation: none;
    transition: none;
  }
}
```

### 6.3 Safari 兼容性必查项

```css
/* 毛玻璃：必须同时写两行 */
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);

/* 3D 变换：必须同时写两行 */
transform-style: preserve-3d;
-webkit-transform-style: preserve-3d;
```

---

## 7. JavaScript 规范

### 7.1 Canvas 操作规范

```javascript
// ✅ 每帧开始前清空 canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

// ✅ 页面不可见时暂停动画（节省性能）
let rafId;
function animate() {
  rafId = requestAnimationFrame(animate);
  // ...
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else animate();
});

// ✅ resize 时重新设置 canvas 尺寸
window.addEventListener('resize', debounce(() => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}, 200));
```

### 7.2 异步操作规范

```javascript
// ✅ 所有异步操作必须有错误处理
async function loadPDF(url) {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    return pdf;
  } catch (err) {
    console.error('[PDF] 加载失败:', err);
    showErrorState();  // 必须有用户可见的错误提示
    return null;
  }
}

// ✅ 加载状态必须有反馈（骨架屏 / loading 指示）
showSkeleton();
const pdf = await loadPDF(url);
hideSkeleton();
```

### 7.3 事件监听规范

```javascript
// ✅ 高频事件必须节流/防抖
window.addEventListener('resize',   debounce(handleResize, 200));
window.addEventListener('scroll',   throttle(handleScroll, 16));   // ~60fps
window.addEventListener('mousemove', throttle(handleMouse, 16));

// ✅ 被动事件监听（提升滚动性能）
window.addEventListener('scroll', handler, { passive: true });
window.addEventListener('touchmove', handler, { passive: true });
```

---

## 8. 部署规范

### 8.1 推送到 main 的前置检查

在执行 `git push origin main` 前，逐项确认：

```
□ 本地浏览器测试通过（Chrome + Safari）
□ DevTools Console 无报错无警告
□ 所有 console.log / debugger 已清除
□ CSS 变量未硬编码颜色
□ 动画已添加 prefers-reduced-motion 降级
□ 对应 Phase 的验证清单已全部通过
□ Commit 信息符合规范（无 "update"/"fix" 等模糊描述）
```

### 8.2 部署后验证

```bash
# 推送后等待约 60 秒，然后：
# 1. 打开 GitHub Actions 页面确认部署成功（绿色勾）
# 2. 访问线上 URL 硬刷新（Ctrl+Shift+R）
# 3. 打开 DevTools 确认线上版本与本地一致
# 4. 用移动端浏览器访问一次（或 DevTools 移动端模拟）
```

### 8.3 部署失败处理流程

```
部署失败（Actions 红色叉）→
  1. 点击失败的 Action 查看错误日志
  2. 定位错误行
  3. 本地修复
  4. git commit -m "fix(deploy): 修复部署配置错误"
  5. git push origin main
  6. 等待重新部署
  7. 确认绿色后才算完成
```

---

## 9. 版本里程碑管理

每完成一个 Phase 并部署成功后，必须打版本 tag：

```bash
# Phase 完成后打 tag
git tag v0.1.0-phase0   # 脚手架完成
git tag v0.2.0-phase1   # 视觉骨架完成
git tag v0.3.0-phase2   # 鼠标交互完成
git tag v0.4.0-phase3   # PDF 展示完成
git tag v1.0.0-phase4   # 全部完成

# 推送所有 tag
git push origin --tags

# 查看版本历史
git log --oneline --decorate
```

---

## 10. 遇到问题时的处理原则

```
问题出现 → 先 git stash / commit 保存现场
         → 查 DevTools Console 报错信息
         → 缩小问题范围（注释掉代码二分查找）
         → 找到根因再修复
         → 切勿连续改多处再测试（无法定位问题来源）

超过 30 分钟没有进展 → 回滚到最近一个正常的 commit
                      → 换思路重新实现
```

**禁止的行为**：
- 问题没解决就继续往下开发
- 改了很多地方但不知道哪里改坏了
- 直接把有 bug 的代码 push 到 main "先上线再说"

---

*本文件优先级：最高。与路线图文档有冲突时，以本文件为准。*
