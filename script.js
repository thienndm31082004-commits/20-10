// ===== PETAL CANVAS ANIMATION =====
const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

const PETAL_COLORS = ['#f48fb1','#f8bbd0','#fce4ec','#e91e63','#fff','#ffd6e0','#ff9eb5'];

class Petal {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : -20;
    this.size = 5 + Math.random() * 14;
    this.speedY = 0.6 + Math.random() * 1.8;
    this.speedX = -0.5 + Math.random() * 1;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (-0.03 + Math.random() * 0.06);
    this.opacity = 0.4 + Math.random() * 0.5;
    this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.03 + Math.random() * 0.04;
  }
  update() {
    this.y += this.speedY;
    this.wobble += this.wobbleSpeed;
    this.x += this.speedX + Math.sin(this.wobble) * 0.8;
    this.rotation += this.rotSpeed;
    if (this.y > H + 20) this.reset();
  }
  draw(c) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.beginPath();
    c.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

const petals = Array.from({ length: 80 }, () => new Petal());

function animatePetals() {
  ctx.clearRect(0, 0, W, H);
  petals.forEach(p => { p.update(); p.draw(ctx); });
  requestAnimationFrame(animatePetals);
}
animatePetals();

// ===== ORBIT RING =====
const orbitFlowers = ['🌸','🌺','🌼','💐','🌸','🌷','🌸','🌼'];
const orbitRing = document.getElementById('orbitRing');
if (orbitRing) {
  const n = orbitFlowers.length;
  const r = 125;
  orbitFlowers.forEach((f, i) => {
    const dot = document.createElement('div');
    dot.className = 'orbit-dot';
    const angle = (i / n) * 2 * Math.PI;
    const cx = r + r * Math.cos(angle);
    const cy = r + r * Math.sin(angle);
    dot.style.left = (cx - 11) + 'px';
    dot.style.top  = (cy - 11) + 'px';
    dot.style.transformOrigin = (r - cx + 11) + 'px ' + (r - cy + 11) + 'px';
    dot.textContent = f;
    dot.style.fontSize = '20px';
    dot.style.position = 'absolute';
    orbitRing.appendChild(dot);
  });
}

// ===== PHOTO SLIDESHOW =====
// 👉 THÊM TÊN ẢNH VÀO ĐÂY (ảnh phải nằm trong folder images/)
// Ví dụ: 'anh1.jpg', 'anh2.png', 'selfie.jpg'
const PHOTOS = [
  'anh1.jpg',
  'anh2.jpg',
  'anh3.jpg',
  'anh4.jpg',
  'anh5.jpg',
];

let currentSlide = 0;
let slideInterval = null;

function buildSlides(srcList) {
  const slideshow = document.getElementById('slideshow');
  slideshow.innerHTML = '';
  srcList.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = 'url(' + src + ')';
    slideshow.appendChild(slide);
  });
  startSlideshow();
  spawnHearts();
}

// Auto-load ảnh từ folder images/ nếu đã khai báo
function initSlideshow() {
  const realPhotos = PHOTOS.filter(p => p.trim() !== '');
  if (realPhotos.length > 0) {
    const srcs = realPhotos.map(name => 'images/' + name);
    buildSlides(srcs);
    const count = document.getElementById('photoCount');
    if (count) count.textContent = realPhotos.length + ' ảnh đã tải';
  }
}

// Upload thủ công (dùng khi chưa khai báo PHOTOS)
function loadPhotos(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  const readers = files.map((file, i) => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve({ src: e.target.result, index: i });
    reader.readAsDataURL(file);
  }));

  Promise.all(readers).then(results => {
    results.sort((a, b) => a.index - b.index);
    buildSlides(results.map(r => r.src));
    const count = document.getElementById('photoCount');
    if (count) count.textContent = files.length + ' ảnh đã chọn';
  });
}

function startSlideshow() {
  if (slideInterval) clearInterval(slideInterval);
  currentSlide = 0;
  slideInterval = setInterval(() => {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 3000);
}

// ===== MUSIC PLAYER =====
// 👉 THÊM NHẠC: bỏ file nhạc vào folder music/ rồi khai báo tên ở đây
const MUSIC = {
  file: 'video1.mp3',
  title: 'Nhạc Nền Lãng Mạn',
};

const audio = document.getElementById('bgMusic');
let isPlaying = false;

// Auto-load nhạc nếu đã khai báo
function initMusic() {
  if (!MUSIC.file.trim()) return;
  audio.src = 'music/' + MUSIC.file;
  document.getElementById('musicTitle').textContent = MUSIC.title;
  document.querySelector('.music-sub').textContent = 'Nhấn ▶ để phát';
}

// Upload thủ công (fallback khi chưa khai báo MUSIC)
function loadMusic(event) {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  audio.src = url;
  document.getElementById('musicTitle').textContent = file.name.replace(/\.[^.]+$/, '');
  document.querySelector('.music-sub').textContent = 'Đã tải lên';
}

function toggleMusic() {
  if (!audio.src) {
    document.querySelector('.music-sub').textContent = 'Hay tai nhac truoc!';
    return;
  }
  if (isPlaying) {
    audio.pause();
    document.getElementById('playBtn').textContent = '\u25B6';
    document.getElementById('musicVinyl').classList.remove('playing');
    isPlaying = false;
  } else {
    audio.play().catch(() => {
      document.querySelector('.music-sub').textContent = 'Loi phat nhac!';
    });
    document.getElementById('playBtn').textContent = '\u23F8';
    document.getElementById('musicVinyl').classList.add('playing');
    isPlaying = true;
  }
}

audio.addEventListener('play', () => {
  document.getElementById('playBtn').textContent = '\u23F8';
  document.getElementById('musicVinyl').classList.add('playing');
  document.querySelector('.music-sub').textContent = 'Dang phat...';
  isPlaying = true;
});
audio.addEventListener('pause', () => {
  document.getElementById('playBtn').textContent = '\u25B6';
  document.getElementById('musicVinyl').classList.remove('playing');
  isPlaying = false;
});

// ===== UPLOAD PANEL =====
function togglePanel() {
  document.getElementById('panelBox').classList.toggle('open');
}

// ===== HEART BURST =====
function spawnHearts() {
  const container = document.getElementById('heartBurst');
  const hearts = ['❤️','💖','💗','💕','🌸','✨'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'heart-particle';
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.left = (10 + Math.random() * 80) + 'vw';
      h.style.bottom = '10vh';
      h.style.animationDelay = Math.random() * 1 + 's';
      h.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
      container.appendChild(h);
      setTimeout(() => h.remove(), 3500);
    }, i * 80);
  }
}

// Spawn hearts on page load
window.addEventListener('load', () => {
  initSlideshow();   // auto-load ảnh từ mảng PHOTOS
  initMusic();       // auto-load nhạc từ MUSIC.file
  setTimeout(spawnHearts, 1500);
  setTimeout(spawnHearts, 4000);
});

// Click anywhere to spawn hearts
document.addEventListener('click', (e) => {
  const container = document.getElementById('heartBurst');
  const hearts = ['❤️','💖','💗','💕','🌸','✨','💝'];
  for (let i = 0; i < 5; i++) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.left = e.clientX + (-30 + Math.random() * 60) + 'px';
    h.style.top = e.clientY + 'px';
    h.style.animationDelay = Math.random() * 0.3 + 's';
    h.style.position = 'fixed';
    container.appendChild(h);
    setTimeout(() => h.remove(), 3200);
  }
});
