// js/gallery.js
document.addEventListener('DOMContentLoaded', () => {
  // 1. 分类及标签
  const categories = {
    group1: [
      { num: 1, label: "二次方程及因式分解" },
      { num: 2, label: "指数、对数与数列" },
      { num: 3, label: "数列求和及三角函数" },
      { num: 4, label: "奇偶函数" }
    ],
    group2: [
      { num: 5,  label: "等价及基础极限公式" },
      { num: 6,  label: "导数基础" },
      { num: 7,  label: "常用导数公式" },
      { num: 8,  label: "零点定理 & 中值定理" },
      { num: 9,  label: "不定积分基础" }
    ],
    group3: [
      { num:10, label: "不定积分公式" },
      { num:11, label: "三角代换及定积分基础" },
      { num:12, label: "变限积分求导 & 牛顿-莱布尼兹" }
    ],
    group4: [
      { num:13, label: "微分方程基础" },
      { num:14, label: "向量积/数量积 & 平面方程" },
      { num:15, label: "空间直线方程" }
    ],
    group5: [
      { num:16, label: "多元微分基础" },
      { num:17, label: "多元函数极值 & 多元积分" },
      { num:18, label: "无穷级数 & 幂级数展开" }
    ],
    group6: [
      { num:19, label: "线性代数 & 概率论公式" },
      { num:20, label: "随机变量数字特征" },
      { num:21, label: "常见分布 & 期望方差" },
      { num:22, label: "正项级数 & 交错级数" },
      { num:23, label: "幂级数 & 线代基础" }
    ]
  };

  // 2. 读取 URL 参数
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get("cat")  || "group1";
  const page   = parseInt(params.get("page"), 10)
                   || categories[cat][0].num;

  // 3. 构建当前分类页码 & 索引
  const list = categories[cat];
  const nums = list.map(p => p.num);
  let currentIndex = nums.indexOf(page);
  if (currentIndex < 0) currentIndex = 0;

  // 4. 填充下拉菜单
  for (let i=1; i<=6; i++){
    const menuEl = document.getElementById(`menu${i}`);
    if (!menuEl) continue;
    const key = `group${i}`;
    categories[key].forEach(p => {
      const a = document.createElement("a");
      a.className   = "dropdown-item";
      a.href        = `gallery.html?cat=${key}&page=${p.num}`;
      a.textContent = p.label;
      menuEl.appendChild(a);
    });
  }

  // 5. 获取 DOM
  const wrap    = document.getElementById("canvas-wrap");
  const thumbs  = document.getElementById("thumbs");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const loading = document.getElementById("loading");

  // 6. 渲染函数：fit-height 顶部对齐，水平居中
  function showByIndex(idx){
    if (idx<0||idx>=nums.length) return;
    currentIndex = idx;
    const num = nums[idx];

    wrap.innerHTML = "";
    wrap.appendChild(loading);
    wrap.appendChild(prevBtn);
    wrap.appendChild(nextBtn);
    loading.classList.add("show");

    const img = new Image();
    img.src = `./formulaimg/${num}.png`;
    img.style.position = "absolute";

    img.onload = () => {
      loading.classList.remove("show");
      wrap.appendChild(img);
      const W = wrap.clientWidth, H = wrap.clientHeight;
      const w = img.naturalWidth, h = img.naturalHeight;
      const scale = H / h;
      const offsetX = (W - w * scale) / 2;
      const offsetY = 0;
      panzoom(img, {
        maxZoom:     5,
        minZoom:     0,
        bounds:      false,
        initialZoom: scale,
        initialX:    offsetX,
        initialY:    offsetY
      });
      document.querySelectorAll(".thumb").forEach((b,i)=>{
        b.classList.toggle("active", i===currentIndex);
      });
    };
    img.onerror = () => {
      wrap.innerHTML = `<p style="color:red;text-align:center;">
        无法加载第 ${num} 张
      </p>`;
    };
  }

  // 7. 翻页绑定
  prevBtn.onclick = () => showByIndex(currentIndex-1);
  nextBtn.onclick = () => showByIndex(currentIndex+1);

  // 8. 底部序号
  list.forEach((p,i)=>{
    const btn = document.createElement("div");
    btn.className   = "thumb";
    btn.textContent = p.num;
    btn.onclick     = () => showByIndex(i);
    thumbs.appendChild(btn);
  });

  // 9. 首次渲染
  showByIndex(currentIndex);
});
