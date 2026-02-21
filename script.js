// Audio.
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}


function playChime(startTime) {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = startTime + i * 0.22;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    osc.start(t);
    osc.stop(t + 0.7);
  });
}

function playDoneSound() {
  if (!audioCtx) return;
  const chimeDuration = 4 * 0.22 + 0.7; 
  const gap = 0.3;                        
  for (let i = 0; i < 3; i++) {
    playChime(audioCtx.currentTime + i * (chimeDuration + gap));
  }
}

let hours = 0, minutes = 0, seconds = 0;
let totalSeconds = 0;
let interval = null;
let running = false;
let origTotal = 0;

const pad = n => String(n).padStart(2, '0');

function setDisplay(hh, mm, ss) {
  flipTo('hour', pad(hh));
  flipTo('min',  pad(mm));
  flipTo('sec',  pad(ss));
}

function flipTo(unit, val) {
  const card  = document.getElementById(unit + 'Card');
  const flip  = document.getElementById(unit + 'Flip');
  const inner = document.getElementById(unit + 'FlipInner');

  if (card.textContent === val) return;

  inner.textContent = card.textContent; 
  card.textContent  = val;             

  flip.classList.remove('animate');
  void flip.offsetWidth; 
  flip.classList.add('animate');
}

// controls
function adjustUnit(unit, delta) {
  if (running) return;
  if (unit === 'hour') {
    hours = (hours + delta + 24) % 24;
  } else {
    minutes = (minutes + delta + 60) % 60;
  }
  totalSeconds = hours * 3600 + minutes * 60 + seconds;
  origTotal    = totalSeconds;
  setDisplay(hours, minutes, seconds);
  document.getElementById('status').textContent = '';
  document.getElementById('status').classList.remove('done');
}

function toggleTimer() {
  ensureAudio(); 
  if (!running) {
    if (totalSeconds <= 0) return;
    running = true;
    document.getElementById('startBtn').textContent = 'Pause';
    document.getElementById('startBtn').classList.add('active');
    document.getElementById('timerRow').classList.add('running');
    interval = setInterval(tick, 1000);
  } else {
    running = false;
    clearInterval(interval);
    document.getElementById('startBtn').textContent = 'Resume';
    document.getElementById('startBtn').classList.remove('active');
    document.getElementById('timerRow').classList.remove('running');
  }
}

function tick() {
  totalSeconds--;
  if (totalSeconds < 0) {
    totalSeconds = 0;
    clearInterval(interval);
    running = false;
    document.getElementById('startBtn').textContent = 'Start';
    document.getElementById('startBtn').classList.remove('active');
    document.getElementById('timerRow').classList.remove('running');
    document.getElementById('status').textContent = "✦ Time's up";
    document.getElementById('status').classList.add('done');
    playDoneSound();
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  setDisplay(h, m, s);
}

function resetTimer() {
  clearInterval(interval);
  running = false;
  totalSeconds = 0;
  hours = 0; minutes = 0; seconds = 0;
  document.getElementById('startBtn').textContent = 'Start';
  document.getElementById('startBtn').classList.remove('active');
  document.getElementById('timerRow').classList.remove('running');
  document.getElementById('status').textContent = '';
  document.getElementById('status').classList.remove('done');
  setDisplay(0, 0, 0);
}

