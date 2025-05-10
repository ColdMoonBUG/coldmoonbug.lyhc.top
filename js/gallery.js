// js/gallery.js

// —— 1. 分类与对应页码
const categories = {
  group1: { title: "初高中衔接公式", pages: [ { num: 1, label: "二次方程及因式分解" }, { num: 2, label: "指数、对数与数列" }, { num: 3, label: "数列求和及三角函数" }, { num: 4, label: "奇偶函数" } ] },
  group2: { title: "极限与微分基础", pages: [ { num: 5,  label: "等价及基础极限公式" }, { num: 6,  label: "导数基础" }, { num: 7,  label: "常用导数公式" }, { num: 8,  label: "零点定理 & 中值定理" }, { num: 9,  label: "不定积分基础" } ] },
  group3: { title: "不定积分与定积分", pages: [ { num: 10, label: "不定积分公式" }, { num: 11, label: "三角代换及定积分基础" }, { num: 12, label: "变限积分求导 & 牛顿-莱布尼兹" } ] },
  group4: { title: "微分方程与向量几何", pages: [ { num: 13, label: "微分方程基础" }, { num: 14, label: "向量积/数量积 & 平面方程" }, { num: 15, label: "空间直线方程" } ] },
  group5: { title: "多元微积分与无穷级数", pages: [ { num: 16, label: "多元微分基础" }, { num: 17, label: "多元函数极值 & 多元积分" }, { num: 18, label: "无穷级数 & 幂级数展开" } ] },
  group6: { title: "概率论与统计基础", pages: [ { num: 19, label: "线性代数 & 概率论公式" }, { num: 20, label: "随机变量数字特征" }, { num: 21, label: "常见分布 & 期望方差" }, { num: 22, label: "正项级数 & 交错级数" }, { num: 23, label: "幂级数 & 线代基础" } ] }
};

// —— 2. 读取 URL 参数
const params = new URLSearchParams(window.location.search);
const cat    = params.get("cat") || "group1"; // Default to group1 if no cat
let pageNum  = parseInt(params.get("page"), 10);

// —— 3. 获取本分类的页码数组和当前索引
const currentCategoryData = categories[cat] || categories.group1; // Fallback if cat is invalid
const numsInCurrentCategory = currentCategoryData.pages.map(p => p.num);

if (isNaN(pageNum) || !numsInCurrentCategory.includes(pageNum)) {
    pageNum = numsInCurrentCategory[0]; // Default to first page of the current category
}
let currentIndex = numsInCurrentCategory.indexOf(pageNum);
if (currentIndex === -1) currentIndex = 0; // Safety net if pageNum was valid but not found


// —— 4. 渲染二级菜单 (for gallery.html itself)
for (let i = 1; i <= 6; i++) {
  const menuUl = document.getElementById(`menu${i}`); // Target the <ul> for dropdown items
  const categoryKey  = `group${i}`;
  const mainNavLink = document.getElementById(`nav${i}`); // Target the main nav link <a>

  if (menuUl && categories[categoryKey]) {
    // Set the main dropdown link text from categories data
    if (mainNavLink) mainNavLink.textContent = categories[categoryKey].title;
    
    categories[categoryKey].pages.forEach(p => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.className = "dropdown-item";
      link.href      = `gallery.html?cat=${categoryKey}&page=${p.num}`;
      link.textContent = p.label;
      // Highlight active sub-item
      if (categoryKey === cat && p.num === pageNum) {
        link.classList.add('active');
      }
      listItem.appendChild(link);
      menuUl.appendChild(listItem);
    });
  }
  // Highlight active top-level nav link
  if (mainNavLink && categoryKey === cat) {
    mainNavLink.classList.add('active');
  }
}


// —— 5. 获取 DOM 元素
const wrap    = document.getElementById("canvas-wrap");
const thumbs  = document.getElementById("thumbs");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const loading = document.getElementById("loading"); // The loading overlay div
let currentPanzoomInstance = null;
let imageTransitionTimeout = null;

// —— 6. 预加载工具
function preloadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = (err) => rej({src, errorEvent: err});
    img.src     = src;
  });
}
async function preloadAllForCategory(categoryKey) {
  const urls = (categories[categoryKey]?.pages || []).map(p => `./formulaimg/${p.num}.png`);
  if (!urls.length) return; // No images to preload
  
  loading.classList.add('show');
  try {
    await Promise.all(urls.map(preloadImage));
  } catch (error) {
    console.warn(`Some images in category ${categoryKey} failed to preload. Source: ${error.src || 'Unknown'}`, error.errorEvent);
  }
  // Loading hidden by showByIndex
}

