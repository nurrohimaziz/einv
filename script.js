'use strict';

/* ── DOM refs ── */
const audio          = document.getElementById('wedding-audio');
const introOverlay   = document.getElementById('intro-overlay');
const introBtn       = document.getElementById('intro-btn');
const mainContent    = document.getElementById('main-content');
const musicPlayer    = document.getElementById('music-player');

const vinylDisc      = document.getElementById('vinyl-disc');

const heroPlayBtn    = document.getElementById('hero-play-btn');
const heroPlayIcon   = document.getElementById('hero-play-icon');
const heroPauseIcon  = document.getElementById('hero-pause-icon');

const playerPlayBtn  = document.getElementById('player-play-btn');
const playerPlayIcon = document.getElementById('player-play-icon');
const playerPauseIcon= document.getElementById('player-pause-icon');

const progressBar    = document.getElementById('progress-bar');
const progressFill   = document.getElementById('progress-fill');
const progressThumb  = document.getElementById('progress-thumb');
const currentTimeEl  = document.getElementById('current-time');
const totalTimeEl    = document.getElementById('total-time');

const seeAllBtn   = document.getElementById('toggle-moments');
const momentsPage = document.getElementById('moments-page');
const backBtn     = document.getElementById('back-btn');

/* ─────────────────────────────────────────
   STATE & HELPERS
───────────────────────────────────────── */
let isPlaying = false;

function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

function formatTime(sec) {
  if (!isFinite(sec) || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${pad(s)}`;
}

/* Update every UI element that reflects play/pause state */
function applyPlayState(playing) {
  isPlaying = playing;

  /* Hero button */
  heroPlayIcon.classList.toggle('hidden', playing);
  heroPauseIcon.classList.toggle('hidden', !playing);

  /* Player button */
  playerPlayIcon.classList.toggle('hidden', playing);
  playerPauseIcon.classList.toggle('hidden', !playing);

  /* Vinyl */
  vinylDisc.classList.toggle('playing', playing);

  /* EQ bars — show on first track while playing */
  document.querySelectorAll('.eq-bars').forEach(el => el.classList.remove('active'));
  if (playing) document.getElementById('eq-1').classList.add('active');
}

function play() {
  audio.play().then(() => applyPlayState(true)).catch(() => applyPlayState(false));
}
function pause() {
  audio.pause();
  applyPlayState(false);
}
function togglePlay() { isPlaying ? pause() : play(); }

/* ─────────────────────────────────────────
   INTRO OVERLAY
───────────────────────────────────────── */
// 1. Kunci scroll saat web baru pertama kali dimuat
document.body.style.overflow = 'hidden';

introBtn.addEventListener('click', () => {
  /* 2. Pastikan halaman di-reset ke posisi paling atas */
  window.scrollTo(0, 0);

  /* 3. Kembalikan kemampuan scroll pada halaman utama */
  document.body.style.overflow = '';

  /* 4. Fade out overlay */
  introOverlay.classList.add('fade-out');

  /* 5. Reveal main content */
  mainContent.classList.add('visible');

  /* 6. Show player */
  musicPlayer.classList.add('visible');

  /* 7. Start music */
  play();
});

/* ─────────────────────────────────────────
   PLAY / PAUSE CONTROLS
───────────────────────────────────────── */
heroPlayBtn.addEventListener('click', togglePlay);
playerPlayBtn.addEventListener('click', togglePlay);

/* ─────────────────────────────────────────
   AUDIO EVENTS → PROGRESS BAR + TIME
───────────────────────────────────────── */
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width  = pct + '%';
  progressThumb.style.left  = pct + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(pct));
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => applyPlayState(false));

/* ─────────────────────────────────────────
   SEEK ON PROGRESS BAR CLICK
───────────────────────────────────────── */
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audio.duration) audio.currentTime = pct * audio.duration;
});

/* ─────────────────────────────────────────
   HEART / LIKE BUTTONS (toggle)
───────────────────────────────────────── */
document.querySelectorAll('.heart-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('liked'));
});

/* ─────────────────────────────────────────
   TRACK ROW CLICK — EQ visual swap
───────────────────────────────────────── */
[1, 2, 3].forEach(i => {
  document.getElementById('track-' + i).addEventListener('click', () => {
    document.querySelectorAll('.eq-bars').forEach(el => el.classList.remove('active'));
    if (isPlaying) document.getElementById('eq-' + i).classList.add('active');
  });
});

/* ─────────────────────────────────────────
   COUNTDOWN TIMER
───────────────────────────────────────── */
(function initCountdown() {
  const target = new Date('2026-05-12T08:00:00+07:00').getTime();
  const els    = {
    days: document.getElementById('cd-days'),
    hrs:  document.getElementById('cd-hrs'),
    min:  document.getElementById('cd-min'),
    sec:  document.getElementById('cd-sec'),
  };
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach(el => el.textContent = '00');
      return;
    }
    els.days.textContent = pad(diff / 86400000);
    els.hrs.textContent  = pad((diff % 86400000) / 3600000);
    els.min.textContent  = pad((diff % 3600000)  / 60000);
    els.sec.textContent  = pad((diff % 60000)    / 1000);
  }
  tick();
  setInterval(tick, 1000);
})();

if (seeAllBtn && momentsPage && backBtn) {
  // Buka halaman baru
  seeAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    momentsPage.classList.add('active');
    momentsPage.setAttribute('aria-hidden', 'false');
    
    // Mencegah body utama bisa di-scroll saat overlay terbuka
    document.body.style.overflow = 'hidden'; 
  });

  // Tutup halaman (tombol kembali)
  backBtn.addEventListener('click', () => {
    momentsPage.classList.remove('active');
    momentsPage.setAttribute('aria-hidden', 'true');
    
    // Kembalikan kemampuan scroll di body utama
    document.body.style.overflow = '';
  });
}

/* ─────────────────────────────────────────
   SCROLL REVEAL (FADE-ON-SCROLL)
───────────────────────────────────────── */
const fadeElements = document.querySelectorAll('.fade-section');

const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    // Jika elemen terlihat di layar (minimal 15%)
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      
      // Hentikan observasi agar animasi hanya terjadi 1x saat pertama kali discroll ke bawah
      observer.unobserve(entry.target);
    }
  });
}, {
  root: null,
  rootMargin: '0px',
  threshold: 0.15 // Animasi mulai saat 15% bagian elemen sudah masuk layar
});

// Pasang sensor ke semua elemen yang punya class .fade-section
fadeElements.forEach(el => {
  fadeObserver.observe(el);
});