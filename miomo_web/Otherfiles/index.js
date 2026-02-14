// 節流函式 (Throttle)
function throttle(fn, wait) {
    let lastTime = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }
  
  const handleScroll = throttle(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
    const aboutSection = document.querySelector('.about');
    const productImage = document.querySelector('.product-image');
    const windowHeight = window.innerHeight;
  
    // 模糊文字顯示動畫
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top < windowHeight * 0.75) {
        heading.classList.add('active');
      } else {
        heading.classList.remove('active');
      }
    });
  
    // 圖片動畫處理
    if (aboutSection && productImage) {
      const rect = aboutSection.getBoundingClientRect();
      if (
        rect.top < windowHeight * 0.8 &&
        rect.bottom > 0 &&
        !productImage.classList.contains('float-animate') &&
        !productImage.classList.contains('pop-animate')
      ) {
        // 延遲 1 秒觸發動畫
        setTimeout(() => {
          productImage.classList.add('pop-animate');
          productImage.style.opacity = '1';
  
          // 爆炸動畫結束後觸發漂浮動畫
          productImage.addEventListener(
            'animationend',
            () => {
              productImage.classList.remove('pop-animate');
              productImage.classList.add('float-animate');
            },
            { once: true }
          );
        }, 700); // 延遲 0.7 秒
      } else if (rect.bottom <= 0 || rect.top >= windowHeight) {
        // 離開畫面時重置動畫
        productImage.classList.remove('pop-animate', 'float-animate');
        productImage.style.opacity = '0';
      }
    }
  }, 100);
  
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('load', handleScroll);
  
   // 波形
  const canvas = document.getElementById("wave");
  const ctx = canvas.getContext("2d");
  
  function resizeCanvas() {
    canvas.width = window.innerWidth; 
   
  }
  resizeCanvas();
  
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
  
  const height = canvas.height;
  const N = 600; 
  const dx = 1;
  let t = 0;
  
  // envelopeMulti 函式
  function envelopeMulti(x) {
    const sigma = 20;
    const centers = [-250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250];
    const maxDistance = 250;
    let sum = 0;
    centers.forEach(c => {
      const distanceWeight = 1 - Math.abs(c) / maxDistance;
      sum += distanceWeight * Math.exp(-(x - c) * (x - c) / (2 * sigma * sigma));
    });
    return sum;
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, height);
    ctx.lineWidth = 2;
  
    // 粉色波形
    ctx.beginPath();
    ctx.strokeStyle = "pink";
    for (let i = 0; i < N; i++) {
      let x = (i - N / 2) * dx;
      let k0 = 0.2;
      let envelope = envelopeMulti(x);
      let real = envelope * Math.cos(k0 * x - 0.02 * t);
      let px = i * (canvas.width / N); //  x 座標
      let py = height / 2 - real * 40;// 線波高
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  
    // 黃色波形
    ctx.beginPath();
    ctx.strokeStyle = "yellow";
    for (let i = 0; i < N; i++) {
      let x = (i - N / 2) * dx;
      let envelope = envelopeMulti(x);
      let prob = envelope * envelope;
      let px = i * (canvas.width / N);
      let py = height / 2 - prob * 0;// 線波高
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  
    t += 5;
    requestAnimationFrame(draw);
  }
  
  draw();
 
// =============================
// 撲克牌
// =============================
const cards = document.querySelectorAll('.card-slider-item');
const cardPage = document.querySelector('.card-page');

if (cardPage && cards.length > 0) {
  
  const n = cards.length;
  const mid = (n - 1) / 2;

  function seeded(i){
   
    const x = Math.sin(i * 999) * 10000;
    return x - Math.floor(x);
  }

  const meta = Array.from(cards).map((card, i) => {
    const r1 = seeded(i + 1);
    const r2 = seeded(i + 7);

    const baseRot = (i - mid) * 3.2 + (r1 - 0.5) * 4.0; 
    const baseY   = (r2 - 0.5) * 34;                     
    const z       = 100 + i;

    card.style.zIndex = z;
    return { card, baseRot, baseY, z };
  });

  let targetP = 0;
  let curP = 0;
  let ticking = false;

  function calcTargetPercent(){
    const rect = cardPage.getBoundingClientRect();
    const vh = window.innerHeight;

    const expandStart = vh - 300; 
    const expandEnd   = 150;

    let p = 0;
    if (rect.top < expandStart && rect.top > expandEnd) {
      p = 1 - (rect.top - expandEnd) / (expandStart - expandEnd);
      p = Math.min(Math.max(p, 0), 1);
    } else if (rect.top <= expandEnd) {
      p = 1;
    } else {
      p = 0;
    }
    return p;
  }

  function render(){
    ticking = false;

    
    curP += (targetP - curP) * 0.14;

    
    const sample = meta[0]?.card;
    const w = sample ? sample.getBoundingClientRect().width : 200;
    const gap = w * 0.72 + 22; 
    meta.forEach(({ card, baseRot, baseY }, i) => {
      const x = (i - mid) * gap * curP;

      
      const y = baseY * (0.35 + 0.65 * curP);

     
      const rot = baseRot * (0.45 + 0.55 * curP);

      card.style.setProperty('--sx', `${x.toFixed(2)}px`);
      card.style.setProperty('--sy', `${y.toFixed(2)}px`);
      card.style.setProperty('--rot', `${rot.toFixed(2)}deg`);
    });

    // 持續跟隨 targetP
    if (Math.abs(targetP - curP) > 0.002){
      requestAnimationFrame(render);
      ticking = true;
    }
  }

  function onScroll(){
    targetP = calcTargetPercent();
    if (!ticking){
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // hover 光澤定位
  meta.forEach(({ card }) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');

      
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (-py * 7).toFixed(2);
      const ry = ( px * 9).toFixed(2);
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
    }, { passive:true });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', `0deg`);
      card.style.setProperty('--ry', `0deg`);
    }, { passive:true });

    
    card.addEventListener('pointerdown', () => {
      const topZ = 300;
      meta.forEach(m => m.card.style.zIndex = m.z);
      card.style.zIndex = topZ;
     
      card.style.setProperty('--hr', '0.8deg');
      setTimeout(()=> card.style.setProperty('--hr','0deg'), 160);
    }, { passive:true });
  });
}





  
  //nav按鈕跳轉
  window.addEventListener('load', () => {
    const aboutBtn = document.querySelector('nav a[href="#about"]');
    const soundRecordBtn = document.querySelector('nav a[href="#sound-map"]');  
    const heroBtn = document.querySelector('nav a[href="#hero"]');  
    const scrollBtn = document.querySelector('.scroll-down-btn');
  
    const aboutSection = document.getElementById('about');
    const soundMapSection = document.getElementById('sound-map'); 
     const heroSection = document.getElementById('hero'); 
    const cardPage = document.querySelector('.card-page');
  
    if (aboutBtn && aboutSection) {
      aboutBtn.addEventListener('click', e => {
        e.preventDefault();
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  
    if (soundRecordBtn && soundMapSection) {  
      soundRecordBtn.addEventListener('click', e => {
        e.preventDefault();
        soundMapSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
    if (heroBtn && heroSection) {  
      heroBtn.addEventListener('click', e => {
        e.preventDefault();
        heroSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  
    if (scrollBtn && cardPage) {
      scrollBtn.addEventListener('click', e => {
        e.preventDefault();
        cardPage.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
  
  
  


/* ================================
   Mouse Interactive FX (ADD ONLY)
================================ */
(function MouseFX(){
  // 全站游標光暈
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.5;
  let raf = null;

  function setRootMouseVars(x, y){
    document.documentElement.style.setProperty('--mouse-x', x + 'px');
    document.documentElement.style.setProperty('--mouse-y', y + 'px');
  }

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!raf){
      raf = requestAnimationFrame(() => {
        setRootMouseVars(mx, my);
        raf = null;
      });
    }
  }, { passive: true });

  // 進出視窗時淡入淡出
  window.addEventListener('mouseleave', () => glow.style.opacity = '0', { passive: true });
  window.addEventListener('mouseenter', () => glow.style.opacity = '0.9', { passive: true });

  // 卡片滑鼠位置光暈
  const hoverTargets = [
    '.analysis-card',
    '.day-card',
    '.unity-image',
    '.upload-dropzone',
    '.monthly-canvas-wrap'
  ];

  function bindSpotlight(el){
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left);
      const y = (e.clientY - r.top);
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
    }, { passive: true });
  }

  function bindAllSpotlights(){
    document.querySelectorAll(hoverTargets.join(',')).forEach(bindSpotlight);
  }
  bindAllSpotlights();

  //  3D 傾斜
  function bindTilt(el){
    const maxTilt = 6; 
    let ticking = false;

    function onMove(e){
      if (window.matchMedia('(max-width: 900px)').matches) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;  
      const py = (e.clientY - r.top) / r.height;  
      const rx = (py - 0.5) * -maxTilt;
      const ry = (px - 0.5) * maxTilt;

      if (!ticking){
        ticking = true;
        requestAnimationFrame(() => {
          el.style.transform = `translateY(-6px) scale(1.01) rotateX(${rx}deg) rotateY(${ry}deg)`;
          ticking = false;
        });
      }
    }

    function onLeave(){
      el.style.transform = ''; 
    }

    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave, { passive: true });
  }

  document.querySelectorAll('.analysis-card, .day-card').forEach(bindTilt);

  // 點擊波紋
  function addRipple(e){
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const s = document.createElement('span');
    s.className = 'mouse-ripple';
    s.style.left = x + 'px';
    s.style.top = y + 'px';

   
    el.style.position = el.style.position || 'relative';
    el.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }

  
  document.querySelectorAll('.analysis-card, .day-card, .upload-dropzone, .unity-image').forEach(el => {
    el.addEventListener('pointerdown', addRipple, { passive: true });
  });

  // 按鈕磁吸
  const magneticButtons = document.querySelectorAll('button, .custom-file-upload');
  magneticButtons.forEach(btn => {
    let raf2 = null;

    btn.addEventListener('mousemove', (e) => {
      if (window.matchMedia('(max-width: 900px)').matches) return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      const tx = dx * 8; 
      const ty = dy * 6;

      if (!raf2){
        raf2 = requestAnimationFrame(() => {
          btn.style.transform = `translate(${tx}px, ${ty}px) translateY(-2px)`;
          raf2 = null;
        });
      }
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    }, { passive: true });
  });

  
  const mo = new MutationObserver(() => {
    bindAllSpotlights();
    document.querySelectorAll('.analysis-card, .day-card').forEach(el => {
      if (!el.__tiltBound){
        el.__tiltBound = true;
        bindTilt(el);
      }
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();


/* =========================================
   Custom Cursor Dot (ADD ONLY)
   小圓點游標 + 慣性延遲 + hover 反饋
========================================= */
(function CursorDot(){
  if (window.matchMedia('(max-width: 900px)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x, ty = y;

  // 慣性移動
  function animate(){
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  /* hover 偵測 */
  const hoverSelectors = [
    'button',
    '.analysis-card',
    '.day-card',
    '.upload-dropzone',
    '.unity-image',
    '.monthly-canvas-wrap'
  ].join(',');

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSelectors)) {
      cursor.classList.add('is-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSelectors)) {
      cursor.classList.remove('is-hover');
    }
  });

  /* 點擊回饋 */
  document.addEventListener('mousedown', () => {
    cursor.classList.add('is-down');
  });
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('is-down');
  });

  /* 離開視窗時隱藏 */
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '.95';
  });
})();



/* ================================
   Back To Top Logic
   ADD ONLY
================================ */
(function BackToTop(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;

  window.addEventListener('scroll', () => {
    if(window.scrollY > 500){
      btn.classList.add('show');
    }else{
      btn.classList.remove('show');
    }
  }, { passive:true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();




/* =========================================================
   HERO VIDEO PERFORMANCE CONTROL (FIX FOR FIXED HERO)
  
========================================================= */
(() => {
  const hero = document.getElementById('hero');
  const spacer = document.querySelector('.hero-spacer');
  const video = document.querySelector('.hero-video') || (hero ? hero.querySelector('video') : null);
  if (!hero || !video) return;

  let userUnlocked = false;
  let pendingSound = true;
  let lastInHero = null;

  async function tryPlay(withSound){
    try{
      video.muted = !withSound;
      await video.play();
      return true;
    }catch(e){
      return false;
    }
  }

  async function applyState(inHero){
    if (document.hidden){
      if (!video.paused) video.pause();
      return;
    }
    if (!inHero){
      if (!video.paused) video.pause();
      return;
    }
    if (userUnlocked && pendingSound){
      const ok = await tryPlay(true);
      if (!ok) await tryPlay(false);
      return;
    }
    const okSound = pendingSound ? await tryPlay(true) : false;
    if (!okSound) await tryPlay(false);
  }

  function computeInHero(){
    const h = spacer ? spacer.getBoundingClientRect().height : window.innerHeight;
    return window.scrollY < h * 0.9;
  }

  let raf = 0;
  function tick(){
    raf = 0;
    const inHero = computeInHero();
    if (inHero !== lastInHero){
      lastInHero = inHero;
      applyState(inHero);
    }
  }
  function requestTick(){
    if (raf) return;
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', requestTick, { passive:true });
  window.addEventListener('resize', requestTick, { passive:true });
  document.addEventListener('visibilitychange', requestTick);

  const unlock = async () => {
    if (userUnlocked) return;
    userUnlocked = true;
    pendingSound = true;
    if (computeInHero()){
      await tryPlay(true);
    }
  };
  ['pointerdown','touchstart','keydown'].forEach(evt => {
    window.addEventListener(evt, unlock, { once:true, passive:true });
  });

  requestTick();
})();