// —— 7. 自动裁剪白边
function autoCrop(img, cb) {
  const tmp = document.createElement("canvas");
  const ctx = tmp.getContext("2d");
  tmp.width  = img.width;
  tmp.height = img.height;

  if (img.width === 0 || img.height === 0) {
    console.warn("Image has zero dimensions, cannot crop:", img.src);
    cb(tmp);
    return;
  }

  ctx.drawImage(img, 0, 0);
  let imgData;
  try {
    imgData = ctx.getImageData(0, 0, tmp.width, tmp.height);
  } catch (e) {
    console.error("Could not getImageData (tainted canvas?):", e, img.src);
    // Create a new canvas with original image if getImageData fails
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = img.width;
    fallbackCanvas.height = img.height;
    fallbackCanvas.getContext('2d').drawImage(img, 0, 0);
    cb(fallbackCanvas);
    return;
  }
  const data = imgData.data;

  let top = tmp.height, left = tmp.width, right = -1, bottom = -1;
  for (let y = 0; y < tmp.height; y++) {
    for (let x = 0; x < tmp.width; x++) {
      const idx = (y * tmp.width + x) * 4;
      if (data[idx+3] > 20 && (data[idx] < 252 || data[idx+1] < 252 || data[idx+2] < 252)) { // Alpha > 20, and not perfectly white
        if (top > y) top = y;
        if (left > x) left = x;
        if (right < x) right = x;
        if (bottom < y) bottom = y;
      }
    }
  }

  const crop = document.createElement("canvas");
  if (right < left || bottom < top) {
    crop.width = Math.max(1, img.width);
    crop.height = Math.max(1, img.height);
    crop.getContext("2d").drawImage(img, 0, 0, crop.width, crop.height);
  } else {
    const w = right - left + 1;
    const h = bottom - top + 1;
    crop.width  = w;
    crop.height = h;
    crop.getContext("2d").drawImage(tmp, left, top, w, h, 0, 0, w, h);
  }
  cb(crop);
}

