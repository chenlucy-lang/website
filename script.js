/* ---------- Settings: change these to tune the train ---------- */
const TRAIN_VW  = 3.4;    // train height as a % of screen width (bigger = bigger train)
const TRAIN_MIN = 36;     // smallest train height in px
const TRAIN_MAX = 80;     // largest train height in px
const NOSE      = 0.6;    // how far the head pokes past the stop (x train height)
const DURATION  = 1100;   // travel time in ms

/* ---------- Elements and state ---------- */
const root     = document.documentElement;
const track    = document.querySelector('.track');
const train    = document.querySelector('.train');
const progress = document.querySelector('.progress');
const stops    = [...document.querySelectorAll('.stop')];
const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = stops[0];
let trainH = 0;       // train height in px
let segW = 0;         // width of one copy of train.png at that height
let ratio = 4;        // image width / height (read from the real image once loaded)
let headX = 0;        // where the train's head is, in px from the left of the bar
let raf = 0;
let locked = false;
let lockTimer;

/* ---------- Sizing ---------- */
function sizeTrain() {
  trainH = Math.round(Math.min(TRAIN_MAX, Math.max(TRAIN_MIN, innerWidth * TRAIN_VW / 100)));
  segW = trainH * ratio;
  root.style.setProperty('--train-height', trainH + 'px');
  root.style.setProperty('--train-gap', Math.max(6, Math.round(trainH * 0.12)) + 'px');
}

/* ---------- Draw one frame ---------- */
function render() {
  const front = headX + trainH * NOSE;           // the very front of the train
  const need = Math.ceil(front / segW) + 1;      // copies needed to reach the left edge

  // Add another link whenever the train needs one
  while (train.children.length < need) {
    const link = document.createElement('img');
    link.src = 'train.png';
    link.alt = '';
    link.draggable = false;
    train.appendChild(link);
  }
  while (train.children.length > need) train.lastChild.remove();

  // Slide the whole chain so its right end is at the front
  train.style.transform = `translateX(${front - need * segW}px)`;
  progress.style.width = headX + 'px';
}

/* ---------- Animation ---------- */
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function stopX(stop) {
  const t = track.getBoundingClientRect();
  const d = stop.querySelector('.dot').getBoundingClientRect();
  return d.left + d.width / 2 - t.left;
}

function moveTo(x, animate = true) {
  cancelAnimationFrame(raf);
  if (!animate || reduced) {
    headX = x;
    render();
    return;
  }
  const from = headX;
  const start = performance.now();
  const step = now => {
    const t = Math.min(1, (now - start) / DURATION);
    headX = from + (x - from) * ease(t);
    render();
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

function setActive(stop, animate = true) {
  current = stop;
  stops.forEach(s => s.classList.toggle('active', s === stop));
  moveTo(stopX(stop), animate);
}

/* Put the train back on the current stop with no animation */
function replace() {
  sizeTrain();
  moveTo(stopX(current), false);
}

/* ---------- Clicks ---------- */
// Clicking sends the train straight to that stop.
// Scroll tracking pauses while the page scrolls so the train doesn't hop between stops.
stops.forEach(stop => {
  stop.addEventListener('click', () => {
    locked = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => (locked = false), 1000);
    setActive(stop);
  });
});

/* ---------- Scroll tracking ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !locked) {
      setActive(stops.find(s => s.hash === '#' + e.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('.content section').forEach(s => io.observe(s));

/* ---------- Start up ---------- */
function start() {
  sizeTrain();
  setActive(stops[0], false);
  window.addEventListener('resize', replace);
  window.addEventListener('load', replace);   // place it again once everything has loaded
}

// Read the image's real proportions first so the links line up
const probe = new Image();
probe.onload = () => {
  ratio = probe.naturalWidth / probe.naturalHeight;
  start();
};
probe.onerror = start;   // still works if train.png is missing
probe.src = 'train.png';