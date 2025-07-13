window.onload = function () {
  /* ---------- DOM refs ---------- */
  const grid         = document.getElementById('grid');
  const gridFlash    = document.getElementById('gridFlash');
  const startBtn     = document.getElementById('startBtn');
  const message      = document.getElementById('message');
  const scoreSpan    = document.getElementById('score');
  const levelSpan    = document.getElementById('levelDisplay');
  const barContainer = document.getElementById('timerBarContainer');
  const bar          = document.getElementById('timerBar');
  const colorBoxes   = document.querySelectorAll('.color-choice');

  /* ---------- Game state ---------- */
  const colors = ['blue', 'red', 'green', 'yellow'];
  let level = 1;
  let score = 0;
  let targets = [];
  let selectedColor = '';
  let waitingForFirstClick = false;
  let colorSelectionEnabled = false;

  /* ---------- Build grid ---------- */
  for (let i = 0; i < 9; i++) {
    const sq = document.createElement('div');
    sq.className = 'square';
    sq.dataset.index = i;
    sq.onclick = () => handleSquareClick(i);
    grid.appendChild(sq);
  }

  /* ---------- Color picker ---------- */
  colorBoxes.forEach(box => {
    box.onclick = () => {
      if (!colorSelectionEnabled) return;

      /* keep pulse-color on all boxes; only remove .selected */
      colorBoxes.forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');
      selectedColor = box.dataset.color;
    };
  });

  /* ---------- Start / Go button ---------- */
  startBtn.onclick = () => {
    if (!waitingForFirstClick) {
      startRound();
    } else {
      hideTargetsInstant();
      startCountdown();
      startBtn.disabled     = true;
      startBtn.classList.remove('pulse');
    }
  };

  function startRound() {
    resetGrid();
    resetSelector();
    clearMessage();
    targets               = generateTargets(level);
    revealTargets();
    waitingForFirstClick  = true;
    startBtn.textContent  = 'Go!';
  }

  /* ---------- Helpers ---------- */
  function generateTargets(lv) {
    const arr  = [];
    const used = new Set();
    for (let i = 0; i < lv; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * 9); } while (used.has(idx));
      used.add(idx);
      const color = colors[Math.floor(Math.random() * colors.length)];
      arr.push({ index: idx, color, found: false });
    }
    return arr;
  }

  function revealTargets() {
    targets.forEach(t => grid.children[t.index].classList
      .add('highlight', t.color));
  }

  function fadeOutSquare(sq, color, delay = 0) {
    setTimeout(() => {
      sq.classList.add('fade-color');
      setTimeout(() => {
        sq.classList.remove('highlight', color, 'fade-color');
      }, 1000);
    }, delay);
  }

  function hideTargetsInstant() {
    targets.forEach(t => grid.children[t.index]
      .classList.remove('highlight', t.color));
  }

  /* ---------- Countdown ---------- */
  function startCountdown() {
    barContainer.style.visibility = 'visible';
    bar.style.width = '0%';
    let p = 0;
    const iv = setInterval(() => {
      p += 1;
      bar.style.width = p + '%';
      if (p >= 100) {
        clearInterval(iv);
        colorSelectionEnabled = true;
        clearMessage();
        barContainer.style.visibility = 'hidden';
        colorBoxes.forEach(b => b.classList.add('pulse-color'));
      }
    }, 30); // 3 s total
  }

  /* ---------- Flash helper ---------- */
  function triggerFlash(isCorrect) {
    gridFlash.classList.remove('flash-correct', 'flash-wrong');
    void gridFlash.offsetWidth;              // reset animation
    gridFlash.classList.add(isCorrect ? 'flash-correct' : 'flash-wrong');
  }

  /* ---------- Square click ---------- */
  function handleSquareClick(idx) {
    if (!colorSelectionEnabled || !selectedColor) return;

    const match = targets.find(t => !t.found && t.index === idx);

    if (match && match.color === selectedColor) {
      match.found = true;
      score++;
      showMessage('CORRECT', 'correct');
      triggerFlash(true);
      grid.children[idx].classList.add('highlight', match.color);
    } else {
      score--;
      showMessage('WRONG', 'wrong');
      triggerFlash(false);
      revealTargets();
      updateHUD();
      checkLevelChange();
      setTimeout(() => {
        hideTargetsInstant();
        endRound();
      }, 2000);
      return;
    }

    updateHUD();
    checkLevelChange();
    selectedColor = '';
    colorBoxes.forEach(b => b.classList.remove('selected'));

    /* keep pulsing until round truly ends */
    const allFound = targets.every(t => t.found);
    if (allFound) endRound();
  }

  /* ---------- End round ---------- */
  function endRound() {
    colorSelectionEnabled = false;
    waitingForFirstClick  = false;
    startBtn.disabled     = false;
    startBtn.textContent  = 'Start';
    startBtn.classList.add('pulse');
    colorBoxes.forEach(b => b.classList.remove('pulse-color','selected'));
    targets.forEach(t => {
      if (t.found) fadeOutSquare(grid.children[t.index], t.color, 1000);
    });
  }

  /* ---------- HUD utils ---------- */
  function updateHUD() {
    scoreSpan.textContent = score;
    levelSpan.textContent = level;
  }

  function checkLevelChange() {
    if (level === 1 && score >= 10) level = 2;
    else if (level === 2 && score < 10) level = 1;
  }

  function resetGrid() {
    [...grid.children].forEach(sq =>
      sq.classList.remove('highlight','blue','red','green','yellow','fade-color'));
  }

  function resetSelector() {
    colorBoxes.forEach(b => b.classList.remove('selected','pulse-color'));
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className   = `game-message ${type}`;
  }

  function clearMessage() {
    message.textContent = '';
    message.className   = 'game-message';
  }

  /* ---------- Init ---------- */
  startBtn.classList.add('pulse');
  updateHUD();
};