// —— 8. 渲染函数: showByIndex(idx)
function showByIndex(idx) {
  if (idx < 0 || idx >= numsInCurrentCategory.length || !wrap) return;
  
  currentIndex = idx;
  const pageData = currentCategoryData.pages[idx];
  if (!pageData) {
      console.error("Page data not found for index:", idx);
      loading.classList.remove('show');
      return;
  }
  const num = pageData.num;
  const imagePath = `./formulaimg/${num}.png`;

  loading.classList.add('show');
  clearTimeout(imageTransitionTimeout);

  if (currentPanzoomInstance) {
    currentPanzoomInstance.dispose();
    currentPanzoomInstance = null;
  }

  const oldCanvas = wrap.querySelector("canvas");
  if (oldCanvas) {
    oldCanvas.style.transition = "opacity 0.25s ease-out";
    oldCanvas.style.opacity = "0";
  }

  preloadImage(imagePath)
    .then(imgObject => {
      imageTransitionTimeout = setTimeout(() => {
        if (oldCanvas && oldCanvas.parentNode === wrap) {
          wrap.removeChild(oldCanvas);
        }

        autoCrop(imgObject, newCanvas => {
          newCanvas.style.opacity = "0";
          // Ensure #loading is after the canvas in DOM for z-index stacking if needed, though it's absolute positioned
          if (loading.nextSibling) {
            wrap.insertBefore(newCanvas, loading.nextSibling);
          } else {
            wrap.appendChild(newCanvas);
          }
          
          requestAnimationFrame(() => {
            newCanvas.style.transition = "opacity 0.35s ease-in";
            newCanvas.style.opacity = "1";
          });
          
          loading.classList.remove('show');

          const wrapWidth = wrap.clientWidth;
          const wrapHeight = wrap.clientHeight;
          const canvasWidth = newCanvas.width;
          const canvasHeight = newCanvas.height;

          let scale = 1;
          if (canvasWidth > 0 && canvasHeight > 0) {
              const scaleX = wrapWidth / canvasWidth;
              const scaleY = wrapHeight / canvasHeight;
              scale = Math.min(scaleX, scaleY); 
              // Prevent excessive upscaling for small images, but allow some if it's smaller than viewport
              if (scale > 1 && (canvasWidth * scale > wrapWidth * 1.5 || canvasHeight * scale > wrapHeight * 1.5)) {
                  scale = Math.min(scale, 1.5); // Cap upscaling if it gets too large
              }
              if (scale > 1 && canvasWidth < wrapWidth && canvasHeight < wrapHeight) {
                // If image is smaller than container, don't scale up beyond its natural size unless it's tiny
                if (canvasWidth < wrapWidth * 0.5 || canvasHeight < wrapHeight * 0.5) {
                     // Allow some scaling if very small
                } else {
                    scale = 1;
                }
              }
          }
          
          scale = Math.max(0.05, Math.min(scale, 3)); // Min scale 0.05, max initial scale 3

          currentPanzoomInstance = panzoom(newCanvas, {
            maxZoom: 10,
            minZoom: 0.05,
            initialZoom: scale,
            initialX: (wrapWidth - (canvasWidth * scale)) / 2,
            initialY: (wrapHeight - (canvasHeight * scale)) / 2,
            bounds: true, 
            boundsPadding: 0.05, // Adjusted padding
            zoomDoubleClickSpeed: 1.75,
            smoothScroll: false,
            onTouch: function(e) { return true; },
            filterKey: function(){ return false; }
          });

          const newUrl = `${window.location.pathname}?cat=${cat}&page=${num}`;
          window.history.replaceState({path: newUrl}, '', newUrl);

          document.querySelectorAll(".thumb").forEach((thumbEl, i) => {
            thumbEl.classList.toggle("active", i === currentIndex);
            if (i === currentIndex ) {
              thumbEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          });
        });
      }, oldCanvas ? 260 : 0);
    })
    .catch(errorDetails => {
      clearTimeout(imageTransitionTimeout);
      if (oldCanvas && oldCanvas.parentNode === wrap) {
         wrap.removeChild(oldCanvas);
      }
      loading.classList.remove('show');
      wrap.innerHTML = `<p style="color:red;text-align:center;padding:20px;">无法加载图片 ${errorDetails.src || imagePath}。</p>`;
      console.error(`Failed to load image: ${errorDetails.src || imagePath}`, errorDetails.errorEvent);
    });
}

// —— 9. 绑定翻页按钮
function triggerButtonAnimation(button) {
    if(button) {
        button.classList.add('shake-animation');
        setTimeout(() => button.classList.remove('shake-animation'), 400);
    }
}
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        showByIndex(currentIndex - 1);
    } else {
        triggerButtonAnimation(prevBtn);
    }
    });
}
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
    if (currentIndex < numsInCurrentCategory.length - 1) {
        showByIndex(currentIndex + 1);
    } else {
        triggerButtonAnimation(nextBtn);
    }
    });
}

// Add shake animation CSS
if (!document.getElementById('gallery-animations')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "gallery-animations";
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes shakeHorizontal {
        0%, 100% { transform: translateY(-50%) translateX(0); }
        20%, 60% { transform: translateY(-50%) translateX(-4px); }
        40%, 80% { transform: translateY(-50%) translateX(4px); }
      }
      .nav-btn.shake-animation {
        animation: shakeHorizontal 0.4s cubic-bezier(.36,.07,.19,.97) both;
      }
    `;
    document.head.appendChild(styleSheet);
}

// —— 10. 生成底部序号按钮
if (thumbs) {
    thumbs.innerHTML = ''; 
    currentCategoryData.pages.forEach((pageItem, i) => { // Iterate over currentCategoryData.pages to get correct index i
        const btn = document.createElement("div");
        btn.className   = "thumb";
        btn.textContent = pageItem.num; 
        btn.dataset.pageNumber = pageItem.num; 
        // The index 'i' here correctly corresponds to its position in currentCategoryData.pages
        btn.addEventListener("click", () => showByIndex(i)); 
        thumbs.appendChild(btn);
    });
}

// —— 11. 初始加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        preloadAllForCategory(cat).finally(() => showByIndex(currentIndex));
    });
} else {
    preloadAllForCategory(cat).finally(() => showByIndex(currentIndex));
}


// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return; 
    }
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if(prevBtn) prevBtn.click();
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if(nextBtn) nextBtn.click();
    }
});