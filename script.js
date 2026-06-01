(function () {
  'use strict';

  /* ──SURPRISE OVERLAY ──────────────────────────────── */
const surpriseOverlay = document.getElementById('surpriseOverlay');
const surpriseBtn     = document.getElementById('surpriseBtn');

if (surpriseBtn) {
  surpriseBtn.addEventListener('click', () => {
    surpriseOverlay.classList.add('hide');
    setTimeout(() => {
      surpriseOverlay.style.display = 'none';
      // Mulai BGM setelah klik tombol
      if (!bgmPlaying && bgm) {
        bgm.volume = 0.05;
        bgm.play().catch(() => {});
        bgmPlaying = true;
        vinyl && vinyl.classList.add('playing');
      }
    }, 800);
  });
}

  /* ──BGM CONTROL ────────────────────────────────────── */
  const bgm      = document.getElementById('bgm');
  const musicBtn = document.getElementById('musicBtn');
  const vinyl    = musicBtn ? musicBtn.querySelector('.vinyl') : null;
  let   bgmPlaying = false;

  function toggleBGM() {
    if (!bgm) return;
    if (bgmPlaying) {
      bgm.pause();
      vinyl && vinyl.classList.remove('playing');
      bgmPlaying = false;
    } else {
      bgm.volume = 0.05;
      bgm.play().catch(() => {});
      vinyl && vinyl.classList.add('playing');
      bgmPlaying = true;
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', toggleBGM);
  }

  /* ──CANVAS PARTICLES ───────────────────────────────── */
  const canvas = document.getElementById('particles');
  const ctx    = canvas && canvas.getContext('2d');
  let   particles = [];
  let   W, H;

  function resizeCanvas() {
    if (!canvas) return;
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLORS = ['#c8a97e', '#e8a4a0', '#c0623a', '#7a8c6a', '#f5ede0'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 10;
      this.r    = Math.random() * 2.5 + 0.5;
      this.vx   = (Math.random() - 0.5) * 0.4;
      this.vy   = -(Math.random() * 0.5 + 0.2);
      this.life = 0;
      this.maxLife = Math.random() * 300 + 150;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.shape = Math.random() > 0.7 ? 'star' : 'circle';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.y < -10 || this.life > this.maxLife) this.reset(false);
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      if (this.shape === 'star') {
        drawStar(ctx, this.x, this.y, 4, this.r * 2, this.r);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  if (ctx) {
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      ctx.globalAlpha = 1;
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ──POLAROID 3D TILT ───────────────────────────────── */
  const tiltEls = document.querySelectorAll('[data-tilt]');

  tiltEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `
        rotate(0deg)
        perspective(600px)
        rotateY(${dx * 10}deg)
        rotateX(${-dy * 10}deg)
        scale(1.05)
        translateY(-8px)
      `;
    });
    el.addEventListener('mouseleave', () => {
      const rot = el.style.getPropertyValue('--rot') || '0deg';
      el.style.transform = `rotate(${rot})`;
      el.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
  });

  /* ──LIGHTBOX ───────────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightboxImg');
  const lbCaption    = document.getElementById('lightboxCaption');
  const lbClose      = document.getElementById('lightboxClose');
  const lbPrev       = document.getElementById('lightboxPrev');
  const lbNext       = document.getElementById('lightboxNext');

  const polaroids    = Array.from(document.querySelectorAll('.polaroid'));
  let   currentIndex = 0;

  function openLightbox(idx) {
    currentIndex = idx;
    const p      = polaroids[idx];
    const img    = p.querySelector('img');
    const cap    = p.querySelector('.polaroid-caption span');
    lbImg.src    = img ? img.src : '';
    lbImg.alt    = img ? img.alt : '';
    lbCaption.textContent = cap ? cap.textContent : '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  function prevPhoto() {
    currentIndex = (currentIndex - 1 + polaroids.length) % polaroids.length;
    openLightbox(currentIndex);
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % polaroids.length;
    openLightbox(currentIndex);
  }

  polaroids.forEach((p, i) => {
    p.addEventListener('click', () => openLightbox(i));
  });

  lbClose && lbClose.addEventListener('click', closeLightbox);
  lbPrev  && lbPrev .addEventListener('click', prevPhoto);
  lbNext  && lbNext .addEventListener('click', nextPhoto);

  lightbox && lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevPhoto();
    if (e.key === 'ArrowRight')  nextPhoto();
  });

  /* ──VIDEO PLAY/PAUSE ───────────────────────────────── */
  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach(card => {
    const video = card.querySelector('video');
    const btn   = card.querySelector('.play-btn');

    if (!video) return;

    function toggleVideo() {
      if (video.paused) {
        // Pause all others first
        videoCards.forEach(c => {
          const v = c.querySelector('video');
          if (v && v !== video && !v.paused) {
            v.pause();
            c.classList.remove('playing');
          }
        });
        video.muted = false;
        video.play();
        card.classList.add('playing');
        if (btn) btn.textContent = '⏸';
      } else {
        video.pause();
        card.classList.remove('playing');
        if (btn) btn.textContent = '▶';
      }
    }

    card.querySelector('.video-overlay').addEventListener('click', toggleVideo);

    video.addEventListener('ended', () => {
      card.classList.remove('playing');
      if (btn) btn.textContent = '▶';
    });
  });

  /* ──QUOTES ROTATOR ─────────────────────────────────── */
  const quotes = [
    { text: "Semua orang hanyalah alat. Tidak masalah bagaimana itu dilakukan. Tidak masalah apa yang perlu dikorbankan. Didunia ini, menang adalah segalanya. Selama aku menang pada akhirnya ... Itu yang terpenting.",author: "— Ayanokouji Kiytakan" },
    { text: "Hidup bukanlah permainan keberuntungan. Jika kau ingin menang, kau harus bekerja keras.",author: "— Sora" },
    { text: "To defeat EVIL, I must become a greater EVIL",author: "— lelouch" },
    { text: "If We Ever Return To The Real World, I'll Definitely Find You And Fall In Love With You All Over Again.",author: "— Asuna SAO" },
    { text: "Gapapa Sangean Asal Sopan",author: "— Karissa Sharlotte" },
    { text: "Karena pahlawan Himmel akan melakukannya",author: "— Frieren" },
    { text: "Nah, I'd Win",author: "— Jujur Kasian" },
    { text: "hhhh capek jadi Vtuber ngomong terus, ciuman aja yuk lebih enak",author: "— Karissa Sharlotte" },
    { text: "Kerja Jangan Sangean",author: "— Karrisa Sharlotte" },
    { text: "Mandi lo semua Bgst",author: "— Karissa Sharlotte" },
  ];

  let quoteIndex   = 0;
  const quoteText  = document.getElementById('quoteText');
  const quoteAuth  = document.getElementById('quoteAuthor');
  const quoteNext  = document.getElementById('quoteNext');

  function changeQuote() {
    if (!quoteText || !quoteAuth) return;
    quoteText.classList.add('fade');
    quoteAuth.classList.add('fade');
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      quoteText.textContent = quotes[quoteIndex].text;
      quoteAuth.textContent = quotes[quoteIndex].author;
      quoteText.classList.remove('fade');
      quoteAuth.classList.remove('fade');
    }, 380);
  }

  quoteNext && quoteNext.addEventListener('click', changeQuote);

  // Auto rotate every 100 seconds
  setInterval(changeQuote, 100000);

  /* ──YEAR FOOTER ────────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ──FLOATING EMOJI ─────────────────────────────────── */
  const floatingContainer = document.getElementById('floatingItems');
  const emojis = ['🎀', '😈', '💚', '✨', '🎉', '♠️', '😍', '💛', '🌿', '⭐', '🔱', '♥️'];

  function createFloatingEmoji() {
    if (!floatingContainer) return;
    const el = document.createElement('span');
    el.className = 'float-emoji';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.bottom = '-40px';
    el.style.setProperty('--dur', (Math.random() * 10 + 10) + 's');
    el.style.setProperty('--del', (Math.random() * 5) + 's');
    floatingContainer.appendChild(el);
    setTimeout(() => el.remove(), 22000);
  }

  // Spawn emoji periodically
  setInterval(createFloatingEmoji, 1800);
  for (let i = 0; i < 6; i++) setTimeout(createFloatingEmoji, i * 600);

  /* ──SCROLL REVEAL──────────── */
  const revealEls = document.querySelectorAll('.gallery-heading, .video-section .gallery-heading, .quote-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  /* ──PARALLAX HERO ─────────────────────────────────── */
  const hero = document.querySelector('.hero');
  window.addEventListener('scroll', () => {
    if (!hero) return;
    const y = window.scrollY;
    hero.style.transform = `translateY(${y * 0.3}px)`;
    hero.style.opacity   = 1 - y / 500;
  }, { passive: true });

  /* ──CUSTOM CURSOR TRAIL ───────────────────────────── */
  const trail = [];
  const TRAIL_LEN = 5;
  for (let i = 0; i < TRAIL_LEN; i++) {
    const d = document.createElement('div');
    d.style.cssText = `
      position: fixed;
      width: ${6 + i}px; height: ${6 + i}px;
      border-radius: 50%;
      background: rgba(0,200,158, ${0.4 - i * 0.04});
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: left 0.05s, top 0.05s;
    `;
    document.body.appendChild(d);
    trail.push({ el: d, x: 0, y: 0 });
  }

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateTrail() {
    let x = mx, y = my;
    trail.forEach((t, i) => {
      t.x += (x - t.x) * (0.3 - i * 0.02);
      t.y += (y - t.y) * (0.3 - i * 0.02);
      t.el.style.left = t.x + 'px';
      t.el.style.top  = t.y + 'px';
      x = t.x;
      y = t.y;
    });
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

})();