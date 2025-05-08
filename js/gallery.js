// js/gallery.js

// -------- 解析 URL 中的 start 与 end 参数 --------
const params = new URLSearchParams(window.location.search);
const start = parseInt(params.get('start'), 10) || 1;
const end   = parseInt(params.get('end'),   10) || start;

// 如果 start>end，则交换
const from = Math.min(start, end);
const to   = Math.max(start, end);

// 构建要显示的页码数组
const nums = [];
for (let i = from; i <= to; i++) {
  nums.push(i);
}
let currentIndex = 0;

// -------- 获取 DOM 节点 --------
const wrap    = document.getElementById('canvas-wrap');
const thumbs  = document.getElementById('thumbs');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loading = document.getElementById('loading');

// -------- 预加载函数 --------
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(src);
    img.onerror = () => reject(src);
    img.src     = src;
  });
}
function preloadAll(urls) {
  return Promise.all(urls.map(preloadImage));
}

// -------- 自动裁剪白边 --------
function autoCrop(img, cb) {
  const temp = document.createElement('canvas');
  const tctx = temp.getContext('2d');
  temp.width  = img.width;
  temp.height = img.height;
  tctx.drawImage(img, 0, 0);
  const data = tctx.getImageData(0, 0, temp.width, temp.height).data;

  let top = temp.height, left = temp.width, right = 0, bottom = 0;
  for (let y = 0; y < temp.height; y++) {
    for (let x = 0; x < temp.width; x++) {
      const idx = (y * temp.width + x) * 4;
      if (data[idx] < 250 || data[idx+1] < 250 || data[idx+2] < 250) {
        top    = Math.min(top, y);
        bottom = Math.max(bottom, y);
        left   = Math.min(left, x);
        right  = Math.max(right, x);
      }
    }
  }

  const w = right - left + 1;
  const h = bottom - top + 1;
  const crop = document.createElement('canvas');
  crop.width  = w;
  crop.height = h;
  crop.getContext('2d')
      .drawImage(temp, left, top, w, h, 0, 0, w, h);

  cb(crop);
}

// -------- 渲染指定索引的图片 --------
function showByIndex(idx) {
  if (idx < 0 || idx >= nums.length) return;
  currentIndex = idx;
  const num = nums[idx];
  const img = new Image();
  img.src = `./formulaimg/${num}.png`;
  img.onload = () => {
    // 清除旧画布
    wrap.querySelectorAll('canvas').forEach(c => c.remove());
    autoCrop(img, canvas => {
      wrap.appendChild(canvas);
      loading.style.display = 'none';

      // 自动计算初始缩放，铺满宽度
      const scale = wrap.clientWidth / canvas.width;
      panzoom(canvas, {
        maxZoom:       5,
        minZoom:       0,
        bounds:        false,
        initialZoom:   scale,
        initialX:      0,
        initialY:      0
      });

      // 更新底部“序号按钮”高亮
      document.querySelectorAll('.thumb').forEach((btn, i) => {
        btn.classList.toggle('active', i === currentIndex);
      });
    });
  };
  img.onerror = () => {
    wrap.innerHTML = `<p style="color:red; text-align:center;">
      无法加载第 ${num} 页图片
    </p>`;
  };
}

// -------- 绑定翻页按钮 --------
prevBtn.onclick = () => showByIndex(currentIndex - 1);
nextBtn.onclick = () => showByIndex(currentIndex + 1);

// -------- 生成底部“序号按钮” --------
nums.forEach((num, i) => {
  const btn = document.createElement('div');
  btn.className   = 'thumb';
  btn.textContent = num;
  btn.onclick     = () => showByIndex(i);
  thumbs.appendChild(btn);
});

// -------- 预加载并启动第一页的展示 --------
const urls = nums.map(n => `./formulaimg/${n}.png`);
preloadAll(urls)
  .then(() => showByIndex(0))
  .catch(failed => {
    console.warn('预加载失败，仍尝试展示第一页:', failed);
    showByIndex(0);
  });
