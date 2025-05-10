// js/gallery.js

document.addEventListener('DOMContentLoaded', () => {
  // —— 1. 分类数据 —— 
  const categories = {
    group1: { title: "初高中衔接公式", pages: [
      { num:1, label:"二次方程及因式分解" },
      { num:2, label:"指数、对数与数列" },
      { num:3, label:"数列求和及三角函数" },
      { num:4, label:"奇偶函数" }
    ]},
    group2: { title: "极限与微分基础", pages: [
      { num:5, label:"等价及基础极限公式" },
      { num:6, label:"导数基础" },
      { num:7, label:"常用导数公式" },
      { num:8, label:"零点定理 & 中值定理" },
      { num:9, label:"不定积分基础" }
    ]},
    group3: { title: "不定积分与定积分", pages: [
      { num:10, label:"不定积分公式" },
      { num:11, label:"三角代换及定积分基础" },
      { num:12, label:"变限积分求导 & 牛顿-莱布尼兹" }
    ]},
    group4: { title: "微分方程与向量几何", pages: [
      { num:13, label:"微分方程基础" },
      { num:14, label:"向量积/数量积 & 平面方程" },
      { num:15, label:"空间直线方程" }
    ]},
    group5: { title: "多元微积分与无穷级数", pages: [
      { num:16, label:"多元微分基础" },
      { num:17, label:"多元函数极值 & 多元积分" },
      { num:18, label:"无穷级数 & 幂级数展开" }
    ]},
    group6: { title: "概率论与统计基础", pages: [
      { num:19, label:"线性代数 & 概率论公式" },
      { num:20, label:"随机变量数字特征" },
      { num:21, label:"常见分布 & 期望方差" },
      { num:22, label:"正项级数 & 交错级数" },
      { num:23, label:"幂级数 & 线代基础" }
    ]}
  };

  // —— 2. 读取 URL 参数 cat & page —— 
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get("cat") || "group1";
  const page   = parseInt(params.get("page"), 10)
    || categories[cat].pages[0].num;

  // —— 3. 构建当前分类页码列表 & 索引 —— 
  const currCat = categories[cat];
  const nums    = currCat.pages.map(p => p.num);
  let currentIndex = nums.indexOf(page);
  if (currentIndex < 0) currentIndex = 0;

  // —— 4. 动态填充下拉菜单 —— 
  for (let i = 1; i <= 6; i++) {
    const menuEl = document.getElementById(`menu${i}`);
    if (!menuEl) continue;
    const key = `group${i}`;
    categories[key].pages.forEach(p => {
      const a = document.createElement("a");
      a.className   = "dropdown-item";
      // 使用相对路径+当前页面名，避免 GH Pages 路径问题
      a.href        = window.location.pathname.replace(/[^/]+$/, "") +
                      "gallery.html?cat=" + key + "&page=" + p.num;
      a.textContent = p.label;
      menuEl.appendChild(a);
    });
  }

  // —— 5. 获取 DOM —— 
  const wrap    = document.getElementById("canvas-wrap");
  const thumbs  = document.getElementById("thumbs");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const loading = document.getElementById("loading");

  // —— 6. 预加载函数 —— 
  function preloadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload  = () => res(src);
      img.onerror = () => rej(src);
      img.src     = src;
    });
  }
  function preloadAll(urls) {
    return Promise.all(urls.map(preloadImage));
  }

  // —— 7. 自动裁剪 —— 
  function autoCrop(img, cb) {
    const tmp = document.createElement("canvas");
    const ctx = tmp.getContext("2d");
    tmp.width  = img.width; tmp.height = img.height;
    ctx.drawImage(img,0,0);
    const data = ctx.getImageData(0,0,tmp.width,tmp.height).data;
    let top=tmp.height,left=tmp.width,right=0,bottom=0;
    for (let y=0; y<tmp.height; y++) {
      for (let x=0; x<tmp.width; x++) {
        const idx=(y*tmp.width+x)*4;
        if (data[idx]<250||data[idx+1]<250||data[idx+2]<250) {
          top=Math.min(top,y);
          bottom=Math.max(bottom,y);
          left=Math.min(left,x);
          right=Math.max(right,x);
        }
      }
    }
    const w=right-left+1, h=bottom-top+1;
    const crop=document.createElement("canvas");
    crop.width=w; crop.height=h;
    crop.getContext("2d").drawImage(tmp,left,top,w,h,0,0,w,h);
    cb(crop);
  }

  // —— 8. 渲染函数 —— 
  function showByIndex(idx) {
    if (idx<0 || idx>=nums.length) return;
    currentIndex = idx;
    const num = nums[idx];
    const img = new Image();
    img.src = `./formulaimg/${num}.png`;
    img.onload = () => {
      wrap.querySelectorAll("canvas").forEach(c=>c.remove());
      autoCrop(img, canvas => {
        wrap.appendChild(canvas);
        loading.classList.remove("show");
        const scale = wrap.clientWidth / canvas.width;
        panzoom(canvas, {
          maxZoom:5, minZoom:0, bounds:false,
          initialZoom:scale, initialX:0, initialY:0
        });
        document.querySelectorAll(".thumb").forEach((b,i) => {
          b.classList.toggle("active", i===currentIndex);
        });
      });
    };
    img.onerror = () => {
      wrap.innerHTML = `<p style="color:red;text-align:center;">
        无法加载第 ${num} 页
      </p>`;
    };
  }

  // —— 9. 按钮绑定 —— 
  prevBtn.addEventListener("click", ()=> showByIndex(currentIndex-1));
  nextBtn.addEventListener("click", ()=> showByIndex(currentIndex+1));

  // —— 10. 底部序号 —— 
  nums.forEach((n,i) => {
    const btn = document.createElement("div");
    btn.className   = "thumb";
    btn.textContent = n;
    btn.addEventListener("click", ()=> showByIndex(i));
    thumbs.appendChild(btn);
  });

  // —— 11. 预加载 & 默认渲染 —— 
  const urls = nums.map(n=>`./formulaimg/${n}.png`);
  preloadAll(urls)
    .then(() => showByIndex(currentIndex))
    .catch(() => showByIndex(currentIndex));
});
