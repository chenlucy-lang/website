/* ---------- Elevator nav: identical to script.js ---------- */
const track    = document.querySelector('.track');
const progress = document.querySelector('.progress');
const stops    = [...document.querySelectorAll('.stop')];

// The "about" button is the lit one on this page
let current = stops.find(s => s.classList.contains('active')) || stops[stops.length - 1];

// Center of a button, measured from the left edge of the bar
function stopX(stop) {
  const t = track.getBoundingClientRect();
  const b = stop.querySelector('.btn').getBoundingClientRect();
  return b.left + b.width / 2 - t.left;
}

// Light up one floor and extend the solid line up to it
function setActive(stop) {
  current = stop;
  stops.forEach(s => {
    const on = s === stop;
    s.classList.toggle('active', on);
    if (on) s.setAttribute('aria-current', 'true');
    else s.removeAttribute('aria-current');
  });
  progress.style.width = stopX(stop) + 'px';
}

// Clicking a button lights it straight away, same as the home page
stops.forEach(stop => {
  stop.addEventListener('click', () => setActive(stop));
});

// Start on the about floor, and keep the line lined up on resize
setActive(current);
window.addEventListener('resize', () => setActive(current));
window.addEventListener('load', () => setActive(current));

/* ---------- Typewriter bio ---------- */
const typed = document.querySelector('.typed');

const PHRASES = [
  'is a Shanghai and Los Angeles based designer interested in curating fun experiences',
  'is an artist passionate about exploring the intersections of identity and culture',
  'is a creative who simply loves making anything and everything that inspires her.'
];
const TYPE_MS   = 45;     // time per letter while typing
const DELETE_MS = 22;     // time per letter while deleting
const HOLD_MS   = 2200;   // how long a finished line stays on screen
const GAP_MS    = 400;    // pause on the empty line before the next one starts

if (typed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let p = 0;      // which line
  let n = 0;      // how many letters are showing

  const typeNext = () => {
    n++;
    typed.textContent = PHRASES[p].slice(0, n);
    if (n < PHRASES[p].length) setTimeout(typeNext, TYPE_MS);
    else setTimeout(deleteNext, HOLD_MS);
  };

  const deleteNext = () => {
    n--;
    typed.textContent = PHRASES[p].slice(0, n);
    if (n > 0) {
      setTimeout(deleteNext, DELETE_MS);
    } else {
      p = (p + 1) % PHRASES.length;
      setTimeout(typeNext, GAP_MS);
    }
  };

  // The first line is already on the page, so start by holding it, then delete it
  n = PHRASES[0].length;
  setTimeout(deleteNext, HOLD_MS);
}

/* ---------- Shanghai clock ---------- */
const clock = document.querySelector('#shanghai-time');

if (clock) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const tick = () => {
    clock.textContent = fmt.format(new Date());
    // Wait until the next whole second so the clock never drifts
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };

  tick();
}