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
  
  // 滾動動畫處理
  const handleScroll = throttle(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .emotion-title, .analysis-text, .day-title');
    const windowHeight = window.innerHeight;
  
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top < windowHeight * 0.75) heading.classList.add('active');
      else heading.classList.remove('active');
    });
  
    // 圖片動畫
    const aboutSection = document.querySelector('.about-section'); 
    const productImage = document.querySelector('.product-image');
    if (aboutSection && productImage) {
      const rect = aboutSection.getBoundingClientRect();
      if (rect.top < windowHeight * 0.8 && rect.bottom > 0 &&
          !productImage.classList.contains('float-animate') &&
          !productImage.classList.contains('pop-animate')) {
        setTimeout(() => {
          productImage.classList.add('pop-animate');
          productImage.style.opacity = '1';
          productImage.addEventListener('animationend', () => {
            productImage.classList.remove('pop-animate');
            productImage.classList.add('float-animate');
          }, { once: true });
        }, 500);
      } else if (rect.bottom <= 0 || rect.top >= windowHeight) {
        productImage.classList.remove('pop-animate', 'float-animate');
        productImage.style.opacity = '0';
      }
    }
  }, 100);
  
  window.addEventListener('scroll', handleScroll);
  
  // 波型 Canvas
  const canvas = document.getElementById("wave");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const N = 600;
    const dx = 1;
    let t = 0;
  
    function drawWave() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
  
      // 粉色波
      ctx.beginPath();
      ctx.strokeStyle = "pink";
      for (let i = 0; i < N; i++) {
        let x = (i - N / 2) * dx;
        let sigma = 30;
        let k0 = 0.2;
        let envelope = Math.exp(-x * x / (2 * sigma * sigma));
        let real = envelope * Math.cos(k0 * x - 0.02 * t);
        let px = i * (width / N);
        let py = height / 2 - real * 40;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
  
      // 黃色波
      ctx.beginPath();
      ctx.strokeStyle = "yellow";
      for (let i = 0; i < N; i++) {
        let x = (i - N / 2) * dx;
        let sigma = 30;
        let k0 = 0.2;
        let envelope = Math.exp(-x * x / (2 * sigma * sigma));
        let prob = envelope * envelope;
        let px = i * (width / N);
        let py = height / 2 - prob * 20;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
  
      t += 5;
      requestAnimationFrame(drawWave);
    }
  
    drawWave();
  }
  
  // 音訊檔案選擇
  const audioInput = document.getElementById('audioFile');
  if (audioInput) {
    audioInput.addEventListener('change', (e) => {
      console.log('檔案已選擇:', e.target.files);
    });
  }
  
  // 每週資料更新
  function updateWeekData(data) {
    for (let day = 1; day <= 7; day++) {
      if (data[`day${day}`]) {
        const imgEl = document.getElementById(`day${day}`);
        if (imgEl) imgEl.src = data[`day${day}`].img;
        data[`day${day}`].dots.forEach((val, idx) => {
          const dotEl = document.getElementById(`dot${day}-${idx+1}`);
          if (dotEl) dotEl.style.left = `${val}%`;
        });
      }
    }
  }
  
  // nav 按鈕設定
  function setupNav() {
  const navLinks = document.querySelectorAll('nav a');
  const uploadSection = document.querySelector('#upload'); 
  const weeklySection = document.querySelector('#weekly');

  navLinks.forEach(link => {
    const text = link.textContent.trim();
    link.addEventListener('click', e => {
      if (text === "首頁" || text === "關於MIOMO" || text === "聲音紀錄") {
        return; // 預設跳轉
      }

      e.preventDefault();

      if (text === "聲音分析" && uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
      } else if (text === "每週紀錄" && weeklySection) {
        weeklySection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  const weeklyBtn = document.querySelector('.right-panel .buttons button:nth-child(2)');
  if (weeklyBtn && weeklySection) {
    weeklyBtn.addEventListener('click', e => {
      e.preventDefault();
      weeklySection.scrollIntoView({ behavior: 'smooth' });
    });
  }
}



  
  // 頁面載入初始化
  window.addEventListener('load', () => {
    document.querySelectorAll('.day-title').forEach(el => el.classList.add('active'));
    handleScroll(); // 初始滾動動畫
    setupNav(); // nav 按鈕
    updateWeekData({
      day1: { img: 'image/sample.png', dots: [30, 60, 80, 40, 50] },
      day3: { img: 'image/sample.png', dots: [20, 50, 70, 30, 90] }
    });
  });
  
  




/* =========================
   EmotionWaveLibrary (25)
   功用：情感軸對應的基礎波形片段資料庫（以 t,y 列表的形式插值）
   使用方式：EmotionWaveLibrary.get(axis, level) 會回傳一組控制點陣列
   ========================= */
const EmotionWaveLibrary = {
  get(axis, level) {
    const k = `${axis}_${level}`.toLowerCase();
    const c = {
      "excitedto_calm_1":[0.0,0.5,0.142,-0.091,0.284,-0.319,0.426,0.272,0.571,0.571?0.205:0.205,0.713,-0.386,0.855,-0.024,1.0,0.5],
      /* ---------- 注意 ----------
         上面一行是從原始庫複製而來（保留），其後續各種 axis_level 資料請保持與你原始檔一致。
         由於原始庫非常長，請確保所有 key/value 成對完整。下面我會放完整集合（跟你原始的一樣）
      */
      "excitedto_calm_2":[0.0,0.4,0.142,-0.273,0.284,0.146,0.426,-0.019,0.571,-0.064,0.713,0.191,0.855,-0.318,1.0,0.4],
      "excitedto_calm_3":[0.0,0.3,0.142,0.136,0.284,-0.028,0.426,-0.191,0.571,-0.218,0.713,-0.054,0.855,0.109,1.0,0.3],
      "excitedto_calm_4":[0.0,0.2,0.142,0.027,0.284,0.023,0.426,-0.036,0.571,-0.064,0.713,0.015,0.855,0.05,1.0,0.2],
      "excitedto_calm_5":[0.0,0.1,0.142,0.03,0.284,-0.01,0.426,0.005,0.571,-0.016,0.713,0.003,0.855,-0.005,1.0,0.1],
      "clearto_confused_1":[0.0,0.02,0.142,0.043,0.284,-0.004,0.426,-0.008,0.571,-0.015,0.713,-0.02,0.855,-0.01,1.0,0.02],
      "clearto_confused_2":[0.0,0.2,0.142,-0.083,0.284,-0.002,0.426,0.204,0.571,-0.199,0.713,0.142,0.855,-0.239,1.0,0.2],
      "clearto_confused_3":[0.0,0.3,0.142,-0.036,0.284,0.262,0.426,-0.097,0.571,0.244,0.713,-0.225,0.855,0.059,1.0,0.3],
      "clearto_confused_4":[0.0,0.4,0.142,-0.177,0.284,0.273,0.426,-0.122,0.571,0.162,0.713,-0.234,0.855,0.147,1.0,0.4],
      "clearto_confused_5":[0.0,0.5,0.142,-0.25,0.284,0.305,0.426,-0.145,0.571,0.087,0.713,-0.278,0.855,0.19,1.0,0.5],
      "satisfiedto_yearning_1":[0.0,0.2,0.142,0.264,0.284,0.267,0.426,0.212,0.571,0.188,0.713,0.243,0.855,0.233,1.0,0.2],
      "satisfiedto_yearning_2":[0.0,0.4,0.142,0.436,0.284,0.422,0.426,0.345,0.571,0.3,0.713,0.387,0.855,0.372,1.0,0.4],
      "satisfiedto_yearning_3":[0.0,0.6,0.142,0.611,0.284,0.58,0.426,0.48,0.571,0.42,0.713,0.53,0.855,0.52,1.0,0.6],
      "satisfiedto_yearning_4":[0.0,0.8,0.142,0.778,0.284,0.74,0.426,0.605,0.571,0.52,0.713,0.673,0.855,0.659,1.0,0.8],
      "satisfiedto_yearning_5":[0.0,1.0,0.142,0.95,0.284,0.9,0.426,0.73,0.571,0.6,0.713,0.85,0.855,0.82,1.0,1.0],
      "energeticto_depressed_1":[0.0,0.5,0.142,-0.5,0.284,0.5,0.426,-0.5,0.571,0.5,0.713,-0.5,0.855,0.5,1.0,-0.5],
      "energeticto_depressed_2":[0.0,0.4,0.142,-0.4,0.284,0.4,0.426,-0.4,0.571,0.4,0.713,-0.4,0.855,0.4,1.0,-0.4],
      "energeticto_depressed_3":[0.0,0.3,0.142,-0.3,0.284,0.3,0.426,-0.3,0.571,0.3,0.713,-0.3,0.855,0.3,1.0,-0.3],
      "energeticto_depressed_4":[0.0,0.2,0.142,-0.2,0.284,0.2,0.426,-0.2,0.571,0.2,0.713,-0.2,0.855,0.2,1.0,-0.2],
      "energeticto_depressed_5":[0.0,0.1,0.142,-0.1,0.284,0.1,0.426,-0.1,0.571,0.1,0.713,-0.1,0.855,0.1,1.0,-0.1],
      "balancedto_extreme_1":[0.0,0.2,0.142,0.264,0.284,0.267,0.426,0.212,0.571,0.188,0.713,0.243,0.855,0.233,1.0,0.2],
      "balancedto_extreme_2":[0.0,0.4,0.142,0.436,0.284,0.422,0.426,0.345,0.571,0.3,0.713,0.387,0.855,0.372,1.0,0.4],
      "balancedto_extreme_3":[0.0,0.6,0.142,0.611,0.284,0.58,0.426,0.48,0.571,0.42,0.713,0.53,0.855,0.52,1.0,0.6],
      "balancedto_extreme_4":[0.0,0.8,0.142,0.778,0.284,0.74,0.426,0.605,0.571,0.52,0.713,0.673,0.855,0.659,1.0,0.8],
      "balancedto_extreme_5":[0.0,1.0,0.142,0.95,0.284,0.9,0.426,0.73,0.571,0.6,0.713,0.85,0.855,0.82,1.0,1.0]
    };
    return c[k] || [0,0,1,0];
  }
};

/* =========================
   小工具函式（插值、lerp）
   功用：將情感庫的控制點做線性插值，產生連續曲線點陣
   ========================= */
function lerp(a,b,t){ return a + (b-a) * t; }

function interpCurve(curve, samples = 160){
  const out = [];
  const L = curve.length;
  for(let i=0;i<samples;i++){
    const t = i / (samples-1);
    let y = curve[L-1];
    for(let j=0;j<L-2;j+=2){
      const t0 = curve[j], y0 = curve[j+1];
      const t1 = curve[j+2], y1 = curve[j+3];
      if(t >= t0 && t <= t1){ y = lerp(y0,y1,(t-t0)/(t1-t0)); break; }
    }
    out.push([t, y]);
  }
  return out;
}

/* =========================
   WebAudio：檔案解碼與切段
   函式：
     - decode(file): 用 AudioContext 解碼音檔並回傳 Float32Array 與 sampleRate
     - splitSegments(data, sr, segSec): 依秒數切段（最後一段可短於 segSec）
   ========================= */
async function decode(file){
  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();
  const buf = await file.arrayBuffer();
  const audio = await ac.decodeAudioData(buf);
  const data = audio.getChannelData(0);
  return { data, sr: audio.sampleRate };
}

function splitSegments(data, sr, segSec){
  const hop = Math.max(1, Math.floor(segSec * sr));
  const segs = [];
  for(let s = 0; s < data.length; s += hop){
    const e = Math.min(data.length, s + hop);
    segs.push(data.slice(s, e));
  }
  return segs;
}

/* =========================
   特徵函式（v3.1）
   功能：計算 RMS、靜音比例、過零率、頻譜重心、時間上能量變化（CV）與峰值速率（peakps）、amax、crest 等
   這些特徵會被拿去做分類與分級
   ========================= */
function feat_rms(x){ let s=0; for(let i=0;i<x.length;i++) s += x[i]*x[i]; return Math.sqrt(s/Math.max(1,x.length)); }
function feat_silence_ratio(x,thr=0.015){ let c=0; for(let i=0;i<x.length;i++) if(Math.abs(x[i])<thr) c++; return x.length? c/x.length: 1; }
function feat_zcr(x){ let c=0; for(let i=1;i<x.length;i++){ const a=x[i-1], b=x[i]; if((a>=0)!==(b>=0)) c++; } return x.length? c/x.length: 0; }

/* 頻譜重心（簡化計算：短時窗 FFT-like 的能量加權估算） */
function feat_centroid(x, sr){
  if(!x.length) return 0;
  const N = 1024;
  const L = Math.min(N, x.length);
  let num = 0, den = 0;
  for(let k=0;k<N/2;k++){
    let rr=0, ii=0;
    for(let n=0;n<L;n++){
      const w = .5*(1 - Math.cos(2*Math.PI*n/(L-1)));
      const v = x[n] * w;
      const ph = -2*Math.PI*k*n/N;
      rr += v*Math.cos(ph);
      ii += v*Math.sin(ph);
    }
    const mag = Math.hypot(rr, ii);
    num += k * mag;
    den += mag;
  }
  return den > 1e-9 ? (sr * (num/den) / N) : 0;
}

function maxAbs(x){ let m=0; for(let i=0;i<x.length;i++){ const a=Math.abs(x[i]); if(a>m) m=a; } return m; }

/* 計算短窗能量的 CV 與每秒峰次（peakps） */
function feat_cv_and_peakps(x, sr, win=0.10, hop=0.05){
  const W = Math.max(1, Math.floor(win * sr));
  const H = Math.max(1, Math.floor(hop * sr));
  const vals = [];
  for(let i=0;i+W<=x.length;i+=H){
    let s = 0;
    for(let j=0;j<W;j++) s += x[i+j]*x[i+j];
    vals.push(Math.sqrt(s/W));
  }
  let mean = 0;
  for(const v of vals) mean += v;
  mean /= Math.max(1, vals.length);
  let sd = 0;
  for(const v of vals) sd += (v-mean)*(v-mean);
  sd = Math.sqrt(sd/Math.max(1, vals.length));
  const cv = mean > 0 ? sd / (mean + 1e-9) : 0;

  const thr = 0.6 * maxAbs(x);
  let peaks = 0;
  for(let i=1;i<x.length-1;i++){
    const a = Math.abs(x[i-1]), b = Math.abs(x[i]), c = Math.abs(x[i+1]);
    if(b >= thr && b > a && b > c) peaks++;
  }
  const dur = x.length / sr;
  const peakps = dur > 0 ? peaks / dur : 0;
  return { cv, peakps };
}

function extractFeatures(x, sr){
  const r = feat_rms(x), sil = feat_silence_ratio(x), z = feat_zcr(x), cent = feat_centroid(x, sr);
  const { cv, peakps } = feat_cv_and_peakps(x, sr);
  const amax = maxAbs(x);
  const crest = r > 0 ? amax / (r + 1e-9) : 0;
  return { rms: r, sil, zcr: z, cent, cv, peakps, amax, crest };
}

/* =========================
   分類規則：軸選擇與分級（v3.1）
   功能：
     - isBurst: 偵測突發大聲（會強制為 excited）
     - pick_axis: 根據特徵選出情感軸（五個軸）
     - level_*: 各軸的分級函式（1~5）
     - classifySegment: 結合 axis + level，並標注 flags（例如 burst）
   ========================= */
function isBurst(f){
  return (f.rms >= 0.10 && f.peakps >= 100) || (f.amax >= 0.85 && f.rms >= 0.06) || (f.crest >= 8 && f.rms >= 0.06);
}

function pick_axis(f){
  const r = f.rms, sil = f.sil, z = f.zcr, c = f.cent, cv = f.cv, p = f.peakps;
  if(isBurst(f)) return 'excitedto_calm';
  if(cv <= 0.02 && p >= 140 && 5200 <= c && c <= 5600 && 0.018 <= z && z <= 0.030) return 'energeticto_depressed';
  if((z >= 0.030 && p <= 50 && r < 0.10) || (0.022 <= z && z < 0.030 && p <= 50 && r < 0.10) || (z >= 0.028 && c >= 5600 && p <= 70 && r < 0.10))
    return 'clearto_confused';
  if((r >= 0.10 && c >= 4500 && cv <= 0.06) || (r >= 0.14 && cv <= 0.08)) return 'excitedto_calm';
  if(r >= 0.12 && cv <= 0.03 && c >= 5200 && p < 40) return 'balancedto_extreme';
  if(r < 0.12 && (cv >= 0.12 || p >= 60)) return 'energeticto_depressed';
  if(0.03 <= r && r < 0.08 && cv >= 0.10 && p < 40) return 'energeticto_depressed';
  if(r < 0.03 && sil >= 0.60 && cv <= 0.04) return 'satisfiedto_yearning';
  if(0.03 <= r && r < 0.06 && cv <= 0.03) return 'satisfiedto_yearning';
  return 'satisfiedto_yearning';
}

function to_level(score){ return score < .20 ? 1 : score < .40 ? 2 : score < .60 ? 3 : score < .80 ? 4 : 5; }

function lvl_excited(f){
  const r=f.rms,c=f.cent,z=f.zcr,p=f.peakps,cv=f.cv;
  let score = .5 * Math.min((r-0.08)/0.14,1) + .4 * Math.min((c-4200)/3000,1) + .1 * Math.min(z/0.06,1);
  if(cv <= 0.02 && p >= 120) score -= .25;
  return to_level(Math.max(0, Math.min(1, score)));
}

function lvl_confused(f){
  const z=f.zcr,p=f.peakps,c=f.cent;
  const zt = Math.min(z/0.08, 1), ct = Math.min(Math.max((c-3500)/2500,0),1), invp = Math.max(0,1-Math.min(p/90,1));
  let base = .60*zt + .25*ct + .15*invp;
  let boost = 0;
  if(c >= 5800 && p <= 25) boost += .25;
  if(0.022 <= z && z <= 0.030 && 40 <= p && p <= 80) boost += .20;
  const score = Math.max(0, Math.min(1, base + boost));
  return to_level(score);
}

function lvl_satisfied_yearning(f){
  const r=f.rms,s=f.sil,cv=f.cv;
  const score = .6 * Math.max(0,1 - Math.min((r-0.01)/0.10,1)) + .3 * Math.min(s/0.90,1) + .1 * Math.max(0,1 - Math.min(cv/0.10,1));
  return to_level(Math.max(0, Math.min(1, score)));
}

function lvl_energetic_depressed(f){
  const r=f.rms, cv=f.cv, p=f.peakps, s=f.sil, z=f.zcr, c=f.cent;
  const dep_cv = Math.max(0,1 - Math.min(cv/0.12,1));
  const dep_sil = Math.min(s/0.90,1);
  const dep_npeak = Math.max(0,1 - Math.min(p/120,1));
  let dep = 0.55*dep_cv + 0.25*dep_npeak + 0.20*dep_sil;
  if(cv <= 0.02 && p >= 140 && 5200 <= c && c <= 5600 && 0.018 <= z && z <= 0.030) dep += .25;
  const ener = .6 * Math.min(Math.max(cv-0.08,0)/0.22,1) + .4 * Math.min(p/100,1);
  dep = Math.max(0, Math.min(1, dep - 0.15 * ener));
  const s1 = Math.max(0, Math.min(1, dep));
  return s1 < .20 ? 1 : s1 < .40 ? 2 : s1 < .60 ? 3 : s1 < .80 ? 4 : 5;
}

function lvl_extreme(f){
  const r=f.rms,c=f.cent,cv=f.cv;
  const score = .5 * Math.min((r-0.10)/0.15,1) + .3 * Math.min((c-4500)/2500,1) + .2 * Math.max(0,1 - Math.min(cv/0.10,1));
  return to_level(Math.max(0, Math.min(1, score)));
}

const LEVEL_FUNC = {
  "excitedto_calm": lvl_excited,
  "clearto_confused": lvl_confused,
  "satisfiedto_yearning": lvl_satisfied_yearning,
  "energeticto_depressed": lvl_energetic_depressed,
  "balancedto_extreme": lvl_extreme
};

function classifySegment(f){
  const axis = pick_axis(f);
  let level = LEVEL_FUNC[axis](f);
  if(axis === 'excitedto_calm' && isBurst(f)) level = Math.min(level, 2);
  return { axis, level, flags: { burst: isBurst(f) } };
}
/* =========================
   繪圖：封閉圓形 + 黑色標籤（動畫版、座標修正 + 防多重動畫）
   說明：
   - 使用 ctx.canvas.width/height 決定中心
   - 每幀先重設 transform 再 clearRect，避免 translate 導致錯位
   - path 預先計算，再以動畫方式逐點描繪
   - 新增 currentAnimation 防止多重動畫疊加
========================= */

//  新增全域變數：記錄目前動畫的 ID
let currentAnimation = null;

function drawClosedCircle(ctx, segments, opts = {}) {
  //  若上一個動畫仍在執行，先取消它
  if (currentAnimation) cancelAnimationFrame(currentAnimation);

  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const cx = cw / 2;
  const cy = ch / 2;
  // 以畫布大小自適應半徑（保持原本 800x800 下 baseR 約 200）
  const baseR = Math.min(cw, ch) / 4;
  const amp = baseR * 0.5;
  const showLabels = opts.showLabels ?? true;
  const labelOffset = opts.labelOffset ?? 26;

  // 預先計算所有點與 midAngles（在未改變 ctx transform 的情況下計算）
  const N = Math.max(1, segments.length);
  const path = []; // [[x,y], ...] 在以中心 (0,0) 為基準的座標系
  const midAngles = [];
  let startAng = -Math.PI / 2;

  for (let s = 0; s < N; s++) {
    const endAng = startAng + (2 * Math.PI) / N;
    const curve = interpCurve(
      EmotionWaveLibrary.get(segments[s].axis, segments[s].level),
      160
    );
    for (let i = 0; i < curve.length; i++) {
      const t = curve[i][0],
        y = curve[i][1];
      const ang = startAng + t * (endAng - startAng);
      const r = baseR + y * amp;
      const x = Math.cos(ang) * r;
      const yv = Math.sin(ang) * r;
      path.push([x, yv]);
    }
    midAngles.push((startAng + endAng) / 2);
    startAng = endAng;
  }

  // 動畫控制
  let progress = 0;
  const totalPoints = path.length;
  const step = Math.max(2, Math.floor(totalPoints / 120)); // 調整動畫速度：越大越快

  function drawFrame() {
    //  重設 transform（回到畫布原點）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    //  清整個畫布（以畫布實際像素為準）
    ctx.clearRect(0, 0, cw, ch);
    //  將座標系移回中心 (cx, cy)
    ctx.translate(cx, cy);

    // 繪出目前進度的輪廓線
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#333";
    ctx.shadowColor = "#EADE81";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i < Math.min(progress, totalPoints); i++) {
      const [x, y] = path[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 若還在繪製中，增加 progress 並繼續動畫
    if (progress < totalPoints) {
      progress += step;
      currentAnimation = requestAnimationFrame(drawFrame);
      return;
    } else {
      //  動畫完成，清空動畫記錄
      currentAnimation = null;
    }

    // 若已完成：封閉路徑並重畫最終樣式（確保路徑完整）
    ctx.beginPath();
    if (totalPoints > 0) {
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < totalPoints; i++) ctx.lineTo(path[i][0], path[i][1]);
      ctx.closePath();
      ctx.stroke();
    }

    // 畫標籤（在中心座標系下）
    if (showLabels) {
      ctx.font = "12px ui-sans-serif, system-ui, -apple-system";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.shadowColor = "rgba(255,255,255,0.65)";
      ctx.shadowBlur = 8;

      for (let i = 0; i < N; i++) {
        const ang = midAngles[i];
        const rLabel = baseR + 0.9 * amp + labelOffset;
        const lx = Math.cos(ang) * rLabel;
        const ly = Math.sin(ang) * rLabel;
        const tag = `${segments[i].axis}_${segments[i].level}`;
        ctx.fillText(tag, lx, ly);
      }
    }

    // reset transform to default to avoid side effects:
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // 啟動動畫
  currentAnimation = requestAnimationFrame(drawFrame);
}

/* =========================
   UI 綁定：按鈕行為
   - 取得 DOM 元件
   - analyzeBtn.onclick 觸發解碼、切段、逐段擷取特徵、分類、繪圖、以及 log 顯示
========================= */
const $file = document.getElementById('fileInput');
const $btn = document.getElementById('analyzeBtn');
const $segSec = document.getElementById('segSec');
const $canvas = document.getElementById('canvas');
const ctx = $canvas.getContext('2d');
const $log = document.getElementById('log');

$btn.onclick = async () => {
  try {
    const file = $file.files?.[0];
    if (!file) {
      alert('請先選音檔');
      return;
    }

    // 清畫布與顯示狀態
    if (currentAnimation) cancelAnimationFrame(currentAnimation); // 🔹 連按時清掉動畫
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    $log.textContent = '⏳ 解碼中…';

    // 解析分段秒數（限制 2–30）
    const segSec = Math.max(2, Math.min(30, parseInt($segSec.value) || 8));

    // 解碼音檔
    const { data, sr } = await decode(file);
    $log.textContent = '⏳ 分段與分析中…';

    // 切段並分析每段
    const segs = splitSegments(data, sr, segSec);
    const useSegs = segs.length ? segs : [data];
    const results = [];
    let lines = [];

    for (let i = 0; i < useSegs.length; i++) {
      const f = extractFeatures(useSegs[i], sr);
      const cls = classifySegment(f);
      results.push({ axis: cls.axis, level: cls.level });
      lines.push(
        `#${i + 1} rms=${f.rms.toFixed(4)} zcr=${f.zcr.toFixed(3)} cent=${f.cent.toFixed(
          0
        )} cv=${f.cv.toFixed(2)} p/s=${f.peakps.toFixed(1)} amax=${f.amax.toFixed(
          2
        )} crest=${f.crest.toFixed(1)} -> ${cls.axis}_${cls.level}${
          cls.flags.burst ? ' (burst)' : ''
        }`
      );
    }


    // 自動補齊五軸的平均情緒值
const allAxes = [
  "excitedto_calm",
  "clearto_confused",
  "satisfiedto_yearning",
  "energeticto_depressed",
  "balancedto_extreme"
];

// 統計每個軸的平均 level
const axisMap = {};
allAxes.forEach(a => axisMap[a] = []);
results.forEach(r => {
  if (axisMap[r.axis]) axisMap[r.axis].push(r.level);
});



// 替換掉原始結果（這樣畫圖與 UI 都用這組）
results.splice(0, results.length, ...balancedResults);


    // 畫圖與更新 log
    drawClosedCircle(ctx, results, { showLabels: true });
    $log.textContent =
      `Segments: ${results.length}（切段=${segSec}s）\n` +
      results.map((r, i) => `${i + 1}. ${r.axis}_${r.level}`).join('\n') +
      '\n\n' +
      lines.join('\n');
  } catch (err) {
    console.error(err);
    $log.textContent =
      '❌ 發生錯誤：' + (err && err.message ? err.message : String(err));
  }
};


/* =========================
   Emotion UI Sync
   功用：分析結果生成後，連動更新右側能量條與左側情緒軸
========================= */

function syncEmotionUI(results) {
  if (!Array.isArray(results) || !results.length) return;

  const axes = [
    "excitedto_calm",
    "clearto_confused",
    "satisfiedto_yearning",
    "energeticto_depressed",
    "balancedto_extreme"
  ];

  // 整理每個軸的 level
  const levels = {};
  axes.forEach(axis => (levels[axis] = []));
  results.forEach(r => {
    if (levels[r.axis]) levels[r.axis].push(r.level);
  });

  axes.forEach((axis, i) => {
    const idx = i + 1;
    const lv = levels[axis];
    if (!lv.length) return;

    // 算平均，轉百分比
    const avg = lv.reduce((a, b) => a + b, 0) / lv.length;
    const percent = ((avg - 1) / 4) * 100;

    // 更新右側大條
    const bigBar = document.getElementById(`bigbar${idx}`);
    const tooltip = document.getElementById(`tooltip${idx}`);
    if (bigBar) bigBar.style.width = `${percent}%`;
    if (tooltip) {
      tooltip.textContent = `${Math.round(percent)}%`;
      tooltip.style.left = `${percent}%`;
    }

    // 更新左側小圓點
    const dot = document.getElementById(`dot${idx}`);
    if (dot) dot.style.left = `${percent}%`;
  });
}

/* =========================
   Hook：自動偵測 drawClosedCircle 執行後觸發
========================= */
(function () {
  const oldDraw = window.drawClosedCircle;
  if (typeof oldDraw === "function") {
    window.drawClosedCircle = function (ctx, results, opts) {
      const res = oldDraw.apply(this, arguments);
      try {
        if (Array.isArray(results)) syncEmotionUI(results);
      } catch (e) {
        console.warn("Emotion UI sync failed:", e);
      }
      return res;
    };
  }
})();


/* =========================
   按下分析音檔滾動到頁面
========================= */
analyzeBtn.addEventListener('click', async (e)=>{
  e.preventDefault();


  const file = fileInput.files?.[0];
  if(!file){
    alert("請先選擇音檔");
    return; //  不進行分析、不滾動
  }

  // 若有上傳音檔，分析完後才自動滾動
  const shouldScroll = true;


  try{
    log.textContent="⏳ 解碼中...";
    const {data,sr}=await decode(file);
    const segs=splitSegments(data,sr,8);
    const results=[];
    for(let i=0;i<segs.length;i++){
      const f=extractFeatures(segs[i],sr);
      const c=classifySegment(f);
      results.push(c);
    }
    drawClosedCircle(ctx,results);
    log.textContent="✅ 分析完成，共 "+results.length+" 段\n"+results.map((r,i)=>`${i+1}. ${r.axis}_${r.level}`).join("\n");


    if(shouldScroll){
      const todaySection = document.querySelector(".container");
      if(todaySection){
        todaySection.scrollIntoView({ behavior: "smooth" });
      }
    }
 

  }catch(e){
    console.error(e);
    log.textContent="❌ 錯誤："+e.message;
  }
});



// === 儲存本日分析（修正版） ===
/* =========================
   Emotion Result Save System v3
   功能：
   封閉圓形繪製完成後才能儲存
   自動依序覆蓋週一～週日
   成功儲存後自動滑動到每週地圖區域
========================= */

// 🔹 監控封閉圓形繪製完成
(function () {
  const oldDraw = window.drawClosedCircle;
  if (typeof oldDraw === "function") {
    window.drawClosedCircle = function (ctx, results, opts) {
      window.emotionCircleReady = false; // 鎖定儲存
      const res = oldDraw.apply(this, arguments);

      // 🔸 監測畫面穩定來判斷繪製完成
      let lastData = ctx.canvas.toDataURL();
      let stableCount = 0;
      const watcher = setInterval(() => {
        const newData = ctx.canvas.toDataURL();
        if (newData === lastData) {
          stableCount++;
        } else {
          stableCount = 0;
          lastData = newData;
        }
        if (stableCount > 10) { // 約 500ms 無變動
          clearInterval(watcher);
          window.emotionCircleReady = true;
          console.log("✅ Emotion circle drawing finished (stabilized).");
        }
      }, 50);

      return res;
    };
  } else {
    console.warn("⚠️ drawClosedCircle not found when hooking finish event");
  }
})();

// === 儲存按鈕 ===
const saveTodayBtn = document.querySelector('.right-panel .buttons button:first-child');

if (saveTodayBtn) {
  saveTodayBtn.addEventListener('click', () => {
    //  檢查是否完成繪製
    if (!window.emotionCircleReady) {
      alert("⚠️ 圖形尚未繪製完成，請稍候再儲存！");
      return;
    }

    //  週一～週日自動輪替
    const lastDay = parseInt(localStorage.getItem('lastSavedDay') || "0", 10);
    let nextDay = lastDay + 1;
    if (nextDay > 7) nextDay = 1;
    localStorage.setItem('lastSavedDay', nextDay);

    // 找到封閉圓形 canvas
    let emotionCanvas = document.querySelector('canvas[id*="circle"], canvas[id*="emotion"]');
    if (!emotionCanvas) {
      const canvases = document.querySelectorAll('canvas');
      emotionCanvas = canvases[canvases.length - 1];
    }
    if (!emotionCanvas) {
      alert("❌ 找不到情感封閉圓形圖畫布！");
      return;
    }

    //  擷取圖像
    const imgData = emotionCanvas.toDataURL("image/png");

    // === 抓取點位置（更穩健） & 同步儲存到 weekData ===

let rightDots = Array.from(document.querySelectorAll('.right-panel .dot'));
if (!rightDots || rightDots.length === 0) {
  // fallback: 找 id dot1..dot5
  rightDots = [];
  for (let i = 1; i <= 5; i++) {
    const d = document.getElementById(`dot${i}`);
    if (d) rightDots.push(d);
  }
}
// 最終 fallback: 找所有 .analysis-result .dot（你原先用的）
if (rightDots.length === 0) {
  rightDots = Array.from(document.querySelectorAll('.analysis-result .dot'));
}

// 如果還是 0，給使用者提示並停止
if (rightDots.length === 0) {
  console.warn('找不到右側情緒條的 .dot（dot1..dot5）——請確認 HTML id/class 是否正確');
  // 仍然繼續，但用預設 50%
}

// 讀取 left 值，並轉成百分比（如果是 px，會相對父元素寬度換算）
const dotValues = rightDots.map(dot => {
  // 優先取 inline style
  let leftStr = dot.style.left;
  if (!leftStr) {
    // fallback 取 computed style
    leftStr = window.getComputedStyle(dot).left;
  }
  // 若是空或 'auto'，回傳 50
  if (!leftStr || leftStr === 'auto') return 0;

  // leftStr 可能是 '50%' 或 '123px'
  leftStr = leftStr.trim();

  if (leftStr.endsWith('%')) {
    const v = parseFloat(leftStr);
    return isNaN(v) ? 50 : v;
  } else if (leftStr.endsWith('px')) {
    // 轉成相對父元素的百分比
    const px = parseFloat(leftStr);
    const parent = dot.parentElement; // 應該是 .line-bar
    const parentW = parent ? parent.getBoundingClientRect().width : null;
    if (parentW && parentW > 0) {
      const pct = (px / parentW) * 100;
      return Math.max(0, Math.min(100, Math.round(pct*100)/100)); // 保留兩位小數
    }
    return 50;
  } else {
    // 可能只有數字，當成百分比
    const v = parseFloat(leftStr);
    return isNaN(v) ? 50 : v;
  }
});

// === 確保使用 nextDay（你先前的輪替 day）來儲存（不要跟 getDay 混用） ===
// 假設 nextDay 變數已由上方程式計算（1..7）
let weekData = JSON.parse(localStorage.getItem('weekData') || '{}');
weekData[`day${nextDay}`] = {
  img: imgData,    // 上方你已有 imgData
  dots: dotValues
};
localStorage.setItem('weekData', JSON.stringify(weekData));

// === 更新每週 view（把值同步到下方 dot{day}-{i}） ===
dotValues.forEach((val, idx) => {
  const id = `dot${nextDay}-${idx + 1}`;
  const target = document.getElementById(id);
  if (target) target.style.left = `${val}%`;
});


    //  更新頁面預覽圖
    const imgEl = document.getElementById(`day${nextDay}`);
    if (imgEl) imgEl.src = imgData;

    dotValues.forEach((val, idx) => {
      const dotEl = document.getElementById(`dot${nextDay}-${idx + 1}`);
      if (dotEl) dotEl.style.left = `${val}%`;
    });

    
    // 提示成功
    alert(`✅ 已儲存今天聲音地圖到第 ${nextDay} 天囉！`);

    // 繪圖狀態鎖定（避免連按）
    window.emotionCircleReady = false;

    //  自動滑動到每週地圖區域
    const weekMap = document.querySelector('#weekmap, .week-map, .weekly-section');
    if (weekMap) {
      weekMap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// === 頁面載入時載入週資料 ===
window.addEventListener('load', () => {
  const weekData = JSON.parse(localStorage.getItem('weekData') || '{}');
  Object.keys(weekData).forEach(key => {
    const dayNum = key.replace('day', '');
    const { img, dots } = weekData[key];
    const imgEl = document.getElementById(`day${dayNum}`);
    if (imgEl) imgEl.src = img;
    dots.forEach((val, idx) => {
      const dotEl = document.getElementById(`dot${dayNum}-${idx + 1}`);
      if (dotEl) dotEl.style.left = `${val}%`;
    });
  });
});


/* =========================
   每週紀錄刷新（載入時清除並重置畫面）
   
   ========================= */
window.addEventListener("load", () => {
  // 清除儲存資料（使用你程式中實際使用的 keys）
  localStorage.removeItem("weekData");
  localStorage.removeItem("lastSavedDay");

  // 如果你還想保留其他 key，也可以選擇不刪除；此處只刪上述兩個。
  console.log("🔄 每週資料已清除（weekData, lastSavedDay）");

  // 同步重置畫面上的 day-card 圖片與 dot
  const defaultImg = "image/default.png";
  for (let day = 1; day <= 7; day++) {
    const imgEl = document.getElementById(`day${day}`);
    if (imgEl) imgEl.src = defaultImg;

    // 重置五個 dot（dot{day}-{idx}）
    for (let idx = 1; idx <= 5; idx++) {
      const dotEl = document.getElementById(`dot${day}-${idx}`);
      if (dotEl) dotEl.style.left = "50%";
    }
  }
});


/* =========================
   初始化預設圖片（避免出現失效 icon）
   ========================= */
window.addEventListener("load", () => {
  const weekData = JSON.parse(localStorage.getItem("weekData") || "{}");
  const defaultImg = "../image/miomo_img.png"; //  圖片放這

  for (let day = 1; day <= 7; day++) {
    const imgEl = document.getElementById(`day${day}`);
    if (!imgEl) continue;

     // 固定圖片尺寸（依你實際 UI 調整）
    imgEl.style.width = "100%";
    imgEl.style.height = "100%";
    imgEl.style.objectFit = "cover"; // 保持比例、不變形

    // 如果該天沒有儲存過資料，或是 weekData 中沒有該天資料，就設為預設圖
    if (!weekData[`day${day}`] || !weekData[`day${day}`].img) {
      imgEl.src = defaultImg;
    }
  }
});

