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
    canvas.width = window.innerWidth; // 動態設置寬度為視窗寬度
   
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
// 卡片提前展開版本（展開完成點再往上移）
// =============================
const cards = document.querySelectorAll('.card-slider-item');
const cardPage = document.querySelector('.card-page');

if (cardPage && cards.length > 0) {
  window.addEventListener('scroll', () => {
    const rect = cardPage.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // 控制「開始展開」與「結束展開」的定位
    const expandStart = windowHeight - 300; // 比原本更早開始展開
    const expandEnd = 150; // 當 cardPage 頂端距離視窗頂 150px 時就算完全展開

    let scrollPercent = 0;

    if (rect.top < expandStart && rect.top > expandEnd) {
      // 線性展開過程
      scrollPercent = 1 - (rect.top - expandEnd) / (expandStart - expandEnd);
      scrollPercent = Math.min(Math.max(scrollPercent, 0), 1);
    } else if (rect.top <= expandEnd) {
      // 當頂部到達 expandEnd (150px) 時 → 完全展開
      scrollPercent = 1;
    } else {
      // 還沒進入範圍 → 收合
      scrollPercent = 0;
    }

    cards.forEach((card, index) => {
      const offsetX = index * 220 * scrollPercent;
      card.style.transform = `translateX(${offsetX}px) translateY(-50%)`;
    });
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
  
  
  