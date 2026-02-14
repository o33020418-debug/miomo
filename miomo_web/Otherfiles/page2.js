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


  const weeklyBtn = document.getElementById('weeklyBtn') || document.querySelector('.right-panel .buttons button:nth-child(2)');
  if (weeklyBtn && weeklySection) {
    weeklyBtn.addEventListener('click', e => {
      e.preventDefault();
      weeklySection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 本月回顧按鈕
  const monthlySection = document.getElementById('monthly');
  const monthlyBtn = document.getElementById('monthlyBtn');
  if (monthlyBtn && monthlySection) {
    monthlyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      monthlySection.scrollIntoView({ behavior: 'smooth' });
    });
  }

}



/* =========================
   Session-only Store（刷新就清空，不做持久化）
  
========================= */
const __MIOMO_SESSION = {
  lastSavedDay: 0,
  weekData: {},          
  dailyAnalysisRecords: [] 
};

function _sessionReset() {
  __MIOMO_SESSION.lastSavedDay = 0;
  __MIOMO_SESSION.weekData = {};
  __MIOMO_SESSION.dailyAnalysisRecords = [];

 
  try {
    localStorage.removeItem('lastSavedDay');
    localStorage.removeItem('weekData');
    localStorage.removeItem('dailyAnalysisRecords');
  } catch (e) {}
}

function _sessionGetLastSavedDay() { return Number(__MIOMO_SESSION.lastSavedDay || 0); }
function _sessionSetLastSavedDay(v) { __MIOMO_SESSION.lastSavedDay = Number(v) || 0; }

function _sessionGetWeekData() { return __MIOMO_SESSION.weekData || {}; }
function _sessionSetWeekData(obj) { __MIOMO_SESSION.weekData = obj || {}; }

function _sessionGetDailyRecords() { return Array.isArray(__MIOMO_SESSION.dailyAnalysisRecords) ? __MIOMO_SESSION.dailyAnalysisRecords : []; }
function _sessionPushDailyRecord(rec) { __MIOMO_SESSION.dailyAnalysisRecords.push(rec); }


window.addEventListener('load', () => {
  _sessionReset();
  document.querySelectorAll('.day-title').forEach(el => el.classList.add('active'));
  handleScroll(); // 初始滾動動畫
  setupNav();     // nav 按鈕
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
      "excitedto_calm_1":[0.0,0.5,0.142,-0.091,0.284,-0.319,0.426,0.272,0.571,0.205,0.713,-0.386,0.855,-0.024,1.0,0.5],
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
   波形 Envelope
   ========================= */
function makeEnvelope(x, bins = 160){
  const n = x.length;
  if(!n) return Array.from({length: bins}, () => 0);
  const step = n / bins;
  const out = new Array(bins);
  for(let i=0;i<bins;i++){
    const a = Math.floor(i * step);
    const b = Math.floor((i+1) * step);
    let s = 0;
    let c = 0;
    for(let j=a; j<b && j<n; j++){
      const v = x[j];
      s += v*v;
      c++;
    }
    out[i] = c ? Math.sqrt(s/c) : 0; // RMS envelope
  }
  // 輕度平滑，讓線條更自然
  for(let k=0;k<2;k++){
    for(let i=1;i<bins-1;i++){
      out[i] = (out[i-1] + out[i] + out[i+1]) / 3;
    }
  }
  return out;
}



/* =========================
   特徵函式（v3.1）
   功能：計算 RMS、靜音比例、過零率、頻譜重心、時間上能量變化（CV）與峰值速率（peakps）、amax、crest 等
 
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


let currentAnimation = null;


function drawClosedCircle(ctx, segments, opts = {}) {
  

  if (currentAnimation) cancelAnimationFrame(currentAnimation);

  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const cx = cw / 2;
  const cy = ch / 2;

  const baseR = Math.min(cw, ch) / 4;
  const amp = baseR * 0.5;

  const showLabels = opts.showLabels ?? true;
  const labelOffset = opts.labelOffset ?? 26;

  const segs = Array.isArray(segments) && segments.length ? segments : [{ axis: 'balancedto_extreme', level: 3 }];

  // -------------- 曲線取樣 --------------
  const N = opts.N ?? 720;

  function evalWaveCurve(curve, t01) {
   
    if (!curve || curve.length < 4) return 0;
    if (t01 <= curve[0]) return curve[1];
    for (let i = 0; i < curve.length - 2; i += 2) {
      const t0 = curve[i], y0 = curve[i + 1];
      const t1 = curve[i + 2], y1 = curve[i + 3];
      if (t01 >= t0 && t01 <= t1) {
        const u = (t01 - t0) / ((t1 - t0) || 1);
        return y0 + (y1 - y0) * u;
      }
    }
    return curve[curve.length - 1];
  }

  const signature = Array.isArray(opts.signature) && opts.signature.length ? opts.signature : null;
  const sigLen = signature ? signature.length : 0;

  const cornerPow = (typeof opts.cornerPow === 'number' && isFinite(opts.cornerPow))
    ? opts.cornerPow
    : (typeof window.__lastCornerPow === 'number' ? window.__lastCornerPow : 1.0);

 
  const warp = (typeof opts.warp === 'number' && isFinite(opts.warp)) ? opts.warp : 0.38;

  const path = new Array(N);
  const midAngles = [];

  
  for (let s = 0; s < segs.length; s++) {
    const midT = (s + 0.5) / segs.length;
    const ang = midT * Math.PI * 2 - Math.PI / 2;
    midAngles.push(ang);
  }

  for (let i = 0; i < N; i++) {
    const t = i / N; // 0..1
    const segIndex = Math.min(segs.length - 1, Math.floor(t * segs.length));
    const localT = t * segs.length - segIndex;

    const seg = segs[segIndex] || segs[0];
    const curve = EmotionWaveLibrary.get(seg.axis, seg.level);
    let yBase = evalWaveCurve(curve, localT);

    
    let sig = 0;
    if (signature) {
      const idx = Math.min(sigLen - 1, Math.floor(t * sigLen));
      sig = signature[idx] || 0;
      
      sig = Math.sign(sig) * Math.pow(Math.abs(sig), Math.max(0.7, Math.min(1.8, cornerPow)));
    }

    const y = yBase + sig * warp;
    const ang = t * Math.PI * 2 - Math.PI / 2;

    const r = baseR + y * amp;
    path[i] = [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  }

  // -------------- 動畫繪製 --------------
  let progress = 0;
  const totalPoints = path.length;
  const step = Math.max(2, Math.floor(totalPoints / 120));

  // 開始繪製
  window.emotionCircleReady = false;

  function animate() {
    ctx.clearRect(0, 0, cw, ch);

    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);

    const end = Math.min(totalPoints - 1, progress);
    for (let i = 1; i <= end; i++) ctx.lineTo(path[i][0], path[i][1]);

    if (end >= totalPoints - 1) {
      ctx.closePath();
      window.emotionCircleReady = true;
    }

    ctx.stroke();

    // Labels
    if (showLabels) {
      ctx.save();
      ctx.font = "14px Arial";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let s = 0; s < segs.length; s++) {
        const seg = segs[s];
        const label = `${(seg.axis || "").replace("_", " ")} ${seg.level || ""}`.trim();

        const ang = midAngles[s];
        const x = cx + Math.cos(ang) * (baseR + amp + labelOffset);
        const y = cy + Math.sin(ang) * (baseR + amp + labelOffset);
        ctx.fillText(label, x, y);
      }
      ctx.restore();
    }

    progress += step;
    if (progress <= totalPoints + 2) currentAnimation = requestAnimationFrame(animate);
  }

  currentAnimation = requestAnimationFrame(animate);
}

// =========================
// Signature helpers
// =========================
function _avg(arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / Math.max(1, arr.length);
}
function _std(arr, mean) {
  let v = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - mean;
    v += d * d;
  }
  return Math.sqrt(v / Math.max(1, arr.length));
}
function _resampleToN(src, N) {
  const a = Array.isArray(src) ? src : [];
  if (a.length < 2) return new Array(N).fill(0);
  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const idx = t * (a.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(a.length - 1, i0 + 1);
    const f = idx - i0;
    out[i] = a[i0] * (1 - f) + a[i1] * f;
  }
  return out;
}
function _rmsEnvelope(samples, sr, bins = 180) {
  // 用整段音訊
  const n = samples.length;
  if (!n) return new Array(bins).fill(0);
  const hop = Math.max(1, Math.floor(n / bins));
  const win = Math.max(16, hop);
  const out = new Array(bins);
  for (let b = 0; b < bins; b++) {
    const start = b * hop;
    const end = Math.min(n, start + win);
    let sum = 0;
    for (let i = start; i < end; i++) {
      const x = samples[i];
      sum += x * x;
    }
    out[b] = Math.sqrt(sum / Math.max(1, end - start));
  }
  return out;
}
function _lowpassFourier(signal, K) {
  // 低頻諧波重建
  const N = signal.length;
  const a0 = _avg(signal) * 2;

  const a = new Array(K + 1).fill(0);
  const b = new Array(K + 1).fill(0);

  for (let k = 1; k <= K; k++) {
    let sc = 0, ss = 0;
    for (let i = 0; i < N; i++) {
      const ang = 2 * Math.PI * k * i / N;
      sc += signal[i] * Math.cos(ang);
      ss += signal[i] * Math.sin(ang);
    }
    a[k] = (2 / N) * sc;
    b[k] = (2 / N) * ss;
  }

  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    let y = a0 / 2;
    for (let k = 1; k <= K; k++) {
      const ang = 2 * Math.PI * k * i / N;
      y += a[k] * Math.cos(ang) + b[k] * Math.sin(ang);
    }
    out[i] = y;
  }
  return out;
}
function _signatureFromDots(dots, bins = 180) {
  const v = (Array.isArray(dots) ? dots : [50,50,50,50,50]).map(x => (Number(x) || 0) / 100);
  const anchors = [0, 0.25, 0.5, 0.75, 1].map((t, i) => ({ t, v: v[i] ?? 0.5 }));
  const out = new Array(bins);
  for (let i = 0; i < bins; i++) {
    const t = i / (bins - 1);
    let a = anchors[0], b = anchors[anchors.length - 1];
    for (let k = 0; k < anchors.length - 1; k++) {
      if (t >= anchors[k].t && t <= anchors[k + 1].t) { a = anchors[k]; b = anchors[k + 1]; break; }
    }
    const u = (t - a.t) / ((b.t - a.t) || 1);
    out[i] = a.v + (b.v - a.v) * u;
  }
  return out;
}
function computeAudioSignature(samples, sr, N = 720) {
  const env = _rmsEnvelope(samples, sr, 180);

  const mean = _avg(env);
  const sd = _std(env, mean) || 1e-6;

  // roughness能量起伏變化率
  let rough = 0;
  for (let i = 1; i < env.length; i++) rough += Math.abs(env[i] - env[i - 1]);
  rough = rough / Math.max(1, env.length - 1);
  rough = rough / (mean + 1e-6); // normalize

  // brightness proxy：用波形差分衡量
  let absSum = 0, diffSum = 0;
  for (let i = 1; i < samples.length; i++) {
    const x = samples[i];
    absSum += Math.abs(x);
    diffSum += Math.abs(samples[i] - samples[i - 1]);
  }
  const bright = diffSum / (absSum + 1e-6);

  
  let centered = env.map(v => (v - mean) / sd);
  centered = centered.map(v => Math.tanh(v * 0.7)); // clamp to ~[-1,1]

  
  const sigN = _resampleToN(centered, N);

  
  const K = Math.max(6, Math.min(18, Math.round(7 + rough * 10 + bright * 8)));
  let low = _lowpassFourier(sigN, K);

 
  const cornerPow = Math.max(0.85, Math.min(1.35, 0.95 + rough * 0.55 + bright * 0.25));
  low = low.map(v => Math.sign(v) * Math.pow(Math.abs(v), cornerPow));

  
  const sig180 = _resampleToN(low, 180);

  return { envelope180: env, signature720: low, signature180: sig180, cornerPow, K };
}
/* =========================
   UI 綁定：按鈕行為

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
    if (currentAnimation) cancelAnimationFrame(currentAnimation);
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    if ($log) $log.textContent = '⏳ 解碼中…';

   
    const segSec = $segSec ? Math.max(2, Math.min(30, parseInt($segSec.value) || 8)) : 8;
// 解碼音檔
    const { data, sr } = await decode(file);
    
    try {
      window.__lastEnvelope = makeEnvelope(data, 220);
    } catch (e) {
      window.__lastEnvelope = null;
    }

    if ($log) $log.textContent = '⏳ 分段與分析中…';

    // 切段並分析每段
    const segs = splitSegments(data, sr, segSec);
    const useSegs = segs.length ? segs : [data];
    const results = [];
    let lines = [];

    for (let i = 0; i < useSegs.length; i++) {
      const f = extractFeatures(useSegs[i], sr);
      const cls = classifySegment(f);
      const env = makeEnvelope(useSegs[i], 160);
      results.push({ axis: cls.axis, level: cls.level, env });
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


const balancedResults = allAxes.map(axis => {
  const lvArr = axisMap[axis] || [];
  const avg = lvArr.length ? (lvArr.reduce((a,b)=>a+b,0) / lvArr.length) : 3;
  const level = Math.max(1, Math.min(5, Math.round(avg)));

 
  const envs = results.filter(r => r.axis === axis && Array.isArray(r.env));
  let env = null;
  if (envs.length) {
    const bins = envs[0].env.length || 160;
    env = new Array(bins).fill(0);
    envs.forEach(r => {
      for (let i=0;i<bins;i++) env[i] += (r.env[i] || 0);
    });
    for (let i=0;i<bins;i++) env[i] /= envs.length;
  } else {
    env = new Array(160).fill(0);
  }

  return { axis, level, env };
});


results.splice(0, results.length, ...balancedResults);


   
    let envMax = 0;
    for (const r of results) {
      if (!r.env) continue;
      for (const v of r.env) if (v > envMax) envMax = v;
    }
    if (envMax > 0) {
      for (const r of results) {
        if (!r.env) continue;
        r.env = r.env.map(v => v / envMax);
      }
    }

    // 畫圖與更新 log
    drawClosedCircle(ctx, results, { showLabels: true });
    if ($log) $log.textContent = `Segments: ${results.length}（切段=${segSec}s）\n` +
      results.map((r, i) => `${i + 1}. ${r.axis}_${r.level}`).join('\n') +
      '\n\n' +
      lines.join('\n');
  } catch (err) {
    console.error(err);
    if ($log) $log.textContent = '❌ 發生錯誤：' + (err && err.message ? err.message : String(err));
  }
};


/* =========================
   Emotion UI Sync
   功用：分析結果生成後，連動更新右側能量條與左側情緒軸
========================= */

let __emotionCardDefaults = null;

/** 取得每張字卡的原始 */
function _captureEmotionCardDefaults() {
  if (__emotionCardDefaults) return __emotionCardDefaults;
  const cards = Array.from(document.querySelectorAll('.right-panel .analysis-card'));
  __emotionCardDefaults = cards.map(card => {
    const t = card.querySelector('.emotion-title');
    const p = card.querySelector('.analysis-text');
    return {
      title: t ? t.textContent : '',
      text: p ? p.textContent : ''
    };
  });
  return __emotionCardDefaults;
}

const EMOTION_CARD_COPY = {
  excitedto_calm: {
    left:  { title: "激動", text: "你的聲音偏向激動：能量上揚、情緒較興奮或緊繃，像在加速向前。"},
    right: { title: "安心", text: "你的聲音偏向安心：節奏更穩、呼吸更放鬆，整體更平靜、柔和。"}
  },
  clearto_confused: {
    left:  { title: "清醒", text: "你的聲音偏向清醒：語氣更有方向感、穩定而清楚，像把思緒收束起來。"},
    right: { title: "混亂", text: "你的聲音偏向混亂：節奏與力道較不一致，像思緒在跳躍、情緒有點躁動。"}
  },
  satisfiedto_yearning: {
    left:  { title: "滿足", text: "你的聲音偏向滿足：聲線溫暖、柔和，有一種「剛剛好」的安定感。"},
    right: { title: "渴望", text: "你的聲音偏向渴望：帶著期待與追尋感，語氣像在伸手接近某個目標。"}
  },
  energeticto_depressed: {
    left:  { title: "高亢", text: "你的聲音偏向高亢：亮度更高、衝擊力更強，像情緒在發光。"},
    right: { title: "低落", text: "你的聲音偏向低落：音色更沉、更收斂，像把情緒往內放。"}
  },
  balancedto_extreme: {
    left:  { title: "均衡", text: "你的聲音偏向均衡：起伏自然、表現穩定，情緒沒有大幅拉扯。"},
    right: { title: "極端", text: "你的聲音偏向極端：變化更劇烈、對比更強，情緒張力拉滿。"}
  }
};

function syncEmotionUI(results) {
  if (!Array.isArray(results) || !results.length) return;

  const defaults = _captureEmotionCardDefaults();

  const axes = [
    "excitedto_calm",
    "clearto_confused",
    "satisfiedto_yearning",
    "energeticto_depressed",
    "balancedto_extreme"
  ];

  // 重置
  axes.forEach((_, i) => {
    const idx = i + 1;
    const bigBar = document.getElementById(`bigbar${idx}`);
    const tooltip = document.getElementById(`tooltip${idx}`);
    const dot = document.getElementById(`dot${idx}`);
    if (bigBar) bigBar.style.width = `0%`;
    if (tooltip) {
      tooltip.textContent = `0%`;
      tooltip.style.left = `0%`;
    }
    if (dot) dot.style.left = `50%`;
    const card = bigBar ? bigBar.closest('.analysis-card') : null;
    if (card) {
      card.style.display = ''; 
     
      const t = card.querySelector('.emotion-title');
      const p = card.querySelector('.analysis-text');
      if (t && defaults[i]) t.textContent = defaults[i].title;
      if (p && defaults[i]) p.textContent = defaults[i].text;
    }
  });

 
  const levels = {};
  axes.forEach(axis => (levels[axis] = []));
  results.forEach(r => {
    if (r && levels[r.axis]) levels[r.axis].push(Number(r.level) || 0);
  });

  
  const NEUTRAL_BAND = 7; 
  axes.forEach((axis, i) => {
    const idx = i + 1;
    const lv = levels[axis];

    const bigBar = document.getElementById(`bigbar${idx}`);
    const tooltip = document.getElementById(`tooltip${idx}`);
    const dot = document.getElementById(`dot${idx}`);
    const card = bigBar ? bigBar.closest('.analysis-card') : null;

    if (!lv.length) {
     
      if (card) card.style.display = 'none';
      return;
    }

    // 轉百分比
    const avg = lv.reduce((a, b) => a + b, 0) / lv.length;
    const percent = Math.max(0, Math.min(100, ((avg - 1) / 4) * 100));

    // 更新右側大條
    if (bigBar) bigBar.style.width = `${percent}%`;
    if (tooltip) {
      tooltip.textContent = `${Math.round(percent)}%`;
      tooltip.style.left = `${percent}%`;
    }

    // 更新左側小圓點
    if (dot) dot.style.left = `${percent}%`;

    // 更新字卡標題/敘述
    if (card) {
      const t = card.querySelector('.emotion-title');
      const p = card.querySelector('.analysis-text');

      if (Math.abs(percent - 50) <= NEUTRAL_BAND) {
        // 中性：維持原本雙向文案
        return;
      }

      const side = percent < 50 ? 'left' : 'right';
      const copy = EMOTION_CARD_COPY[axis] && EMOTION_CARD_COPY[axis][side];
      if (copy) {
        if (t) t.textContent = copy.title;
        if (p) p.textContent = copy.text;
      }
    }
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
        // 只在「今日聲音地圖」canvas 繪製完成後同步右側情緒 UI
        if (!ctx || !ctx.canvas || ctx.canvas.id !== 'canvas') return res;
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
    return; 
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
    
    const sigPack = computeAudioSignature(data, sr, 720);
    window.__lastEnvelope = sigPack.envelope180;
    window.__lastSignature = sigPack.signature720;
    window.__lastSignature180 = sigPack.signature180;
    window.__lastCornerPow = sigPack.cornerPow;
    window.__lastHarmonicsK = sigPack.K;

    
    try {
      const counts = {};
      for (const r of results) {
        const key = `${r.axis}_${r.level}`;
        counts[key] = (counts[key] || 0) + 1;
      }
      let bestKey = Object.keys(counts)[0];
      for (const k of Object.keys(counts)) if (counts[k] > counts[bestKey]) bestKey = k;
      if (bestKey) {
        const [ax, lv] = bestKey.split('_');
        window.__lastAxis = ax;
        window.__lastLevel = Number(lv) || 3;
      }
    } catch {}

    


    try{


      window.__lastResults = Array.isArray(results) ? results.map(r => ({...r})) : null;


      window.__lastSignature720 = Array.isArray(sigPack.signature720) ? sigPack.signature720.slice() : null;


      window.__lastWarp = 0.38;


    }catch(e){}


    drawClosedCircle(ctx, results, { signature: sigPack.signature720, cornerPow: sigPack.cornerPow, warp: 0.38 });
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



/* =========================
   Emotion Result Save System v3
 
========================= */

// 監控封閉圓形繪製完成
(function () {
  const oldDraw = window.drawClosedCircle;
  if (typeof oldDraw === "function") {
    window.drawClosedCircle = function (ctx, results, opts) {
      window.emotionCircleReady = false; // 鎖定儲存
      const res = oldDraw.apply(this, arguments);

      // 監測畫面穩定來判斷繪製完成
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
        if (stableCount > 10) { // 500ms 
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
const saveTodayBtn = document.getElementById('saveBtn') || document.querySelector('.right-panel .buttons button:first-child');

if (saveTodayBtn) {
  saveTodayBtn.addEventListener('click', () => {
    //  檢查是否完成繪製
    if (!window.emotionCircleReady) {
      alert("⚠️ 圖形尚未繪製完成，請稍候再儲存！");
      return;
    }

    //  週一～週日自動輪替
    const lastDay = _sessionGetLastSavedDay();
    let nextDay = lastDay + 1;
    if (nextDay > 7) nextDay = 1;
    _sessionSetLastSavedDay(nextDay);

    // 找到封閉圓形 canvas
    let emotionCanvas = document.getElementById('canvas') || document.querySelector('canvas[id*="circle"], canvas[id*="emotion"]');
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

    // === 抓取點位置 & 同步儲存到 weekData ===

let rightDots = Array.from(document.querySelectorAll('.right-panel .dot'));
if (!rightDots || rightDots.length === 0) {
  
  rightDots = [];
  for (let i = 1; i <= 5; i++) {
    const d = document.getElementById(`dot${i}`);
    if (d) rightDots.push(d);
  }
}

if (rightDots.length === 0) {
  rightDots = Array.from(document.querySelectorAll('.analysis-result .dot'));
}


if (rightDots.length === 0) {
  console.warn('找不到右側情緒條的 .dot（dot1..dot5）——請確認 HTML id/class 是否正確');
 
}


const dotValues = rightDots.map(dot => {
  
  let leftStr = dot.style.left;
  if (!leftStr) {
  
    leftStr = window.getComputedStyle(dot).left;
  }
 
  if (!leftStr || leftStr === 'auto') return 0;

  
  leftStr = leftStr.trim();

  if (leftStr.endsWith('%')) {
    const v = parseFloat(leftStr);
    return isNaN(v) ? 50 : v;
  } else if (leftStr.endsWith('px')) {
  
    const px = parseFloat(leftStr);
    const parent = dot.parentElement; 
    const parentW = parent ? parent.getBoundingClientRect().width : null;
    if (parentW && parentW > 0) {
      const pct = (px / parentW) * 100;
      return Math.max(0, Math.min(100, Math.round(pct*100)/100)); 
    }
    return 50;
  } else {
   
    const v = parseFloat(leftStr);
    return isNaN(v) ? 50 : v;
  }
});

let weekData = { ..._sessionGetWeekData() };
weekData[`day${nextDay}`] = {
  img: imgData,    
  dots: dotValues
};
_sessionSetWeekData(weekData);


try {
  const now = new Date();
  const dateKey = getLocalISODate(now); 
  const ts = Date.now();

  const rec = {
    id: `${dateKey}_${ts}`,
    date: dateKey,
    ts,
    img: imgData,
    dots: dotValues,

  
    envelope: Array.isArray(window.__lastEnvelope) ? window.__lastEnvelope : null,
    signature: Array.isArray(window.__lastSignature180) ? window.__lastSignature180 : null,

   
    signature720: Array.isArray(window.__lastSignature720) ? window.__lastSignature720.slice() : null,
    segments: Array.isArray(window.__lastResults) ? window.__lastResults.map(r => ({...r})) : null,
    warp: (typeof window.__lastWarp === 'number' ? window.__lastWarp : null),

    
    axis: (typeof window.__lastAxis === 'string' ? window.__lastAxis : null),
    level: (typeof window.__lastLevel === 'number' ? window.__lastLevel : null),
    cornerPow: (typeof window.__lastCornerPow === 'number' ? window.__lastCornerPow : null),
    harmonicsK: (typeof window.__lastHarmonicsK === 'number' ? window.__lastHarmonicsK : null),
  };

  const arr = _sessionGetDailyRecords();

  
  arr.push(rec);

  
  arr.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const MAX_KEEP = 240;
  if (arr.length > MAX_KEEP) arr.splice(0, arr.length - MAX_KEEP);

 
  window.__monthlyDirty = true;

} catch (e) {
  console.warn('dailyAnalysisRecords save failed:', e);
}


    //  更新頁面預覽圖
    const imgEl = document.getElementById(`day${nextDay}`);
    if (imgEl) imgEl.src = imgData;

    dotValues.forEach((val, idx) => {
      const dotEl = document.getElementById(`dot${nextDay}-${idx + 1}`);
      if (dotEl) dotEl.style.left = `${val}%`;
    });

    
    // 提示成功
    alert(`✅ 已儲存今天聲音地圖到第 ${nextDay} 天囉！`);

    
    window.__monthlyDirty = true;// 繪圖狀態鎖定
    window.emotionCircleReady = false;

    //  自動滑動到每週地圖區域
    const weekMap = document.querySelector('#weekmap, .week-map, .weekly-section');
    if (weekMap) {
      weekMap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}


/* =========================
   Monthly Review（本月回顧）- 重新校正版本
 
========================= */

window.__monthlyDirty = true;

function getLocalISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function getCurrentMonthPrefix(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function _clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

function _modeAxisLevel(records) {
  const map = {};
  for (const r of records) {
    if (!r || !r.axis) continue;
    const key = `${r.axis}_${r.level || 3}`;
    map[key] = (map[key] || 0) + 1;
  }
  const keys = Object.keys(map);
  if (!keys.length) return { axis: 'balancedto_extreme', level: 3 };
  let best = keys[0];
  for (const k of keys) if (map[k] > map[best]) best = k;
  const [axis, lvl] = best.split('_');
  return { axis, level: Number(lvl) || 3 };
}

/* =========================
   Monthly Stitch（分段拼接版）
   ========================= */
function _selectMonthlyStitchRecords(monthRecords){
  
  const records = Array.isArray(monthRecords) ? monthRecords : [];

  const weekData = _sessionGetWeekData();
  const ordered = [];
  let hasAny = false;

  for (let d = 1; d <= 7; d++) {
    const wd = weekData[`day${d}`];
    if (!wd) continue;
    // weekData 會存 {img,dots, record}
    if (wd.record && (Array.isArray(wd.record.signature) || Array.isArray(wd.record.envelope))) {
      hasAny = true;
      ordered.push(wd.record);
    } else if (wd.img && typeof wd.img === 'string') {
     
      const found = records.slice().reverse().find(r => r && r.img === wd.img);
      if (found) { hasAny = true; ordered.push(found); }
    }
  }
  if (hasAny && ordered.length) return ordered;


  
  const arr = records
    .filter(r => r && (Array.isArray(r.signature) || Array.isArray(r.envelope)))
    .slice()
    .sort((a,b) => (a.ts||0) - (b.ts||0));
  return arr.slice(-Math.min(7, arr.length));
}

function _combineMonthlySignature(records, N = 720) {
  

  const picked = _selectMonthlyStitchRecords(records);
  const use = picked.length ? picked : (Array.isArray(records) ? records : []);
  const n = use.length;
  if (!n) return new Array(N).fill(0);

 
  if (n === 1) {
    const r = use[0] || {};
    const s = (Array.isArray(r.signature) && r.signature.length)
      ? r.signature
      : ((Array.isArray(r.signature720) && r.signature720.length) ? _resampleToN(r.signature720, 180) : null);
    if (!s) return new Array(N).fill(0);
   
    return _resampleToN(s, N);
  }

 
  const prepared = use.map((r) => {
    let s =
      (r && Array.isArray(r.signature) && r.signature.length) ? r.signature.slice() :
      (r && Array.isArray(r.signature720) && r.signature720.length) ? _resampleToN(r.signature720, 180) :
      null;

   
    if (!s && r && Array.isArray(r.envelope) && r.envelope.length > 3) {
      const env = r.envelope;
      const mean = _avg(env);
      const sd = _std(env, mean) || 1e-6;
      let centered = env.map(v => (v - mean) / sd);
      centered = centered.map(v => Math.tanh(v * 0.7));
      s = _resampleToN(centered, 180);
    }

    if (!s) s = new Array(180).fill(0);

  
    const cp = (typeof r?.cornerPow === 'number' && isFinite(r.cornerPow)) ? _clamp(r.cornerPow, 0.6, 1.9) : 1.05;

   
    let t = s.map(v => Math.sign(v) * Math.pow(Math.abs(v), cp));

    
    const absMean = (_avg(t.map(v => Math.abs(v))) || 1e-6);
    let rough = 0;
    for (let i = 1; i < t.length; i++) rough += Math.abs(t[i] - t[i - 1]);
    rough = (rough / (t.length - 1)) / absMean; // normalize
    const gain = _clamp(0.85 + (rough - 1.0) * 0.28, 0.70, 1.35);
    t = t.map(v => Math.tanh(v * gain * 1.15));

    return t;
  });

  const out = new Array(N).fill(0);
  const segStarts = [];
  const segEnds = [];
  let cursor = 0;

  for (let i = 0; i < n; i++) {
  
    const start = cursor;
    const end = (i === n - 1) ? N : (start + Math.floor(N / n));
    cursor = end;

    segStarts.push(start);
    segEnds.push(end);

    const segLen = Math.max(2, end - start);
    const seg = _resampleToN(prepared[i], segLen); 

    for (let j = 0; j < segLen; j++) out[start + j] = seg[j];
  }

 
  const baseOut = out.slice();
  const bw = Math.max(2, Math.floor(N * 0.006)); 
  for (let i = 0; i < n; i++) {
    const seam = segEnds[i] % N;             
    const leftStart = (seam - bw + N) % N;   

    for (let k = 0; k < bw; k++) {
      const idxL = (leftStart + k) % N;       // 左側點
      const idxR = (seam + k) % N;            // 右側點
      const t = (k + 1) / (bw + 1);
      out[idxL] = baseOut[idxL] * (1 - t) + baseOut[idxR] * t;
    }
  }

  return out;
}

function renderMonthlyReview({ animate = true } = {}) {
  const canvas = document.getElementById('monthlyCanvas');
  const noteEl = document.getElementById('monthlyNote');
  const emptyEl = document.getElementById('monthlyEmpty');
  const wrapEl = document.getElementById('monthlyCanvasWrap');
  const emptyBtn = document.getElementById('monthlyEmptyBtn');

  // 空狀態按鈕回到每週紀錄
  if (emptyBtn && !emptyBtn.__bound) {
    emptyBtn.__bound = true;
    emptyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const weekly = document.getElementById('weekly');
      if (weekly) weekly.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let records = _sessionGetDailyRecords().slice().sort((a,b)=>(a.ts||0)-(b.ts||0));

  
  const monthRecords = records;
  if (!monthRecords.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    if (wrapEl) wrapEl.style.display = 'none';
    if (noteEl) noteEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = '';
   
    if (typeof __monthlyAddonOnEmpty === 'function') __monthlyAddonOnEmpty();
    window.__monthlyDirty = false;
    return;
  }

  
  if (wrapEl) wrapEl.style.display = '';
  if (noteEl) noteEl.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';

  
  const parts = _selectMonthlyStitchRecords(monthRecords);
  const used = parts.length ? parts : monthRecords;

 
  if (used.length === 1) {
    const r = used[0] || {};

   
    const onlyDate = r?.date || monthRecords[0]?.date || '';
    if (noteEl) {
      noteEl.textContent = onlyDate
        ? `本月目前只有 1 天資料（${onlyDate}），顯示該日聲音地圖。`
        : '本月目前只有 1 天資料，顯示該日聲音地圖。';
    }

    
    if (typeof __monthlyAddonAfterRender === 'function') {
      __monthlyAddonAfterRender({ allRecords: monthRecords, usedRecords: used });
    }

    
    const imgSrc = (r && typeof r.img === 'string') ? r.img : '';
    if (imgSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const cw = canvas.width, ch = canvas.height;
          const iw = img.naturalWidth || img.width || cw;
          const ih = img.naturalHeight || img.height || ch;

       
          const scale = Math.min(cw / iw, ch / ih);
          const dw = iw * scale;
          const dh = ih * scale;
          const dx = (cw - dw) / 2;
          const dy = (ch - dh) / 2;

          ctx.drawImage(img, dx, dy, dw, dh);
        } catch (e) {
          console.warn('monthly single img draw failed:', e);
        }
        window.__monthlyDirty = false;
      };
      img.onerror = () => {
     
        try {
          const segs = (Array.isArray(r.segments) && r.segments.length)
            ? r.segments
            : (r.axis ? [{ axis: r.axis, level: (typeof r.level === 'number' ? r.level : 3) }] : [{ axis: 'balancedto_extreme', level: 3 }]);

          const sig = (Array.isArray(r.signature720) && r.signature720.length)
            ? r.signature720
            : ((Array.isArray(r.signature) && r.signature.length) ? _resampleToN(r.signature, 720) : _combineMonthlySignature([r], 720));

          const cp = (typeof r.cornerPow === 'number' && isFinite(r.cornerPow)) ? r.cornerPow : 1.05;
          const w  = (typeof r.warp === 'number' && isFinite(r.warp)) ? r.warp : 0.38;

          drawClosedCircle(ctx, segs, {
            signature: sig,
            cornerPow: cp,
            warp: w,
            showLabels: true,
            N: 720
          });
        } catch (e) {}
        window.__monthlyDirty = false;
      };
      img.src = imgSrc;

      
      return;
    }

    
    try {
      const segs = (Array.isArray(r.segments) && r.segments.length)
        ? r.segments
        : (r.axis ? [{ axis: r.axis, level: (typeof r.level === 'number' ? r.level : 3) }] : [{ axis: 'balancedto_extreme', level: 3 }]);

      const sig = (Array.isArray(r.signature720) && r.signature720.length)
        ? r.signature720
        : ((Array.isArray(r.signature) && r.signature.length) ? _resampleToN(r.signature, 720) : _combineMonthlySignature([r], 720));

      const cp = (typeof r.cornerPow === 'number' && isFinite(r.cornerPow)) ? r.cornerPow : 1.05;
      const w  = (typeof r.warp === 'number' && isFinite(r.warp)) ? r.warp : 0.38;

      drawClosedCircle(ctx, segs, {
        signature: sig,
        cornerPow: cp,
        warp: w,
        showLabels: true,
        N: 720
      });
    } catch (e) {}

    window.__monthlyDirty = false;
    return;
  }

const first = used[0]?.date || monthRecords[0].date;
  const last = used[used.length - 1]?.date || monthRecords[monthRecords.length - 1].date;
  if (noteEl) noteEl.textContent = `已合成 ${used.length} 天資料（${first} ～ ${last}），以分段擷取拼接生成。`;

  const { axis, level } = _modeAxisLevel(used);
  const sig = _combineMonthlySignature(used, 720);

  drawClosedCircle(ctx, [{ axis, level }], {
    signature: sig,
    cornerPow: 1.0,    
    warp: 0.48,          
    showLabels: false,
    N: 720
  });

 
  if (typeof __monthlyAddonAfterRender === 'function') {
    __monthlyAddonAfterRender({ allRecords: monthRecords, usedRecords: used });
  }

  window.__monthlyDirty = false;
}


/* =========================================================
   Monthly Review Add-ons (ADD ONLY)
  
========================================================= */

let __MONTHLY_DRAW = {
  inited: false,
  enabled: false,
  baseCanvas: null,
  drawCanvas: null,
  dctx: null,
  toolbar: null,
  drawBtn: null,
  saveBtn: null,
  undoBtn: null,
  strokes: [],
  currentStroke: null,
  maxStrokes: 5,
  hintEl: null,
  storyCard: null,
  storyTitle: null,
  storyText: null,
  isDown: false,
  lastX: 0,
  lastY: 0,
  typeTimer: null
};

function __monthlyAddonInitOnce(){
  if (__MONTHLY_DRAW.inited) return;
  __MONTHLY_DRAW.inited = true;

  const base = document.getElementById('monthlyCanvas');
  const draw = document.getElementById('monthlyDrawCanvas');

  __MONTHLY_DRAW.baseCanvas = base;
  __MONTHLY_DRAW.drawCanvas = draw;

  __MONTHLY_DRAW.toolbar = document.getElementById('monthlyToolbar');
  __MONTHLY_DRAW.drawBtn = document.getElementById('monthlyDrawBtn');
  __MONTHLY_DRAW.saveBtn = document.getElementById('monthlySaveBtn');
  __MONTHLY_DRAW.undoBtn = document.getElementById('monthlyUndoBtn');
  __MONTHLY_DRAW.hintEl = document.getElementById('monthlyDrawHint');

  __MONTHLY_DRAW.storyCard = document.getElementById('monthlyStoryCard');
  __MONTHLY_DRAW.storyTitle = document.getElementById('monthlyStoryTitle');
  __MONTHLY_DRAW.storyText = document.getElementById('monthlyStoryText');

  if (!base || !draw) return;

  // 建立 2D context
  __MONTHLY_DRAW.dctx = draw.getContext('2d');
  if (__MONTHLY_DRAW.dctx){
    __MONTHLY_DRAW.dctx.strokeStyle = '#000';
    __MONTHLY_DRAW.dctx.lineWidth = 2.2;
    __MONTHLY_DRAW.dctx.lineCap = 'round';
    __MONTHLY_DRAW.dctx.lineJoin = 'round';
  }

  // 繪製按鈕
  if (__MONTHLY_DRAW.drawBtn && !__MONTHLY_DRAW.drawBtn.__bound){
    __MONTHLY_DRAW.drawBtn.__bound = true;
    __MONTHLY_DRAW.drawBtn.addEventListener('click', () => {
      __MONTHLY_DRAW.enabled = !__MONTHLY_DRAW.enabled;
      if (__MONTHLY_DRAW.drawCanvas){
        __MONTHLY_DRAW.drawCanvas.style.pointerEvents = __MONTHLY_DRAW.enabled ? 'auto' : 'none';
      }
      if (__MONTHLY_DRAW.hintEl){
        __MONTHLY_DRAW.hintEl.style.display = __MONTHLY_DRAW.enabled ? '' : 'none';
      }
      if (__MONTHLY_DRAW.drawBtn) __MONTHLY_DRAW.drawBtn.classList.toggle('is-on', __MONTHLY_DRAW.enabled);
      if (__MONTHLY_DRAW.undoBtn) __MONTHLY_DRAW.undoBtn.style.display = __MONTHLY_DRAW.enabled ? 'inline-block' : 'none';
    });
  }

  // 保存按鈕
  if (__MONTHLY_DRAW.saveBtn && !__MONTHLY_DRAW.saveBtn.__bound){
    __MONTHLY_DRAW.saveBtn.__bound = true;
    __MONTHLY_DRAW.saveBtn.addEventListener('click', () => {
      __monthlyAddonExportPNG();
    });
  }

  // 畫線事件（Pointer events）
  const dc = __MONTHLY_DRAW.drawCanvas;
  if (dc && !dc.__bound){
    dc.__bound = true;

    const getXY = (ev) => {
      const r = dc.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (dc.width / r.width);
      const y = (ev.clientY - r.top) * (dc.height / r.height);
      return { x, y };
    };

    dc.addEventListener('pointerdown', (ev) => {
      if (!__MONTHLY_DRAW.enabled) return;
      if (ev.button !== 0) return; // left button only
      dc.setPointerCapture(ev.pointerId);
      __MONTHLY_DRAW.isDown = true;
      const { x, y } = getXY(ev);
      __MONTHLY_DRAW.lastX = x;
      __MONTHLY_DRAW.lastY = y;

      const ctx = __MONTHLY_DRAW.dctx;
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.1, y + 0.1);
      ctx.stroke();
    });

    dc.addEventListener('pointermove', (ev) => {
      if (!__MONTHLY_DRAW.enabled || !__MONTHLY_DRAW.isDown) return;
      const ctx = __MONTHLY_DRAW.dctx;
      if (!ctx) return;

      const { x, y } = getXY(ev);
      ctx.lineTo(x, y);
      ctx.stroke();

      __MONTHLY_DRAW.lastX = x;
      __MONTHLY_DRAW.lastY = y;
    });

    const end = () => { __MONTHLY_DRAW.isDown = false; };
    dc.addEventListener('pointerup', end);
    dc.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
  }
}

function __monthlyAddonResizeOverlay(){
  const base = __MONTHLY_DRAW.baseCanvas;
  const draw = __MONTHLY_DRAW.drawCanvas;
  if (!base || !draw) return;


  if (draw.width !== base.width) draw.width = base.width;
  if (draw.height !== base.height) draw.height = base.height;

 
  const ctx = draw.getContext('2d');
  __MONTHLY_DRAW.dctx = ctx;
  if (ctx){
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
}

function __monthlyAddonClearDrawing(){
  const dc = __MONTHLY_DRAW.drawCanvas;
  const ctx = __MONTHLY_DRAW.dctx;
  if (!dc || !ctx) return;
  ctx.clearRect(0, 0, dc.width, dc.height);
}

function __monthlyAddonOnEmpty(){
  __monthlyAddonInitOnce();
  __monthlyAddonClearDrawing();
  if (__MONTHLY_DRAW.toolbar) __MONTHLY_DRAW.toolbar.style.display = 'none';
  if (__MONTHLY_DRAW.hintEl) __MONTHLY_DRAW.hintEl.style.display = 'none';
  if (__MONTHLY_DRAW.storyCard) __MONTHLY_DRAW.storyCard.style.display = 'none';
  __MONTHLY_DRAW.enabled = false;
  if (__MONTHLY_DRAW.drawBtn) __MONTHLY_DRAW.drawBtn.classList.remove('is-on');
  if (__MONTHLY_DRAW.undoBtn) __MONTHLY_DRAW.undoBtn.style.display = 'none';
  if (__MONTHLY_DRAW.drawCanvas) __MONTHLY_DRAW.drawCanvas.style.pointerEvents = 'none';
}

function __monthlyAddonAfterRender({ allRecords = [], usedRecords = [] } = {}){
  __monthlyAddonInitOnce();
  __monthlyAddonResizeOverlay();

 
  __monthlyAddonClearDrawing();

  // 顯示工具列
  if (__MONTHLY_DRAW.toolbar) __MONTHLY_DRAW.toolbar.style.display = '';
  if (__MONTHLY_DRAW.hintEl) __MONTHLY_DRAW.hintEl.style.display = 'none';
  __MONTHLY_DRAW.enabled = false;
  if (__MONTHLY_DRAW.drawCanvas) __MONTHLY_DRAW.drawCanvas.style.pointerEvents = 'none';

  // 生成情緒價值回饋
  const story = __monthlyAddonMakeStory(allRecords);
  if (__MONTHLY_DRAW.storyCard){
    __MONTHLY_DRAW.storyCard.style.display = '';
  }
  if (__MONTHLY_DRAW.storyTitle){
    __MONTHLY_DRAW.storyTitle.classList.add('active');
  }
  if (__MONTHLY_DRAW.storyText){
    __MONTHLY_DRAW.storyText.classList.add('active');
    __monthlyAddonTypeText(__MONTHLY_DRAW.storyText, story, 18);
  }
}

function __monthlyAddonSeededPick(seed, arr){
  if (!arr || !arr.length) return '';
  const n = arr.length;
  const i = Math.abs(seed) % n;
  return arr[i];
}

function __monthlyAddonHashNum(x){
  const s = String(x ?? '');
  let h = 2166136261;
  for (let i=0;i<s.length;i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function __monthlyAddonMakeStory(records){
 
  const AX = [
    { i: 0, left: "激動", right: "安心", key:"excited_calm" },
    { i: 1, left: "清醒", right: "混亂", key:"clear_confused" },
    { i: 2, left: "滿足", right: "渴望", key:"satisfied_yearning" },
    { i: 3, left: "高亢", right: "低落", key:"energetic_depressed" },
    { i: 4, left: "均衡", right: "極端", key:"balanced_extreme" }
  ];

  const valid = (records || []).filter(r => r && Array.isArray(r.dots) && r.dots.length >= 5);
  const n = valid.length;

  if (!n){
    return "這裡會根據你本月已儲存的聲音地圖，整理出一段溫柔的小回饋。先去「今日聲音地圖」完成分析並儲存吧。";
  }

  const seed = __monthlyAddonHashNum((valid[0]?.id || '') + "_" + n);

  // 計算平均
  const avg = AX.map(a => {
    let s = 0, c = 0;
    for (const r of valid){
      const v = Number(r.dots[a.i]);
      if (isFinite(v)){
        s += v; c++;
      }
    }
    const m = c ? (s / c) : 50;
    const intensity = Math.abs(m - 50);
    let side = "mid";
    if (m <= 42) side = "left";
    else if (m >= 58) side = "right";
    return { ...a, mean: m, side, intensity };
  });

  // 取最有感的前兩個軸
  const top = avg.slice().sort((a,b)=>b.intensity-a.intensity).slice(0, 2);

  const opener = __monthlyAddonSeededPick(seed, [
    "這個月的聲音像一張慢慢長成的地圖：有些日子很亮，有些日子很安靜。",
    "把這個月放大來看，你的聲音留下了幾條很清晰的線索。",
    "本月回顧像是一封小小的信：把你「不一定說出口」的感受先替你收好。"
  ]);

  const axisLines = top.map((a, idx) => {
    const L = a.left, R = a.right;
    if (a.side === "left"){
      return __monthlyAddonSeededPick(seed + idx + a.i, [
        `在「${L}／${R}」這條軸上，你偏向「${L}」：像是心裡有很多想衝出去的能量，說話也更有溫度與速度。`,
        `「${L}」在本月比較常出現：有幾天你可能特別投入，連聲音都帶著小小的火花。`,
        `本月的你更靠近「${L}」：那種想趕快把事情做好、把感覺說清楚的力道，很真。`
      ]);
    }
    if (a.side === "right"){
      return __monthlyAddonSeededPick(seed + idx + a.i, [
        `在「${L}／${R}」之間，你更常靠近「${R}」：像是想把自己放回比較舒服的位置，慢慢呼吸。`,
        `「${R}」在本月占了比較多篇幅：也許你正在學著把步伐放慢，讓心有地方靠一下。`,
        `本月的聲音更靠近「${R}」：那不是退後，而是把能量收回來整理、重新對齊。`
      ]);
    }
    return __monthlyAddonSeededPick(seed + idx + a.i, [
      `在「${L}／${R}」之間，你滿常維持在中間：穩穩的，像是在找一個最適合自己的節奏。`,
      `「${L}／${R}」這條線很平均：代表你能在不同情境切換，既能衝，也能停。`,
      `這個月你在「${L}／${R}」保持均衡：情緒起伏有，但你有能力把自己帶回來。`
    ]);
  });

  // 收尾
  const depressed = avg.find(a => a.key === "energetic_depressed");
  const confused = avg.find(a => a.key === "clear_confused");
  const yearning = avg.find(a => a.key === "satisfied_yearning");
  const extreme  = avg.find(a => a.key === "balanced_extreme");

  let closer = "把這段回顧收起來，當成一個提醒：你一直都有在前進，只是速度不同。";
  if (depressed && depressed.side === "right"){
    closer = "如果這個月你比較常靠近「低落」，也別急著責怪自己。你只是需要更溫柔的照顧——像把燈調暗一點、把呼吸留給自己。";
  } else if (confused && confused.side === "right"){
    closer = "若你這個月常落在「混亂」附近，記得：混亂不是失控，它只是資訊太多。把事情拆小、把今天過完，就很棒。";
  } else if (yearning && yearning.side === "right"){
    closer = "「渴望」多一點也沒關係——那代表你仍然期待。把期待留著，但別忘了也替自己按下『已經很努力』的章。";
  } else if (extreme && extreme.side === "right"){
    closer = "如果你這個月比較『極端』，那也許只是你很真實、很用力地活著。下一步不是壓住情緒，而是學會把它放在安全的位置。";
  }

  const lines = [
    opener,
    "",
    `（本月累積 ${n} 天資料）`,
    "",
    ...axisLines,
    "",
    closer
  ];

  return lines.join("\n");
}

function __monthlyAddonTypeText(el, text, cps = 18){
  if (!el) return;
  // 取消上一段打字
  if (__MONTHLY_DRAW.typeTimer){
    cancelAnimationFrame(__MONTHLY_DRAW.typeTimer);
    __MONTHLY_DRAW.typeTimer = null;
  }

  el.textContent = '';
  const s = String(text || '');
  let i = 0;
  let last = performance.now();
  const interval = 1000 / Math.max(6, cps);

  const tick = (now) => {
    const dt = now - last;
    if (dt >= interval){
      const step = dt > interval * 1.8 ? 2 : 1;
      i = Math.min(s.length, i + step);
      el.textContent = s.slice(0, i);
      last = now;
    }
    if (i < s.length){
      __MONTHLY_DRAW.typeTimer = requestAnimationFrame(tick);
    } else {
      __MONTHLY_DRAW.typeTimer = null;
    }
  };
  __MONTHLY_DRAW.typeTimer = requestAnimationFrame(tick);
}

function __monthlyAddonRoundRect(ctx, x, y, w, h, r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function __monthlyAddonExportPNG(){
  const base = __MONTHLY_DRAW.baseCanvas;
  const draw = __MONTHLY_DRAW.drawCanvas;
  if (!base) return;

  // 匯出尺寸：外框 + 畫布 + 字卡區
  const PAD = 56;
  const CARD_H = 220;
  const W = base.width + PAD*2;
  const H = base.height + PAD*2 + CARD_H;

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const ctx = out.getContext('2d');
  if (!ctx) return;

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // 外框（主視覺邊匡）
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.10)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 16;
  __monthlyAddonRoundRect(ctx, 18, 18, W-36, H-36, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fill();
  ctx.restore();

  // 邊框線
  __monthlyAddonRoundRect(ctx, 30, 30, W-60, H-60, 22);
  ctx.strokeStyle = 'rgba(234, 134, 170, 0.95)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 內部畫布區
  const cx = PAD;
  const cy = PAD;
  ctx.drawImage(base, cx, cy);
  if (draw) ctx.drawImage(draw, cx, cy);

  // 字卡區
  const cardX = 46;
  const cardY = PAD + base.height + 24;
  const cardW = W - 92;
  const cardH = CARD_H - 40;

  // 卡片底
  __monthlyAddonRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 標題
  ctx.fillStyle = '#191919';
  ctx.font = '700 20px Arial';
  ctx.fillText('本月小回饋', cardX + 18, cardY + 34);

  // 內容（自動換行）
  const text = (__MONTHLY_DRAW.storyText && __MONTHLY_DRAW.storyText.textContent) ? __MONTHLY_DRAW.storyText.textContent : '';
  ctx.fillStyle = 'rgba(25,25,25,0.78)';
  ctx.font = '400 15px Arial';

  const wrapText = (str, maxW) => {
    const lines = [];
    const paragraphs = String(str || '').split('\n');
    for (const p of paragraphs){
      if (!p){
        lines.push('');
        continue;
      }
      let line = '';
      for (const ch of p){
        const test = line + ch;
        if (ctx.measureText(test).width > maxW && line){
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    }
    return lines;
  };

  const lines = wrapText(text, cardW - 36);
  let y = cardY + 62;
  const lh = 20;
  for (let i = 0; i < lines.length; i++){
    if (y > cardY + cardH - 14) break;
    ctx.fillText(lines[i], cardX + 18, y);
    y += lh;
  }

  // 下載
  const a = document.createElement('a');
  a.download = 'MIOMO_月回顧.png';
  a.href = out.toDataURL('image/png');
  a.click();
}

// 初始化
window.addEventListener('load', () => {
  __monthlyAddonInitOnce();


  window.addEventListener('resize', () => {
    try { __monthlyAddonResizeOverlay(); } catch(e){}
  }, { passive: true });
});


/* =========================
   Monthly 導航
========================= */
function _attachMonthlyNav() {
  const section = document.getElementById('monthly');
  if (!section) return;

  const btn =
    document.getElementById('monthlyBtn') ||
    document.querySelector('[href="#monthly"]') ||
    document.querySelector('[data-target="#monthly"]');

  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    // 先跳到月回顧區塊
    section.scrollIntoView({ behavior: 'smooth' });

    // 等滑動結束
    const start = performance.now();
    (function wait() {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.min(vh, r.bottom) - Math.max(0, r.top);
      const ratio = visible / Math.max(1, Math.min(vh, r.height));

      const enough = ratio >= 0.6;
      const timeout = performance.now() - start > 2500;

      if (enough || timeout) {
        setTimeout(() => renderMonthlyReview({ animate: true }), 240);
        return;
      }
      requestAnimationFrame(wait);
    })();
  }, { passive: false });
}

window.addEventListener('load', () => {
  _attachMonthlyNav();

  
  const noteEl = document.getElementById('monthlyNote');
  if (noteEl && !noteEl.textContent) noteEl.textContent = "點擊「查看本月回顧」後，會在此生成本月總覽波形。";

  
  try {
    const emptyEl = document.getElementById("monthlyEmpty");
    const wrapEl = document.getElementById("monthlyCanvasWrap");
    const hasAny = (typeof _sessionGetDailyRecords === "function") && (_sessionGetDailyRecords().length > 0);
    if (!hasAny) {
      if (wrapEl) wrapEl.style.display = "none";
      if (noteEl) noteEl.style.display = "none";
      if (emptyEl) emptyEl.style.display = "";
    } else {
      if (emptyEl) emptyEl.style.display = "none";
      if (wrapEl) wrapEl.style.display = "";
      if (noteEl) noteEl.style.display = "";
    }
  } catch(e) {}
});



/* =========================================================
   MIOMO UI/UX Layout Patch (不改動音頻分析 / 圖形繪製邏輯)
   
========================================================= */

(function () {
  const AXES = [
    "excitedto_calm",
    "clearto_confused",
    "satisfiedto_yearning",
    "energeticto_depressed",
    "balancedto_extreme"
  ];

  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  const todaySection = document.getElementById('today') || document.querySelector('.container');
  const uploadSection = document.getElementById('upload');
  const weeklySection = document.getElementById('weekly');

  const mapEmpty = document.getElementById('mapEmpty');
  const goUploadFromMap = document.getElementById('goUploadFromMap');

  const rightPanel = document.querySelector('.right-panel');
  const analysisGrid = document.getElementById('analysisGrid');
  const dotbarArea = document.getElementById('dotbarArea');

  const weeklyEmpty = document.getElementById('weeklyEmpty');
  const goTodayFromWeekly = document.getElementById('goTodayFromWeekly');
  const weeklyActions = document.getElementById('weeklyActions');
  const monthlyBtnWeekly = document.getElementById('monthlyBtnWeekly');

  // --- basic scroll actions ---
  if (goUploadFromMap && uploadSection) {
    goUploadFromMap.addEventListener('click', (e) => {
      e.preventDefault();
      uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (goTodayFromWeekly && todaySection) {
    goTodayFromWeekly.addEventListener('click', (e) => {
      e.preventDefault();
      todaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (monthlyBtnWeekly) {
    monthlyBtnWeekly.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.getElementById('monthly');
      if (!section) return;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });

     
      const start = performance.now();
      (function wait() {
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const visible = Math.min(vh, r.bottom) - Math.max(0, r.top);
        const ratio = visible / Math.max(1, Math.min(vh, r.height));
        const enough = ratio >= 0.6;
        const timeout = performance.now() - start > 2500;
        if (enough || timeout) {
          setTimeout(() => renderMonthlyReview({ animate: true }), 240);
          return;
        }
        requestAnimationFrame(wait);
      })();
    });
  }

 
  function updateAnalysisGridLayout() {
    if (!analysisGrid) return;
    const cards = $all('.analysis-card', analysisGrid);
    const visible = cards.filter(c => c.style.display !== 'none');

   
    cards.forEach(c => {
      c.style.gridColumn = '';
      c.style.maxWidth = '';
      c.style.justifySelf = '';
    });

    if (visible.length === 0) return;

    const isOdd = visible.length % 2 === 1;
    if (isOdd) {
      const last = visible[visible.length - 1];
     
      last.style.gridColumn = '1 / -1';
     
      last.style.maxWidth = '';
      last.style.justifySelf = '';
    }
  }


  // --- magnet effect for analysis cards  ---
  function bindMagnet(el) {
    if (!el || el.__miomoMagnetBound) return;
    el.__miomoMagnetBound = true;

    const strength = 12; 
    const damp = 0.18;   

    let mx = 0, my = 0;     
    let tx = 0, ty = 0;     
    let raf = null;

    const step = () => {
      mx += (tx - mx) * damp;
      my += (ty - my) * damp;
      el.style.transform = `translate(${mx}px, ${my}px)`;
      if (Math.abs(tx - mx) + Math.abs(ty - my) > 0.02) {
        raf = requestAnimationFrame(step);
      } else {
        raf = null;
      }
    };

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tx = Math.max(-1, Math.min(1, nx)) * strength;
      ty = Math.max(-1, Math.min(1, ny)) * strength;
      if (!raf) raf = requestAnimationFrame(step);
    });

    el.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(step);
      const clear = () => {
        if (raf) return requestAnimationFrame(clear);
        el.style.transform = '';
      };
      requestAnimationFrame(clear);
    });
  }

  function bindMagnetAll() {
    if (!analysisGrid) return;
    $all('.analysis-card', analysisGrid).forEach(bindMagnet);
  }


  function initDotbarTooltip() {
    if (!dotbarArea) return;

    let tip = dotbarArea.querySelector('.dot-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'dot-tooltip';
      dotbarArea.appendChild(tip);
    }

    let activeDot = null;

    const position = () => {
      if (!activeDot) return;
      const ar = dotbarArea.getBoundingClientRect();
      const dr = activeDot.getBoundingClientRect();
      const x = (dr.left + dr.width / 2) - ar.left;
      const y = dr.top - ar.top;
      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
    };

    const show = (dot) => {
      activeDot = dot;
      const pct = Number(dot.dataset.pct || 0);
      tip.textContent = `${Math.round(pct)}%`;
      tip.classList.add('is-on');
      position();
    };

    const hide = () => {
      tip.classList.remove('is-on');
      activeDot = null;
    };

    $all('.dot', dotbarArea).forEach(dot => {
      if (dot.__miomoTipBound) return;
      dot.__miomoTipBound = true;
      dot.addEventListener('mouseenter', () => show(dot));
      dot.addEventListener('mousemove', position);
      dot.addEventListener('mouseleave', hide);
    });
  }

 
  function syncDotbarPct(mask) {
    for (let i = 1; i <= 5; i++) {
      const dot = document.getElementById(`dot${i}`);
      const t = document.getElementById(`tooltip${i}`);
      const active = !!(mask && mask[i - 1]);
      if (!dot) continue;

      if (!active) {
        dot.dataset.pct = '0';
        dot.style.left = '50%';
      } else {
        const v = t ? parseFloat(String(t.textContent).replace('%','')) : NaN;
        dot.dataset.pct = String(Number.isFinite(v) ? v : 0);
      }
    }
  }

  
  function applyAxesMaskToDotbar(mask) {
    if (!dotbarArea) return;
    const bars = $all('.emotion-bar', dotbarArea);

   
    bars.forEach((bar, idx) => {
      const on = !!(mask && mask[idx]);
      bar.style.display = '';
      bar.classList.toggle('is-inactive', !on);

      
      const dot = bar.querySelector('.dot');
      if (dot && !on) dot.style.left = '50%';
    });

   
    dotbarArea.style.display = 'block';
  }

  
  function renderWeeklyFromSession() {
   
    if (typeof _sessionGetWeekData !== 'function') return;

    const weekData = _sessionGetWeekData() || {};
    let savedCount = 0;

    for (let d = 1; d <= 7; d++) {
      const dayKey = `day${d}`;
      const img = document.getElementById(`day${d}`);
      const card = img ? img.closest('.day-card') : null;
      const wd = weekData[dayKey];

      if (!card) continue;

      if (wd && wd.img) {
        savedCount++;
        card.classList.add('is-visible');
        // reveal animation once
        if (!card.dataset._revealed) {
          card.classList.add('week-reveal');
          card.dataset._revealed = '1';
          card.addEventListener('animationend', () => card.classList.remove('week-reveal'), { once: true });
        }

        // show only analyzed axes (if mask exists)
        const bars = $all('.emotion-bar', card);
        const mask = Array.isArray(wd.axesMask) ? wd.axesMask : null;
        if (mask && mask.length) {
          bars.forEach((bar, idx) => { bar.style.display = mask[idx] ? '' : 'none'; });
        } else {
          bars.forEach(bar => { bar.style.display = ''; });
        }
      } else {
        card.classList.remove('is-visible');
      }
    }
  
    const weekGridEl = document.querySelector('.week-grid');
    if (weekGridEl) {
    
      const isSmall = window.matchMedia && window.matchMedia('(max-width: 520px)').matches;

      if (savedCount === 1 || savedCount === 2) {
        weekGridEl.style.justifyContent = 'center';
        weekGridEl.style.gridAutoColumns = 'unset';
        weekGridEl.style.gridAutoFlow = 'row';

        if (!isSmall) {
         
          const minW = (window.matchMedia && window.matchMedia('(max-width: 860px)').matches) ? 260 : 280;
          const cols = savedCount;
         
          weekGridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(${minW}px, 320px))`;
        } else {
         
          weekGridEl.style.gridTemplateColumns = '';
        }
      } else {
      
        weekGridEl.style.justifyContent = '';
        weekGridEl.style.gridTemplateColumns = '';
        weekGridEl.style.gridAutoFlow = '';
        weekGridEl.style.gridAutoColumns = '';
      }
    }
if (weeklyEmpty) weeklyEmpty.style.display = savedCount === 0 ? 'flex' : 'none';
    if (weeklyActions) weeklyActions.style.display = savedCount > 0 ? 'flex' : 'none';
  }

  // --- analysis completion state + reveal choreography ---
  let pendingReveal = false;
  let analysisDone = false;
  let io = null;

  function inViewport(el, ratio = 0.65) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visibleH = Math.min(vh, r.bottom) - Math.max(0, r.top);
    return (visibleH / Math.max(1, r.height)) >= ratio;
  }

  function triggerReveal() {
    if (!rightPanel) return;
    rightPanel.classList.remove('is-awaiting-reveal');
    rightPanel.classList.remove('is-revealed');
    requestAnimationFrame(() => rightPanel.classList.add('is-revealed'));
  }

  function armRevealIfNeeded() {
    if (!todaySection || !rightPanel) return;

   
    if (!analysisDone || !pendingReveal) return;

   
    rightPanel.classList.add('is-awaiting-reveal');

    
    if (inViewport(todaySection, 0.55)) {
      triggerReveal();
      pendingReveal = false;
      return;
    }

   
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      const hit = entries && entries[0] && entries[0].isIntersecting;
      if (hit) {
        triggerReveal();
        pendingReveal = false;
        try { io.disconnect(); } catch {}
      }
    }, { threshold: [0.55] });

    io.observe(todaySection);
  }

 
  const analyzeBtnEl = document.getElementById('analyzeBtn');
  if (analyzeBtnEl) {
    analyzeBtnEl.addEventListener('click', () => {
      pendingReveal = true;
    
      if (rightPanel) rightPanel.classList.remove('is-revealed');
    }, true);
  }

 
  (function hookDrawClosedCircleForUX() {
    const old = window.drawClosedCircle;
    if (typeof old !== 'function') return;

    window.drawClosedCircle = function (ctx, results, opts) {
      const res = old.apply(this, arguments);

     
      if (!ctx || !ctx.canvas || ctx.canvas.id !== 'canvas') return res;

      try {
       
        const mask = AXES.map(ax => Array.isArray(results) && results.some(r => r && r.axis === ax));
        window.__lastAxesMask = mask;

       
        applyAxesMaskToDotbar(mask);

        
        const anyOn = mask.some(Boolean);
        if (mapEmpty) mapEmpty.style.display = anyOn ? 'none' : 'flex';

        
        updateAnalysisGridLayout();


        
        bindMagnetAll();
        syncDotbarPct(mask);
        initDotbarTooltip();
       
        analysisDone = true;
        armRevealIfNeeded();
      } catch (e) {
        console.warn('UX hook failed:', e);
      }

      return res;
    };
  })();

  // --- save button: enrich weekData with axesMask + refresh weekly UI ---
  const saveBtnEl = document.getElementById('saveBtn');
  if (saveBtnEl) {
    saveBtnEl.addEventListener('click', () => {
    
      setTimeout(() => {
        try {
          if (typeof _sessionGetWeekData !== 'function') return;
          if (typeof _sessionSetWeekData !== 'function') return;
          if (typeof _sessionGetLastSavedDay !== 'function') return;

          const d = _sessionGetLastSavedDay();
          const key = `day${d}`;
          const wdAll = { ...(_sessionGetWeekData() || {}) };
          if (wdAll[key] && !wdAll[key].axesMask) {
            wdAll[key] = { ...wdAll[key], axesMask: Array.isArray(window.__lastAxesMask) ? window.__lastAxesMask : null };
            _sessionSetWeekData(wdAll);
          }
        } catch (e) {
          console.warn('weekData enrich failed:', e);
        }
        renderWeeklyFromSession();
      }, 80);
    }, false);
  }

  // --- initial state on load ---
  window.addEventListener('load', () => {
   
    if (dotbarArea) dotbarArea.style.display = 'none';
    if (mapEmpty) mapEmpty.style.display = 'flex';
    updateAnalysisGridLayout();
    bindMagnetAll();
    initDotbarTooltip();
    renderWeeklyFromSession();
  });

})();





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

    // 確保不會遮擋互動
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
      const tx = dx * 8; // px
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


  
  try{
    const sb = document.getElementById('monthlySaveBtn');
    if (sb) sb.__miomo_export = true;
  }catch(e){}
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


/* =========================================
   BACKGROUND MUSIC (CSS-COMPATIBLE FIX)
  
========================================= */
(function initBackgroundMusic(){
  const btn   = document.getElementById('musicToggle');
  const audio = document.getElementById('bgm');

  if (!btn || !audio) {
    console.warn('[BGM] musicToggle or bgm not found');
    return;
  }

  let isPlaying = true;   // 預設播放
  let unlocked  = false;

  /* ===== 初始狀態 ===== */
  btn.classList.add('is-playing');
  btn.classList.remove('is-muted');

  audio.loop = true;
  audio.volume = 0.4;
  audio.muted = true;    
  audio.preload = 'auto';

  const tryPlay = () => {
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(()=>{});
  };

  // 進入頁面立刻嘗試播放（muted）
  tryPlay();

  /* ===== 第一次互動解除靜音 ===== */
  const unlockAudio = () => {
    if (!isPlaying || unlocked) return;
    unlocked = true;
    audio.muted = false;
    tryPlay();
  };

  ['pointerdown','touchstart','keydown','wheel'].forEach(evt=>{
    window.addEventListener(evt, unlockAudio, {
      once:true, passive:true, capture:true
    });
  });

  /* ===== 點擊切換 ===== */
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    isPlaying = !isPlaying;

    if (isPlaying) {
      btn.classList.add('is-playing');
      btn.classList.remove('is-muted');

      audio.muted = false;
      tryPlay();
    } else {
      btn.classList.add('is-muted');
      btn.classList.remove('is-playing');

      audio.pause();
    }
  });
})();





/* =========================================================
   MIOMO ADD-ONLY PATCH: TODAY AUDIO PLAYBACK + MONTHLY UNDO/DIARY/LOGO
========================================================= */

(() => {
  
  if (window.__MIOMO_MONTHLY_UI_PATCH) return;
  window.__MIOMO_MONTHLY_UI_PATCH = true;

  
  const fileInput = document.getElementById('fileInput');
  const listEl = document.getElementById('audioPlaybackList');
  const emptyEl = document.getElementById('audioPlaybackEmpty');

  let currentUrl = null;

  function renderEmpty(){
    if (!listEl) return;
    listEl.innerHTML = '';
    if (emptyEl){
      emptyEl.style.display = '';
      emptyEl.textContent = '尚未上傳音檔';
      listEl.appendChild(emptyEl);
    }
  }

  function renderOne(file){
    if (!listEl) return;
    if (!file){ renderEmpty(); return; }

    try{ if (currentUrl) URL.revokeObjectURL(currentUrl); }catch(e){}
    currentUrl = URL.createObjectURL(file);

    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'none';

    const row = document.createElement('div');
    row.className = 'audio-playback-item';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.src = currentUrl;

    row.appendChild(audio);
    listEl.appendChild(row);
  }

  if (fileInput && listEl){
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      setTimeout(() => renderOne(f || null), 0);
    });
    renderEmpty();
  }

  window.addEventListener('beforeunload', () => {
    try{ if (currentUrl) URL.revokeObjectURL(currentUrl); }catch(e){}
  });

  
  function ensureMonthlyUndo(){
    if (!window.__MONTHLY_DRAW) return;
    const D = window.__MONTHLY_DRAW;

    if (!Array.isArray(D.strokes)) D.strokes = [];
    if (!('maxStrokes' in D)) D.maxStrokes = 5;
    if (!('currentStroke' in D)) D.currentStroke = null;

    if (!D.undoBtn){
      D.undoBtn = document.getElementById('monthlyUndoBtn');
    }

    function redrawAll(){
      if (!D.drawCanvas || !D.dctx) return;
      const ctx = D.dctx;
      ctx.clearRect(0,0,D.drawCanvas.width, D.drawCanvas.height);
      for (const stroke of D.strokes){
        if (!stroke || stroke.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i=1;i<stroke.length;i++){
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      }
    }

    if (D.undoBtn && !D.undoBtn.__bound){
      D.undoBtn.__bound = true;
      D.undoBtn.addEventListener('click', () => {
        D.strokes = Array.isArray(D.strokes) ? D.strokes : [];
        D.strokes.pop();
        redrawAll();
      });
    }

    // patch drawing handlers: record strokes
    const dc = D.drawCanvas;
    if (dc && !dc.__undoRecordPatched){
      dc.__undoRecordPatched = true;

      dc.addEventListener('pointerdown', (ev) => {
        if (!D.enabled) return;
        if (ev.button !== 0) return;
        const rect = dc.getBoundingClientRect();
        const sx = dc.width / rect.width;
        const sy = dc.height / rect.height;
        const x = (ev.clientX - rect.left) * sx;
        const y = (ev.clientY - rect.top) * sy;

        const stroke = [{x, y}];
        D.currentStroke = stroke;
        D.strokes.push(stroke);
        if (D.strokes.length > (D.maxStrokes || 5)) D.strokes.shift();
      }, { passive: true });

      dc.addEventListener('pointermove', (ev) => {
        if (!D.enabled || !D.isDown) return;
        if (!D.currentStroke) return;
        const rect = dc.getBoundingClientRect();
        const sx = dc.width / rect.width;
        const sy = dc.height / rect.height;
        const x = (ev.clientX - rect.left) * sx;
        const y = (ev.clientY - rect.top) * sy;
        D.currentStroke.push({x, y});
      }, { passive: true });

      const end = () => { D.currentStroke = null; };
      dc.addEventListener('pointerup', end);
      dc.addEventListener('pointercancel', end);
      window.addEventListener('blur', end);
    }

    // patch draw button UI: toggle X and undo visibility
    if (D.drawBtn && !D.drawBtn.__uxPatch){
      D.drawBtn.__uxPatch = true;
      D.drawBtn.addEventListener('click', () => {
        setTimeout(() => {
          const on = !!D.enabled;
          if (D.drawBtn) D.drawBtn.classList.toggle('is-on', on);
          if (D.undoBtn) D.undoBtn.style.display = on ? 'inline-block' : 'none';
        }, 0);
      });
    }

    // initial
    if (D.drawBtn) D.drawBtn.classList.remove('is-on');
    if (D.undoBtn) D.undoBtn.style.display = 'none';
  }

 
  window.addEventListener('load', () => {
    try{ ensureMonthlyUndo(); }catch(e){}
  });

  
  const diary = document.getElementById('monthlyDiary');
  const toggle = document.getElementById('monthlyDiaryToggle');
  const panel  = document.getElementById('monthlyDiaryPanel');
  const storyTextEl = document.getElementById('monthlyStoryText');

  let storyFull = '';

  function setDiaryOpen(open){
    if (!diary || !toggle) return;
    diary.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function startTyping(){
    if (!storyTextEl) return;

  
    if (!storyFull){
      try{
        const recs = (typeof _sessionGetDailyRecords === 'function') ? (_sessionGetDailyRecords() || []) : [];
        if (typeof window.__monthlyAddonMakeStory === 'function'){
          storyFull = window.__monthlyAddonMakeStory(recs);
        }
      }catch(e){}
    }
    if (!storyFull) return;
    if (typeof window.__monthlyAddonTypeText === 'function' && window.__MONTHLY_DRAW){
      __monthlyAddonTypeText(storyTextEl, storyFull, 18);
    } else {
      // fallback
      storyTextEl.textContent = '';
      let i = 0;
      const s = String(storyFull);
      const t = setInterval(() => {
        i += 1;
        storyTextEl.textContent = s.slice(0, i);
        if (i >= s.length) clearInterval(t);
      }, 35);
    }
  }

  if (toggle && !toggle.__bound){
    toggle.__bound = true;
    toggle.__bound_miomo = true;
    toggle.addEventListener('click', (e) => {
      try{ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }catch(_e){}
      const open = diary ? !diary.classList.contains('is-open') : true;
      setDiaryOpen(open);
      if (open){
        if (storyTextEl) storyTextEl.textContent = '';
        startTyping();
      } else {
        // close: stop typing
        if (window.__MONTHLY_DRAW && __MONTHLY_DRAW.typeTimer){
          cancelAnimationFrame(__MONTHLY_DRAW.typeTimer);
          __MONTHLY_DRAW.typeTimer = null;
        }
      }
    }, true);
  }

  // hook afterRender to capture story and show diary collapsed
  if (typeof window.__monthlyAddonAfterRender === 'function' && !window.__MIOMO_DIARY_PATCHED){
    window.__MIOMO_DIARY_PATCHED = true;
    const _old = window.__monthlyAddonAfterRender;
    window.__monthlyAddonAfterRender = function(args){
      const res = _old.call(this, args);

      
      try{
        if (args && Array.isArray(args.allRecords) && typeof window.__monthlyAddonMakeStory === 'function'){
          storyFull = window.__monthlyAddonMakeStory(args.allRecords);
        }
      }catch(e){}
     
      try{
        if (window.__MONTHLY_DRAW && __MONTHLY_DRAW.typeTimer){
          cancelAnimationFrame(__MONTHLY_DRAW.typeTimer);
          __MONTHLY_DRAW.typeTimer = null;
        }
      }catch(e){}
      if (storyTextEl){
        storyTextEl.textContent = '';
      }
      if (toggle){
        
        toggle.__miomo_story_text = storyFull;
        toggle.__miomo_story = storyFull;
        toggle.__bound_miomo = true;
      }
      if (diary){
        diary.style.display = '';
        setDiaryOpen(false);
      }
      return res;
    };
  }

  
  if (typeof window.__monthlyAddonExportPNG === 'function' && !window.__MIOMO_EXPORT_LOGO_PATCHED){
    window.__MIOMO_EXPORT_LOGO_PATCHED = true;

   
    const _oldExport = window.__monthlyAddonExportPNG;

    window.__monthlyAddonExportPNG = function(){
   
      try{
        const base = window.__MONTHLY_DRAW?.baseCanvas;
        const draw = window.__MONTHLY_DRAW?.drawCanvas;
        if (!base) return;

        const PAD = 56;
        const CARD_H = 220;
        const W = base.width + PAD*2;
        const H = base.height + PAD*2 + CARD_H;

        const out = document.createElement('canvas');
        out.width = W;
        out.height = H;
        const ctx = out.getContext('2d');
        if (!ctx) return;

       
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        
        if (typeof window.__monthlyAddonRoundRect === 'function'){
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.10)';
          ctx.shadowBlur = 28;
          ctx.shadowOffsetY = 16;
          __monthlyAddonRoundRect(ctx, 18, 18, W-36, H-36, 28);
          ctx.fillStyle = 'rgba(255,255,255,0.96)';
          ctx.fill();
          ctx.restore();

          __monthlyAddonRoundRect(ctx, 30, 30, W-60, H-60, 22);
          ctx.strokeStyle = 'rgba(234, 134, 170, 0.95)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        const cx = PAD, cy = PAD;
        ctx.drawImage(base, cx, cy);
        if (draw) ctx.drawImage(draw, cx, cy);

       
        const logo = new Image();
        logo.onload = () => {
          const targetW = Math.min(180, base.width * 0.30);
          const ratio = logo.width ? (logo.height / logo.width) : 0.35;
          const targetH = targetW * ratio;
          const lx = cx + (base.width - targetW) / 2;
          const ly = cy + 12;
          ctx.save();
          ctx.globalAlpha = 0.92;
          ctx.drawImage(logo, lx, ly, targetW, targetH);
          ctx.restore();

          // re-draw story card area using storyFull (even if collapsed)
          const cardX = 46;
          const cardY = PAD + base.height + 24;
          const cardW = W - 92;
          const cardH = CARD_H - 40;

          if (typeof window.__monthlyAddonRoundRect === 'function'){
            __monthlyAddonRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          ctx.fillStyle = '#191919';
          ctx.font = '700 20px Arial';
          ctx.fillText('本月小回饋', cardX + 18, cardY + 34);

          const text = storyFull || (storyTextEl ? storyTextEl.textContent : '') || '';
          ctx.fillStyle = 'rgba(25,25,25,0.78)';
          ctx.font = '400 15px Arial';

          // wrap text
          const maxW = cardW - 36;
          const lines = [];
          const paragraphs = String(text).split('\n');
          for (const p of paragraphs){
            if (!p){ lines.push(''); continue; }
            let line = '';
            for (const ch of p){
              const test = line + ch;
              if (ctx.measureText(test).width > maxW){
                lines.push(line);
                line = ch;
              } else {
                line = test;
              }
            }
            if (line) lines.push(line);
          }

          let y = cardY + 62;
          const lh = 20;
          for (let i=0;i<lines.length;i++){
            if (y > cardY + cardH - 14) break;
            ctx.fillText(lines[i], cardX + 18, y);
            y += lh;
          }

          const a = document.createElement('a');
          a.download = 'MIOMO_月回顧.png';
          a.href = out.toDataURL('image/png');
          a.click();
        };
        logo.onerror = () => {
          // fallback to original
          try{ _oldExport(); }catch(e){}
        };
        logo.src = "../image/logo@300x-8.png";
      }catch(e){
        try{ _oldExport(); }catch(_e){}
      }
    };
  }
})();



/* =========================================================
   MIOMO ADD-ONLY PATCH (FIX UNDO + DIARY STORY + EXPORT LOGO+FRAME + SINGLE PLAYBACK)
========================================================= */
(() => {

  const fileInput = document.getElementById('fileInput');
  const playbackList = document.getElementById('audioPlaybackList');
  const playbackEmpty = document.getElementById('audioPlaybackEmpty');
  let currentURL = null;

  function renderPlaybackEmpty(){
    if (!playbackList) return;
    playbackList.innerHTML = '';
    if (playbackEmpty){
      playbackEmpty.style.display = '';
      playbackEmpty.textContent = '尚未上傳音檔';
      playbackList.appendChild(playbackEmpty);
    }
  }
  function renderPlaybackOne(file){
    if (!playbackList) return;
    if (!file){ renderPlaybackEmpty(); return; }
    try{ if (currentURL) URL.revokeObjectURL(currentURL); }catch(e){}
    currentURL = URL.createObjectURL(file);

    playbackList.innerHTML = '';
    if (playbackEmpty) playbackEmpty.style.display = 'none';

    const row = document.createElement('div');
    row.className = 'audio-playback-item';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.src = currentURL;

    row.appendChild(audio);
    playbackList.appendChild(row);
  }
  if (fileInput && playbackList){
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      setTimeout(() => renderPlaybackOne(f || null), 0);
    });
    // init
    renderPlaybackEmpty();
  }
  window.addEventListener('beforeunload', () => {
    try{ if (currentURL) URL.revokeObjectURL(currentURL); }catch(e){}
  });

  
  const monthlyFrame = document.getElementById('monthlyFrame');
  function ensureDiary(){
    if (!monthlyFrame) return null;
    let diary = document.getElementById('monthlyDiary');
    if (diary) return diary;

    diary = document.createElement('div');
    diary.className = 'monthly-diary';
    diary.id = 'monthlyDiary';
    diary.style.display = 'none';

    diary.innerHTML = `
      <button class="monthly-diary-toggle" id="monthlyDiaryToggle" type="button" aria-expanded="false">
        <span class="prompt-default">MIOMO好像想到告訴你什麼…？</span>
        <span class="prompt-hover">點按查看你的情緒日記！</span>
        <span class="prompt-icon" aria-hidden="true"></span>
      </button>
      <div class="monthly-diary-panel" id="monthlyDiaryPanel" aria-hidden="true">
        <div class="analysis-card monthly-story-card" id="monthlyStoryCard">
          <div class="emotion-title" id="monthlyStoryTitle">本 月 小 回 饋</div>
          <div class="analysis-text" id="monthlyStoryText"></div>
        </div>
      </div>
    `;
    monthlyFrame.appendChild(diary);
    return diary;
  }

  const AXES = [
    { left: '激動', right: '安心' },
    { left: '清醒', right: '混亂' },
    { left: '滿足', right: '渴望' },
    { left: '高亢', right: '低落' },
    { left: '均衡', right: '極端' },
  ];

  // 故事庫
  const STORY_BANK = {
    '激動+低落': '這個月像一段情緒過山車：熱情上來時你很敢衝，低潮來時你也沒有假裝沒事。你不是脆弱，你只是很真。下一次，記得把「休息」也算進你的努力裡。',
    '激動+渴望': '你一直在追著一個很想靠近的畫面：心裡有火、也有期待。別急，渴望是方向感；把它拆成小步驟，你會更快抵達。',
    '混亂+低落': '有些日子像在霧裡走路，慢一點也沒關係。你不是停滯，而是在重新整理內在的排序。先把自己照顧好，答案會更清楚。',
    '安心+均衡': '你的步調很穩，像把生活調到一個舒服的音量。穩定不是無聊，是你把自己照顧得很好——這是一種很稀有的能力。',
    '清醒+滿足': '你在許多時刻都很知道自己要什麼，也願意把每次完成收進心裡。這份清楚會讓你越走越踏實。',
    '極端+激動': '你很敢感受，也很敢表達。情緒幅度大不是壞事，只要記得留一個出口：深呼吸、散步、或把它寫下來，力量就會回到你手上。',
    '低落+安心': '你學會在低潮裡替自己留一盞小燈。就算情緒往下，你仍在找讓自己好過的方法——這就是你的韌性。',
    '渴望+清醒': '你不只想要，你也在規劃。這種「想前進」又「有方法」的狀態很強——接下來只要持續，就會看到成果。',
    '混亂+激動': '腦內很熱鬧、心也很滿。當訊號太多時，先做一件小事就好：把混亂降到可處理的程度，你會重新找回掌控感。',
    '均衡+滿足': '你把自己安放得很好：不需要轟轟烈烈，也能感覺到日常的甜。把這份平衡留著，它會在忙亂時成為你的底氣。',
    '清醒+低落': '你很清楚自己正在經歷什麼，這種清楚會讓低潮變得更可被擁抱。允許自己慢慢來，情緒會退潮。',
    '渴望+低落': '想要很多、心卻有點累。別急著責怪自己，渴望是你仍然在乎；把期待改成「今天只做一點點」，你會更舒服。',
    '激動+清醒': '你的火不是亂燒，是有方向的。保持這份清醒的熱情，你會把很多想法落地成真。',
    '安心+滿足': '你把溫柔放回自己身上了。這不是躺平，是你選擇用舒服的方式生活。',
    '混亂+渴望': '你想前進，但路徑還在長出來。先別急著找完美答案，先走一步就好，路會自己變清楚。',
  };

  function pickTopEmotions(records){
    const score = Object.create(null);
    records.forEach(r => {
      const dots = Array.isArray(r?.dots) ? r.dots : [];
      for (let i=0;i<AXES.length;i++){
        const v = Number(dots[i]);
        if (!Number.isFinite(v)) continue;
        const dist = Math.abs(v - 50);
        const label = (v <= 50) ? AXES[i].left : AXES[i].right;
        score[label] = (score[label] || 0) + dist;
      }
    });
    return Object.entries(score).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  }

  function makeStory(records){
    if (!records || !records.length){
      return '這個月還沒有足夠的聲音紀錄可以生成回顧。先在「今日聲音地圖」完成分析並儲存，MIOMO 會慢慢把你的情緒地圖拼起來。';
    }
    const tops = pickTopEmotions(records);
    const a = tops[0];
    const b = tops[1];
    const key = (a && b) ? `${a}+${b}` : (a || '');
    if (STORY_BANK[key]) return STORY_BANK[key];
    if (a) return `這個月最常出現的狀態是「${a}」。它像一個提醒：你的內在正在說話。聽見它、照顧它，你會更靠近自己。`;
    return '這個月的情緒像一張地圖：有些地方明亮、有些地方安靜。你不需要把每一段都解釋清楚，光是走過，就已經很了不起。';
  }

  let typeTimer = null;
  function typewriter(el, text, speed=26){
    if (!el) return;
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    const s = String(text || '');
    let i = 0;
    el.textContent = '';
    const step = () => {
      i += 1;
      el.textContent = s.slice(0, i);
      if (i < s.length) typeTimer = setTimeout(step, speed);
    };
    typeTimer = setTimeout(step, speed);
  }

 
  function ensureUndoButton(){
    
    const actions = document.getElementById('monthlyActions');
    let undo = document.getElementById('monthlyUndoBtn') || document.getElementById('monthlyUndoBtn2');

    if (!undo && actions){
      undo = document.createElement('button');
      undo.id = 'monthlyUndoBtn2';
      undo.type = 'button';
      undo.textContent = '回到上一步';
      const drawBtn = document.getElementById('drawToggleBtn');
      if (drawBtn) actions.insertBefore(undo, drawBtn);
      else actions.prepend(undo);
    }
    return undo;
  }

  function isDrawingEnabled(drawCanvas){

    const pe = (drawCanvas && drawCanvas.style) ? drawCanvas.style.pointerEvents : '';
    return pe && pe !== 'none';
  }

  function ensureDrawBtnXState(drawBtn, enabled){
    if (!drawBtn) return;
    drawBtn.classList.toggle('is-on', !!enabled);
  }

  
  async function loadLogo(){
    return new Promise((resolve) => {
     
      const el = document.getElementById('monthlyLogoOverlay');
      try{
        if (el && el.complete && el.naturalWidth) { resolve(el); return; }
      }catch(e){}
     
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        try{
          if (el && el.complete && el.naturalWidth) resolve(el);
          else resolve(null);
        }catch(e){ resolve(null); }
      };
      const src = (el && (el.currentSrc || el.src)) ? (el.currentSrc || el.src) : "../image/logo@300x-8.png";
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }

  async function exportMonthlyPNG(baseCanvas, drawCanvas, storyText){
   
    const crop = Math.max(20, Math.min(70, Math.round((baseCanvas.height || 620) * 0.07)));
    const stageW = baseCanvas.width;
    const stageH = baseCanvas.height - crop;

    
    const CARD_H = 220;

    const W = stageW + PAD*2;
    const H = stageH + PAD*2 + CARD_H;

    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    // bg
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0,0,W,H);

    // border frame
    ctx.save();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#EA86AA';
    roundRect(ctx, 18, 18, W-36, H-36, 34);
    ctx.stroke();
    ctx.restore();

    const cx = PAD;
    const cy = PAD;

   
    ctx.drawImage(baseCanvas, 0, 0, stageW, stageH, cx, cy, stageW, stageH);
    try{
      if (drawCanvas) ctx.drawImage(drawCanvas, 0, 0, stageW, stageH, cx, cy, stageW, stageH);
    }catch(e){}

   
    const logo = await loadLogo();
    if (logo){
      const targetW = Math.min(180, stageW * 0.30);
      const ratio = logo.width ? (logo.height/logo.width) : 0.35;
      const targetH = targetW * ratio;
      const lx = cx + (stageW - targetW)/2;
      const ly = cy + 12;
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(logo, lx, ly, targetW, targetH);
      ctx.restore();
    }

    // --- story card (below stage) ---
    const text = String(storyText || '').trim();
    const cardX = 46;
    const cardY = PAD + stageH + 24;
    const cardW = W - 92;
    const cardH = CARD_H - 40;

    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#191919';
    ctx.font = '700 20px Arial';
    ctx.fillText('本月小回饋', cardX+18, cardY+34);

    ctx.fillStyle = 'rgba(25,25,25,0.78)';
    ctx.font = '400 15px Arial';

    const maxW = cardW - 36;
    const chars = text.split('');
    let line = '';
    const lines = [];
    for (const ch of chars){
      const test = line + ch;
      if (ctx.measureText(test).width > maxW){
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    let yy = cardY + 62;
    const lh = 22;
    for (let i=0;i<lines.length;i++){
      if (yy > cardY + cardH - 14) break;
      ctx.fillText(lines[i], cardX+18, yy);
      yy += lh;
    }

    const a = document.createElement('a');
    a.download = 'MIOMO_月回顧.png';
    a.href = out.toDataURL('image/png');
    a.click();
  }

  
  function bindMonthlyOnce(){
    const baseCanvas = document.getElementById('monthlyCanvas');
    const drawCanvas = document.getElementById('monthlyDrawCanvas');

    if (!monthlyFrame || !baseCanvas) return;

    
    if (!document.getElementById('monthlyLogoOverlay')){
      const img = document.createElement('img');
      img.id = 'monthlyLogoOverlay';
      img.className = 'monthly-logo';
      img.alt = 'logo';
      img.src = "../image/logo@300x-8.png";
      const wrap = baseCanvas.parentElement;
      if (wrap) wrap.appendChild(img);
    }

    const diary = ensureDiary();
    const toggle = document.getElementById('monthlyDiaryToggle');
    const panel = document.getElementById('monthlyDiaryPanel');
    const storyEl = document.getElementById('monthlyStoryText');

    
    const records = (typeof _sessionGetDailyRecords === 'function') ? (_sessionGetDailyRecords() || []) : [];
    const story = makeStory(records);

    
   
    if (toggle) toggle.__miomo_story = story;

    if (diary) diary.style.display = '';
    if (toggle){
      toggle.setAttribute('aria-expanded','false');
    }
    if (panel){
      panel.setAttribute('aria-hidden','true');
    }
    if (diary){
      diary.classList.remove('is-open');
    }
    if (storyEl){
      storyEl.textContent = '';
    }

    
    if (toggle && !toggle.__bound_miomo){
      toggle.__bound_miomo = true;
      toggle.addEventListener('click', () => {
        const open = !diary.classList.contains('is-open');
        diary.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (panel) panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open){
          const s = (toggle && toggle.__miomo_story) ? toggle.__miomo_story : story;
          typewriter(storyEl, s, 26);
        } else {
          if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
        }
      });
    }

    // Undo button
    const undoBtn = ensureUndoButton();
    const drawBtn = document.getElementById('monthlyDrawBtn') || document.getElementById('drawToggleBtn');
    const saveBtn = document.getElementById('monthlySaveBtn') || document.getElementById('saveMonthlyBtn');

    // Snapshot stack
    const stack = [];
    const MAX_UNDO = 5;

    if (drawCanvas){
      // record snapshot when a stroke starts
      const onDown = (ev) => {
        // only left button
        if (ev.button !== 0) return;
        // only when drawing enabled
        if (!isDrawingEnabled(drawCanvas) && !(window.__MONTHLY_DRAW && __MONTHLY_DRAW.enabled)) return;

        try{
          const ctx = drawCanvas.getContext('2d');
          if (!ctx) return;
          const img = ctx.getImageData(0,0,drawCanvas.width, drawCanvas.height);
          stack.push(img);
          while (stack.length > MAX_UNDO) stack.shift();
        }catch(e){}
      };

      if (!drawCanvas.__miomo_undo_bound){
        drawCanvas.__miomo_undo_bound = true;
        drawCanvas.addEventListener('pointerdown', onDown, true);
      }
    }

    if (undoBtn && !undoBtn.__miomo_bound){
      undoBtn.__miomo_bound = true;
      undoBtn.textContent = '回到上一步';
      undoBtn.addEventListener('click', () => {
        try{
          const ctx = drawCanvas ? drawCanvas.getContext('2d') : null;
          if (!ctx) return;
          const last = stack.pop();
          if (last){
            ctx.putImageData(last, 0, 0);
          } else {
            ctx.clearRect(0,0,drawCanvas.width, drawCanvas.height);
          }
        }catch(e){}
      });
    }

   
    const syncDrawUI = () => {
      const enabled = (window.__MONTHLY_DRAW && __MONTHLY_DRAW.enabled) ? true : (drawCanvas ? isDrawingEnabled(drawCanvas) : false);
      if (undoBtn) undoBtn.style.display = enabled ? 'inline-block' : 'none';
      ensureDrawBtnXState(drawBtn, enabled);
    };

    // initial
    syncDrawUI();

    if (drawBtn && !drawBtn.__miomo_sync){
      drawBtn.__miomo_sync = true;
      drawBtn.addEventListener('click', () => setTimeout(syncDrawUI, 0), true);
    }

    // Save: intercept and export our framed PNG with logo and story
    if (saveBtn && !saveBtn.__miomo_export){
      saveBtn.__miomo_export = true;
      saveBtn.addEventListener('click', async (ev) => {
       
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        const recordsNow = (typeof _sessionGetDailyRecords === 'function') ? (_sessionGetDailyRecords() || []) : [];
        const storyNow = makeStory(recordsNow);
        if (toggle) toggle.__miomo_story = storyNow;
        await exportMonthlyPNG(baseCanvas, drawCanvas, storyNow);
      }, true);
    }
}

 
  const monthlyBtn = document.getElementById('monthlyBtn');
  if (monthlyBtn && !monthlyBtn.__miomo_bind){
    monthlyBtn.__miomo_bind = true;
    monthlyBtn.addEventListener('click', () => {
      setTimeout(bindMonthlyOnce, 380);
    }, true);
  }

 
  setTimeout(bindMonthlyOnce, 900);

})();



/* =========================================================
   MIOMO FIX PATCH (UNDO + DIARY STORY + SAFE EXPORT)
========================================================= */
(() => {
 
  if (window.__MIOMO_MONTHLY_UI_PATCH) return;
  const monthlyBtn = document.getElementById('monthlyBtn');
  const monthlySection = document.getElementById('monthly');
  const monthlyFrame = document.getElementById('monthlyFrame');

  const baseCanvas = document.getElementById('monthlyCanvas');
  const drawCanvas = document.getElementById('monthlyDrawCanvas');

  const drawBtn = document.getElementById('monthlyDrawBtn') || document.getElementById('drawToggleBtn');
  const saveBtn = document.getElementById('monthlySaveBtn') || document.getElementById('saveMonthlyBtn');
  let undoBtn = document.getElementById('monthlyUndoBtn') || document.getElementById('monthlyUndoBtn2');

  const diary = document.getElementById('monthlyDiary');
  const diaryToggle = document.getElementById('monthlyDiaryToggle');
  const diaryPanel = document.getElementById('monthlyDiaryPanel');
  const storyEl = document.getElementById('monthlyStoryText');

  // --- story generator ---
  const AXES = [
    { left: '激動', right: '安心' },
    { left: '清醒', right: '混亂' },
    { left: '滿足', right: '渴望' },
    { left: '高亢', right: '低落' },
    { left: '均衡', right: '極端' },
  ];

  const BANK = {
    '激動+低落': '這個月像一段情緒過山車：熱情上來時你很敢衝，低潮來時你也沒有假裝沒事。你不是脆弱，你只是很真。下一次，記得把「休息」也算進你的努力裡。',
    '激動+渴望': '你一直在追著一個很想靠近的畫面：心裡有火、也有期待。別急，渴望是方向感；把它拆成小步驟，你會更快抵達。',
    '混亂+低落': '有些日子像在霧裡走路，慢一點也沒關係。你不是停滯，而是在重新整理內在的排序。先把自己照顧好，答案會更清楚。',
    '安心+均衡': '你的步調很穩，像把生活調到一個舒服的音量。穩定不是無聊，是你把自己照顧得很好——這是一種很稀有的能力。',
    '清醒+滿足': '你在許多時刻都很知道自己要什麼，也願意把每次完成收進心裡。這份清楚會讓你越走越踏實。',
    '低落+安心': '你學會在低潮裡替自己留一盞小燈。就算情緒往下，你仍在找讓自己好過的方法——這就是你的韌性。',
    '渴望+清醒': '你不只想要，你也在規劃。這種「想前進」又「有方法」的狀態很強——接下來只要持續，就會看到成果。',
    '混亂+激動': '腦內很熱鬧、心也很滿。當訊號太多時，先做一件小事就好：把混亂降到可處理的程度，你會重新找回掌控感。',
    '均衡+滿足': '你把自己安放得很好：不需要轟轟烈烈，也能感覺到日常的甜。把這份平衡留著，它會在忙亂時成為你的底氣。',
  };

  function pickTop(records){
    const score = Object.create(null);
    records.forEach(r => {
      const dots = Array.isArray(r?.dots) ? r.dots : [];
      for (let i=0;i<AXES.length;i++){
        const v = Number(dots[i]);
        if (!Number.isFinite(v)) continue;
        const dist = Math.abs(v - 50);
        const label = (v <= 50) ? AXES[i].left : AXES[i].right;
        score[label] = (score[label] || 0) + dist;
      }
    });
    return Object.entries(score).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  }

  function makeStory(records){
    if (!records || !records.length){
      return '這個月還沒有足夠的聲音紀錄可以生成回顧。先在「今日聲音地圖」完成分析並儲存，MIOMO 會慢慢把你的情緒地圖拼起來。';
    }
    const tops = pickTop(records);
    const a = tops[0];
    const b = tops[1];
    const key = (a && b) ? `${a}+${b}` : (a || '');
    if (BANK[key]) return BANK[key];
    if (a) return `這個月最常出現的狀態是「${a}」。它像一個提醒：你的內在正在說話。聽見它、照顧它，你會更靠近自己。`;
    return '這個月的情緒像一張地圖：有些地方明亮、有些地方安靜。你不需要把每一段都解釋清楚，光是走過，就已經很了不起。';
  }

  // --- typewriter ---
  let timer = null;
  function typewriter(text){
    if (!storyEl) return;
    if (timer) { clearTimeout(timer); timer = null; }
    const s = String(text || '');
    let i = 0;
    storyEl.textContent = '';
    const step = () => {
      i += 1;
      storyEl.textContent = s.slice(0, i);
      if (i < s.length){
        timer = setTimeout(step, 26);
      }
    };
    timer = setTimeout(step, 26);
  }

  function setDiaryOpen(open){
    if (!diary || !diaryToggle) return;
    diary.classList.toggle('is-open', open);
    diaryToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (diaryPanel) diaryPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  // --- undo stack (ImageData snapshots) ---
  const stack = [];
  const MAX_UNDO = 5;

  function drawingEnabled(){
    if (window.__MONTHLY_DRAW && typeof __MONTHLY_DRAW.enabled === 'boolean') return __MONTHLY_DRAW.enabled;
    if (drawCanvas) return (drawCanvas.style.pointerEvents && drawCanvas.style.pointerEvents !== 'none');
    return false;
  }

  function syncUndoUI(){
    const on = drawingEnabled();
    if (drawBtn) drawBtn.classList.toggle('is-on', on);
    if (undoBtn) undoBtn.style.display = on ? 'inline-block' : 'none';
  }

  function bindUndo(){
    if (!drawCanvas) return;

    // create undo button if missing (legacy layout)
    if (!undoBtn){
      const actions = document.getElementById('monthlyActions');
      if (actions){
        undoBtn = document.createElement('button');
        undoBtn.id = 'monthlyUndoBtn2';
        undoBtn.type = 'button';
        undoBtn.textContent = '回到上一步';
        actions.insertBefore(undoBtn, drawBtn || actions.firstChild);
      }
    }

    // snapshot before stroke starts
    if (!drawCanvas.__miomo_snap){
      drawCanvas.__miomo_snap = true;
      drawCanvas.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        if (!drawingEnabled()) return;
        try{
          const ctx = drawCanvas.getContext('2d');
          if (!ctx) return;
          stack.push(ctx.getImageData(0,0,drawCanvas.width, drawCanvas.height));
          while (stack.length > MAX_UNDO) stack.shift();
        }catch(e){}
      }, true);
    }

    if (undoBtn && !undoBtn.__miomo_bound){
      undoBtn.__miomo_bound = true;
      undoBtn.textContent = '回到上一步';
      undoBtn.addEventListener('click', () => {
        try{
          const ctx = drawCanvas.getContext('2d');
          const last = stack.pop();
          if (last) ctx.putImageData(last, 0, 0);
          else ctx.clearRect(0,0,drawCanvas.width, drawCanvas.height);
        }catch(e){}
      });
    }

    syncUndoUI();
  }

  // --- export (frame+logo+story) ---
  async function loadLogo(){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = "../image/logo@300x-8.png";
    });
  }
  function roundRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }

  async function exportPNG(story){
    if (!baseCanvas) return;
    const PAD = 56;
    const CARD_H = 220;
    const W = baseCanvas.width + PAD*2;
    const H = baseCanvas.height + PAD*2 + CARD_H;
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const ctx = out.getContext('2d');

    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0,0,W,H);

    // frame
    ctx.save();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#EA86AA';
    roundRect(ctx, 18, 18, W-36, H-36, 34);
    ctx.stroke();
    ctx.restore();

    const cx = PAD, cy = PAD;
    ctx.drawImage(baseCanvas, cx, cy);
    if (drawCanvas) ctx.drawImage(drawCanvas, cx, cy);

    // logo
    const logo = await loadLogo();
    if (logo){
      const targetW = Math.min(180, baseCanvas.width * 0.30);
      const ratio = logo.width ? (logo.height/logo.width) : 0.35;
      const lx = cx + (baseCanvas.width - targetW)/2;
      const ly = cy + 12;
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(logo, lx, ly, targetW, targetW*ratio);
      ctx.restore();
    }

    // story card
    const cardX = 46;
    const cardY = PAD + baseCanvas.height + 24;
    const cardW = W - 92;
    const cardH = CARD_H - 40;

    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#191919';
    ctx.font = '700 20px Arial';
    ctx.fillText('本月小回饋', cardX+18, cardY+34);

    ctx.fillStyle = 'rgba(25,25,25,0.78)';
    ctx.font = '400 15px Arial';
    const maxW = cardW - 36;
    const chars = String(story || '').split('');
    let line = '';
    const lines = [];
    for (const ch of chars){
      const test = line + ch;
      if (ctx.measureText(test).width > maxW){
        lines.push(line); line = ch;
      } else line = test;
    }
    if (line) lines.push(line);

    let yy = cardY + 62;
    const lh = 22;
    for (let i=0;i<lines.length;i++){
      if (yy > cardY + cardH - 14) break;
      ctx.fillText(lines[i], cardX+18, yy);
      yy += lh;
    }

    const a = document.createElement('a');
    a.download = 'MIOMO_月回顧.png';
    a.href = out.toDataURL('image/png');
    a.click();
  }

  // Make sure diary opens repeatedly
  function bindDiary(story){
    if (!diary || !diaryToggle) return;
    diary.style.display = '';
    setDiaryOpen(false);
    if (storyEl) storyEl.textContent = '';

    if (!diaryToggle.__miomo_toggle){
      diaryToggle.__miomo_toggle = true;
      diaryToggle.addEventListener('click', () => {
        const open = !diary.classList.contains('is-open');
        setDiaryOpen(open);
        if (open){
          typewriter(story);
        } else {
          if (timer) { clearTimeout(timer); timer = null; }
        }
      });
    } else {
      // already bound: just refresh story text on open
      diaryToggle.__miomo_story = story;
    }
  }

  // Rebind diary toggle to always use latest story
  if (diaryToggle && !diaryToggle.__miomo_proxy){
    diaryToggle.__miomo_proxy = true;
    diaryToggle.addEventListener('click', (e) => {
      if (diaryToggle.__miomo_story && diary && diary.classList.contains('is-open')){
        // when opening, the other handler will type; nothing to do
        return;
      }
    }, true);
  }

  function afterMonthlyGenerated(){
    // Only proceed if base canvas exists and monthly frame visible
    if (!baseCanvas) return;

    // Build story from session records
    const recs = (typeof _sessionGetDailyRecords === 'function') ? (_sessionGetDailyRecords() || []) : [];
    const story = makeStory(recs);

    bindUndo();
    bindDiary(story);

    // Save: ensure it works once (avoid double download)
    if (saveBtn && !saveBtn.__miomo_export){
      saveBtn.__miomo_export = true;
      saveBtn.addEventListener('click', async (e) => {
        // capture-phase: prevent other handlers from double-downloading
        e.preventDefault();
        e.stopPropagation();
        await exportPNG(story);
      }, true);
    }

    // sync draw UI after toggling draw
    if (drawBtn && !drawBtn.__miomo_sync){
      drawBtn.__miomo_sync = true;
      drawBtn.addEventListener('click', () => setTimeout(syncUndoUI, 0), true);
    }
    syncUndoUI();
  }

  // Trigger after click monthly button (render happens a bit later)
  if (monthlyBtn && !monthlyBtn.__miomo_fix){
    monthlyBtn.__miomo_fix = true;
    monthlyBtn.addEventListener('click', () => setTimeout(afterMonthlyGenerated, 450), true);
  }

  // Also run if monthly already visible
  setTimeout(afterMonthlyGenerated, 1200);
})();




/* =========================================================
   MIOMO MONTHLY STABILITY PATCH (Undo + Diary DOM + Save PNG)
  
========================================================= */
(() => {
  if (window.__MIOMO_MONTHLY_STABLE_PATCHED) return;
  window.__MIOMO_MONTHLY_STABLE_PATCHED = true;

  const monthlyFrame = document.getElementById('monthlyFrame');
  const baseCanvas = document.getElementById('monthlyCanvas');
  const drawCanvas = document.getElementById('monthlyDrawCanvas');

  const toolbar = document.getElementById('monthlyToolbar');
  const undoBtn = document.getElementById('monthlyUndoBtn') || document.getElementById('monthlyUndoBtn2');
  const drawBtn = document.getElementById('monthlyDrawBtn') || document.getElementById('drawToggleBtn');
  const saveBtn = document.getElementById('monthlySaveBtn') || document.getElementById('saveMonthlyBtn');
  const drawHint = document.getElementById('monthlyDrawHint');

  const diary = document.getElementById('monthlyDiary');
  const diaryToggle = document.getElementById('monthlyDiaryToggle');
  const diaryPanel = document.getElementById('monthlyDiaryPanel');

  if (!monthlyFrame || !baseCanvas || !drawCanvas) return;

  // -------------------------
  // A) Helpers
  // -------------------------
  const $ = (sel, root=document) => root.querySelector(sel);

  function isDrawEnabled() {
    try {
      const pe = getComputedStyle(drawCanvas).pointerEvents;
      return pe && pe !== 'none';
    } catch (e) {
      return false;
    }
  }

  function syncDrawUI() {
    const on = isDrawEnabled() || (window.__MONTHLY_DRAW && window.__MONTHLY_DRAW.enabled);
    if (drawBtn) drawBtn.classList.toggle('is-on', !!on);

    // Undo：繪製開啟才顯示
    if (undoBtn) undoBtn.style.display = on ? 'inline-block' : 'none';

    // hint：繪製開啟才顯示
    if (drawHint) drawHint.style.display = on ? '' : 'none';
  }

  // 強制修正 HTML 結構
  function fixDiaryDOM() {
    if (!diary || !diaryPanel) return null;

    // ensure frame wrapper
    let frame = $('.monthly-diary-frame', diaryPanel);
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'monthly-diary-frame';
      // move existing children into frame
      const kids = Array.from(diaryPanel.childNodes);
      kids.forEach(k => frame.appendChild(k));
      diaryPanel.appendChild(frame);
    }

    let card = document.getElementById('monthlyStoryCard');
    if (!card) {
      card = document.createElement('div');
      card.className = 'analysis-card monthly-story-card';
      card.id = 'monthlyStoryCard';
      frame.appendChild(card);
    } else if (!frame.contains(card)) {
      frame.appendChild(card);
    }
    card.style.display = ''; 

    let title = document.getElementById('monthlyStoryTitle');
    if (!title) {
      title = document.createElement('div');
      title.className = 'emotion-title';
      title.id = 'monthlyStoryTitle';
      title.textContent = '本 月 小 回 饋';
      card.appendChild(title);
    } else if (!card.contains(title)) {
      card.insertBefore(title, card.firstChild);
    }

    let storyEl = document.getElementById('monthlyStoryText');
    if (!storyEl) {
      storyEl = document.createElement('div');
      storyEl.className = 'analysis-text';
      storyEl.id = 'monthlyStoryText';
      card.appendChild(storyEl);
    } else if (!card.contains(storyEl)) {
      storyEl.classList.add('analysis-text');
      card.appendChild(storyEl);
    }

  
    card.classList.add('monthly-story-card');

    return { card, title, storyEl };
  }

  
  function getRecords() {
    try {
      if (typeof _sessionGetDailyRecords === 'function') return _sessionGetDailyRecords() || [];
    } catch (e) {}
    return [];
  }

  function makeStory(records) {
   
    if (typeof window.makeStory === 'function') {
      try { return window.makeStory(records); } catch (e) {}
    }

   
    const AXES = [
      { left: '激動', right: '安心' },
      { left: '清醒', right: '混亂' },
      { left: '滿足', right: '渴望' },
      { left: '高亢', right: '低落' },
      { left: '均衡', right: '極端' },
    ];

    const acc = new Array(5).fill(0);
    let n = 0;

    (records || []).forEach(r => {
      const dots = Array.isArray(r?.dots) ? r.dots : null;
      if (!dots || dots.length < 5) return;
      for (let i = 0; i < 5; i++) acc[i] += Number(dots[i]) || 0;
      n++;
    });

    if (!n) {
      return '這個月的記錄還不多，但沒關係。\n你願意留下聲音這件事，本身就很勇敢。';
    }

    const avg = acc.map(v => v / n);
    const scored = avg.map((v, i) => {
      const d = Math.abs(v - 50); // 偏離越大越明顯
      const side = v < 50 ? 'left' : 'right';
      const word = AXES[i][side];
      return { i, d, word, v };
    }).sort((a,b) => b.d - a.d);

    const top1 = scored[0]?.word || '平靜';
    const top2 = scored[1]?.word || '穩定';

    return `這個月，你的聲音常常落在「${top1}」與「${top2}」之間。\n有些時候你很確定、有方向；有些時候你也允許自己慢一點。\n不管現在你在哪裡，這些聲音都在替你記錄：你正在前進。`;
  }

  
  let typeTimer = null;
  function typewriter(el, text, speed = 24) {
    if (!el) return;
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    el.textContent = '';
    const str = String(text || '');
    let i = 0;
    const step = () => {
      el.textContent += str.charAt(i++);
      if (i <= str.length) typeTimer = setTimeout(step, speed);
      else typeTimer = null;
    };
    step();
  }

  
  const MAX_UNDO = 5;
  const undoStack = [];

  function pushSnapshot() {
    try {
      const ctx = drawCanvas.getContext('2d');
      if (!ctx) return;
      const img = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
      undoStack.push(img);
      while (undoStack.length > MAX_UNDO) undoStack.shift();
    } catch (e) {}
  }

  function undoOnce() {
    try {
      const ctx = drawCanvas.getContext('2d');
      if (!ctx) return;
      const last = undoStack.pop();
      if (last) ctx.putImageData(last, 0, 0);
      else ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    } catch (e) {}
  }

  
  if (!drawCanvas.__miomo_undo_bound) {
    drawCanvas.__miomo_undo_bound = true;

    drawCanvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (!isDrawEnabled() && !(window.__MONTHLY_DRAW && window.__MONTHLY_DRAW.enabled)) return;
      pushSnapshot();
      
      syncDrawUI();
    }, true);
  }

  if (undoBtn && !undoBtn.__miomo_undo_click) {
    undoBtn.__miomo_undo_click = true;
    undoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      undoOnce();
      syncDrawUI();
    }, true);
  }

 
  function setDiaryOpen(open) {
    if (!diary) return;
    diary.classList.toggle('is-open', !!open);
    if (diaryToggle) diaryToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (diaryPanel) diaryPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function bindDiary(storyText) {
    const dom = fixDiaryDOM();
    if (!dom) return;
    const { storyEl } = dom;

   
    setDiaryOpen(false);
    if (storyEl) storyEl.textContent = '';

    if (diary) diary.style.display = ''; 
    if (!diaryToggle) return;

    
    if (!diaryToggle.__miomo_diary_capture) {
      diaryToggle.__miomo_diary_capture = true;
      diaryToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        const open = !diary.classList.contains('is-open');
        setDiaryOpen(open);

        if (open) {
         
          const latest = (diaryToggle && diaryToggle.__miomo_story_text) || (diary && diary.__miomo_story_text) || storyText;
          typewriter(storyEl, latest, 24);
        } else {
          if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
        }
      }, true);
    }

   
    diaryToggle.__miomo_story_text = storyText;
    diary.__miomo_story_text = storyText;
  }

  
  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image load failed'));
      img.src = src;
    });
  }

  async function exportMonthlyPNG(storyText) {
  const W = baseCanvas.width;
  const H = baseCanvas.height;
  const PAD = 48;

  const OUT_W = W + PAD * 2;

  // -------- wrap story text to lines (so we can compute height) --------
  const text = String(storyText || '').trim();
  const tmp = document.createElement('canvas');
  const tctx = tmp.getContext('2d');
  const titleFont = '700 20px Arial';
  const bodyFont  = '400 15px Arial';
  const lineH = 22;

  const marginX = 46;
  const cardX = marginX;
  const cardW = OUT_W - marginX * 2;
  const maxW = cardW - 36;

  const lines = [];
  if (tctx && text) {
    tctx.font = bodyFont;

    const paragraphs = text.split('\n');
    for (const p of paragraphs) {
      if (!p) { lines.push(''); continue; }
      let line = '';
      for (const ch of p) {
        const test = line + ch;
        if (tctx.measureText(test).width > maxW) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    }
  }

 
  const titleBlockH = 62;
  const bottomPad = 18;
  const minCardH = 170;

  const cardH = Math.max(minCardH, titleBlockH + (lines.length ? lines.length : 1) * lineH + bottomPad);

  
  const cardY = PAD + H + 24;

  // OUT_H includes story card fully
  const OUT_H = cardY + cardH + PAD;

  const out = document.createElement('canvas');
  out.width = OUT_W;
  out.height = OUT_H;
  const ctx = out.getContext('2d');
  if (!ctx) return;

  // 背景
  ctx.clearRect(0, 0, OUT_W, OUT_H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  // 外框
  ctx.save();
  roundRect(ctx, 12, 12, OUT_W - 24, OUT_H - 24, 22);
  ctx.strokeStyle = 'rgba(234, 134, 170, 0.95)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  
  ctx.save();
  roundRect(ctx, PAD, PAD, W, H, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.98)';
  ctx.fill();
  ctx.restore();

 
  ctx.drawImage(baseCanvas, PAD, PAD, W, H);
  try { ctx.drawImage(drawCanvas, PAD, PAD, W, H); } catch (e) {}

  
  const logoEl = document.getElementById('monthlyLogoOverlay');
  const logoSrc = logoEl ? logoEl.getAttribute('src') : null;
  if (logoSrc) {
    try {
      const logo = await loadImage(logoSrc);
      const lw = 150;
      const lh2 = (logo.naturalHeight && logo.naturalWidth) ? (lw * logo.naturalHeight / logo.naturalWidth) : 40;
      const lx = (OUT_W - lw) / 2;
      const ly = PAD + 14;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(logo, lx, ly, lw, lh2);
      ctx.globalAlpha = 1;
    } catch (e) {}
  }

  // ---------- story card below stage ----------
  if (text) {
    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#191919';
    ctx.font = titleFont;
    ctx.fillText('本月小回饋', cardX + 18, cardY + 34);

    ctx.fillStyle = 'rgba(25,25,25,0.78)';
    ctx.font = bodyFont;

    let yy = cardY + 62;
    const drawLines = lines.length ? lines : [text];
    for (let i = 0; i < drawLines.length; i++) {
      ctx.fillText(drawLines[i], cardX + 18, yy);
      yy += lineH;
    }
  }

  // download
  const a = document.createElement('a');
  a.download = 'MIOMO_月回顧.png';
  a.href = out.toDataURL('image/png');
  a.click();
}

  if (saveBtn && !saveBtn.__miomo_save_capture) {
    saveBtn.__miomo_save_capture = true;
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      
      const story = makeStory(getRecords());

      
      const dom = fixDiaryDOM();
      if (dom && dom.storyEl) dom.storyEl.textContent = dom.storyEl.textContent || '';

      await exportMonthlyPNG(story);
    }, true);
  }

  
  function afterMonthlyGenerated() {
    
    const story = makeStory(getRecords());
    bindDiary(story);
    syncDrawUI();
  }

  
  const monthlyBtn = document.getElementById('monthlyBtn');
  const monthlyBtnWeekly = document.getElementById('monthlyBtnWeekly');

  const hookMonthly = (btn) => {
    if (!btn || btn.__miomo_monthly_hook) return;
    btn.__miomo_monthly_hook = true;
    btn.addEventListener('click', () => setTimeout(afterMonthlyGenerated, 450), true);
  };
  hookMonthly(monthlyBtn);
  hookMonthly(monthlyBtnWeekly);

  
  if (drawBtn && !drawBtn.__miomo_draw_sync) {
    drawBtn.__miomo_draw_sync = true;
    drawBtn.addEventListener('click', () => setTimeout(syncDrawUI, 0), true);
  }

 
  setTimeout(afterMonthlyGenerated, 1200);
})();




/* =========================================================
   MIOMO MONTHLY STORY PATCH V2 (Dynamic by saved dots)
   
========================================================= */
(() => {
  if (window.__MIOMO_MONTHLY_STORY_V2) return;
  window.__MIOMO_MONTHLY_STORY_V2 = true;

  
  const AXES_CN = [
    { left: '激動', right: '安心' }, // excitedto_calm
    { left: '清醒', right: '混亂' }, // clearto_confused
    { left: '滿足', right: '渴望' }, // satisfiedto_yearning
    { left: '高亢', right: '低落' }, // energeticto_depressed
    { left: '均衡', right: '極端' }  // balancedto_extreme
  ];

  
  const POLE_META = {
    '激動': { img: '像心跳踩了加速鍵', care: '把能量放回呼吸裡，讓它有出口而不是爆衝。', fun: '你這個月的情緒有點像 K-pop 副歌：一下就上頭。' },
    '安心': { img: '像被放回安全的枕頭', care: '允許自己慢下來，安心不是停滯，是在充電。', fun: '你很會把自己「放好」，這是超稀有技能。' },
    '清醒': { img: '像把光打在重點上', care: '你的聲音很知道要往哪裡走，記得也留一點柔軟給自己。', fun: '清醒值很高：像自帶「人生導航」模式。' },
    '混亂': { img: '像思緒在房間裡繞圈圈', care: '先把最重要的一件事放到手心，其他先不用同時解決。', fun: '混亂不是壞事，有時只是腦內分頁開太多。' },
    '滿足': { img: '像剛剛好的一口溫熱', care: '你正在累積「夠了」的感覺，別急著把幸福往後推。', fun: '滿足感在線：恭喜你收集到「小確幸」碎片。' },
    '渴望': { img: '像手伸向還沒到的地方', care: '你在追尋某個你很在意的答案，慢慢走也算前進。', fun: '渴望值偏高：像在跟未來的自己打暗號。' },
    '高亢': { img: '像音量旋鈕被轉亮', care: '這股亮度很迷人，也記得給自己一些安靜的回合。', fun: '高亢狀態：你這個月真的很會發光（但別燒乾）。' },
    '低落': { img: '像把燈調暗、把自己收起來', care: '低落不是失敗，是需要被照顧的訊號；先從好好睡一覺開始。', fun: '如果這個月是一首歌，低落像是「前奏」：慢，但很真。' },
    '均衡': { img: '像穩定的呼吸與節奏', care: '你在把生活擺回一個舒服的位置，這很不容易，也很值得。', fun: '均衡狀態：情緒像 Wi‑Fi 一樣穩，恭喜不卡。' },
    '極端': { img: '像張力拉滿的對比', care: '情緒起伏很用力時，給自己一個「先暫停」的權利。', fun: '極端值高：你這個月像在拍 MV，戲劇性拉滿。' }
  };

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

 
  function stablePick(list, seedStr){
    if (!Array.isArray(list) || !list.length) return '';
    const s = String(seedStr || '');
    let h = 0;
    for (let i = 0; i < s.length; i++){
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(h) % list.length;
    return list[idx];
  }

  function getDotsFromRecord(rec){
    const d = rec && rec.dots;
    if (!Array.isArray(d) || d.length < 5) return null;
    return d.map(x => Number(x));
  }

  
  function calcPoleProfile(records){
    const poleScore = Object.create(null);
    const poleCount = Object.create(null);
    const axisLR = AXES_CN.map(() => ({L:0, R:0}));

    let used = 0;
    for (const r of (Array.isArray(records) ? records : [])){
      const dots = getDotsFromRecord(r);
      if (!dots) continue;
      used++;
      for (let i=0;i<5;i++){
        const v = dots[i];
        if (!Number.isFinite(v)) continue;
        const dist = Math.abs(v - 50);
        
        const w = Math.max(0, dist - 3); 
        if (w <= 0) continue;

        const left = AXES_CN[i].left;
        const right = AXES_CN[i].right;
        if (v <= 50){
          poleScore[left] = (poleScore[left] || 0) + w;
          poleCount[left] = (poleCount[left] || 0) + 1;
          axisLR[i].L += w;
        } else {
          poleScore[right] = (poleScore[right] || 0) + w;
          poleCount[right] = (poleCount[right] || 0) + 1;
          axisLR[i].R += w;
        }
      }
    }

    const total = Object.values(poleScore).reduce((a,b)=>a+b,0);
    const ranked = Object.entries(poleScore).sort((a,b)=>b[1]-a[1]).map(([k])=>k);

    return { used, poleScore, poleCount, total, ranked, axisLR };
  }

  function formatTopLine(top1, top2, pct1, pct2){
  
    const seed = `${top1}|${top2}`;
    const options = [
      `這個月你的聲音最常靠近「${top1}」，也常常出現「${top2}」。`,
      `把這個月的聲音攤開來看，「${top1}」是主旋律，「${top2}」是很常出現的和聲。`,
      `你的月回顧裡，「${top1}」的痕跡最明顯，「${top2}」也悄悄跟著出現。`
    ];
    const base = stablePick(options, seed);
   
    const p1 = Number.isFinite(pct1) ? `（${Math.round(pct1)}%）` : '';
    const p2 = Number.isFinite(pct2) ? `（${Math.round(pct2)}%）` : '';
    return `${base} ${top1}${p1} / ${top2}${p2}`;
  }

  function maybeSwingLine(axisLR){
   
    let best = null;
    for (let i=0;i<axisLR.length;i++){
      const L = axisLR[i].L || 0;
      const R = axisLR[i].R || 0;
      const sum = L + R;
      if (sum < 18) continue; 
      const bal = Math.min(L,R) / Math.max(1, Math.max(L,R)); 
      if (bal < 0.35) continue;
      const score = sum * bal;
      if (!best || score > best.score){
        best = { i, score };
      }
    }
    if (!best) return '';
    const left = AXES_CN[best.i].left;
    const right = AXES_CN[best.i].right;
    const seed = `${left}|${right}|swing`;
    const opts = [
      `而且你似乎常在「${left}」與「${right}」之間來回——那不是矛盾，而是你正在適應與調整。`,
      `你也有幾段時間在「${left}」和「${right}」之間切換，像在找一個最剛好的節奏。`,
      `這個月的你，有時靠近「${left}」，有時又回到「${right}」，像情緒在練習呼吸。`
    ];
    return stablePick(opts, seed);
  }

  function makeMonthlyStory(records){
    const prof = calcPoleProfile(records);
    const n = prof.used;

    if (!n){
      return '這個月的記錄還不多，但沒關係。你願意留下聲音這件事，本身就很勇敢。';
    }

   
    if (!prof.total || prof.total < 10){
      const seed = `neutral|${n}`;
      const opts = [
        `這個月你的聲音多半維持在「剛剛好」的範圍裡，起伏不大，像在慢慢把自己放回穩定。你願意留下這些片段，本身就很勇敢。`,
        `你的月回顧看起來很「平穩」：沒有被某一種情緒拉著跑。這是一種很難得的力量——知道怎麼把自己拉回來。`,
        `這個月像是在練習呼吸：不急、不吵，但很踏實。可以繼續把聲音當作小日記，慢慢拼出你的節奏。`
      ];
      return stablePick(opts, seed);
    }

    const top1 = prof.ranked[0] || '均衡';
    const top2 = prof.ranked[1] || '均衡';
    const top3 = prof.ranked[2] || '';

    const pct = (k) => prof.poleScore[k] ? (prof.poleScore[k] / prof.total * 100) : 0;
    const pct1 = pct(top1);
    const pct2 = pct(top2);

    const m1 = POLE_META[top1] || { img: '', care: '', fun: '' };
    const m2 = POLE_META[top2] || { img: '', care: '', fun: '' };

    
    const hasLow = (top1 === '低落' || top2 === '低落' || top1 === '混亂' || top2 === '混亂');
    const hasHigh = (top1 === '極端' || top2 === '極端' || top1 === '高亢' || top2 === '高亢' || top1 === '激動' || top2 === '激動');
    const mode = hasLow ? 'gentle' : (hasHigh ? 'fun' : 'mix');

    const head = `本月小回饋（${n}筆聲音紀錄）\n`;
    const line1 = formatTopLine(top1, top2, pct1, pct2);

   
    const seed = `${top1}+${top2}+${n}`;
    const midOptions = [
      `「${top1}」${m1.img}；「${top2}」${m2.img}。這些不是評分，是你在這段時間裡，最真實的內在訊號。`,
      `如果把情緒想成天氣：${top1} 像一種主氣候，${top2} 像常出現的雲層。你一直都有在感受，也一直在走。`,
      `這兩個狀態一起出現其實很合理：${top1} 帶你往外走，${top2} 讓你往內收。你正在找到兩者之間的平衡。`
    ];
    const line2 = stablePick(midOptions, seed);

    const swing = maybeSwingLine(prof.axisLR);

    
    const gentleEnds = [
      `${m1.care} ${m2.care} 你不需要一次變好，只要記得：你一直都在照顧自己。`,
      `${m1.care} ${m2.care} 允許自己慢慢來，情緒會跟著你找到出口。`,
      `${m1.care} ${m2.care} 有些日子只要活著就很棒了。`
    ];
    const funEnds = [
      `${m1.fun} ${m2.fun} 但不管怎樣，能留下聲音真的很酷。`,
      `${m1.fun} ${m2.fun} 記得：你不是情緒，你是在經歷情緒的人。`,
      `${m1.fun} ${m2.fun} 你願意記錄它們，本身就是一種超能力。`
    ];
    const mixEnds = [
      `${m1.care} ${m2.fun} 你正在用自己的方式把生活調音。`,
      `${m1.fun} ${m2.care} 你把情緒留下來，之後就更容易把自己找回來。`,
      `${m1.care} ${m2.care} 也別忘了：你願意留下聲音，本身就很勇敢。`
    ];
    const line3 = stablePick(
      mode === 'gentle' ? gentleEnds : (mode === 'fun' ? funEnds : mixEnds),
      seed + '|end'
    );

    
    let tail = '';
    if (top3 && pct(top3) >= 18){
      const m3 = POLE_META[top3] || { img: '' };
      const opts = [
        `另外，「${top3}」也很常探頭：${m3.img}。`,
        `同時你也帶著一些「${top3}」：${m3.img}。`
      ];
      tail = '\n' + stablePick(opts, `${top1}+${top2}+${top3}`);
    }

    return [head + line1, line2, swing, line3 + tail].filter(Boolean).join('\n');
  }

 
  window.makeMonthlyStory = makeMonthlyStory;

 
  window.makeStory = makeMonthlyStory;

})();
