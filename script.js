window.onload = function () {
  const grid = document.getElementById('grid');
  const showBtn = document.getElementById('showBtn');
  const goBtn = document.getElementById('goBtn');
  const message = document.getElementById('message');
  const scoreSpan = document.getElementById('score');
  const levelSpan = document.getElementById('levelDisplay');
  const bar = document.getElementById('timerBar');
  const barContainer = document.getElementById('timerBarContainer');
  const colorBoxes = document.querySelectorAll('.color-choice');

  const colors = ['blue', 'red', 'green', 'yellow'];
  let level = 1;
  let score = 0;
  let targets = [];
  let selectedColor = '';
  let waitingForClick = false;
  let colorSelectionEnabled = false;

  // Create 3x3 grid
  for (let i = 0; i < 9; i++) {
    const square = document.createElement('div');
    square.className = 'square';
    square.dataset.index = i;
    square.onclick = () => {
      if (waitingForClick) handleSquareClick(i);
    };
    grid.appendChild(square);
  }

  // Color selector
  colorBoxes.forEach(box => {
    box.onclick = () => {
      if (!colorSelectionEnabled) return;
      colorBoxes.forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');
      selectedColor = box.dataset.color;
    };
  });

  showBtn.onclick = () => {
    resetGrid();
    resetSelector();
    message.textContent = '';
    selectedColor = '';
    colorSelectionEnabled = false;

    targets = generateTargets(level);
    revealTargets();

    showBtn.disabled = true;
    goBtn.disabled = false;
  };

  goBtn.onclick = () => {
    hideTargets();
    startCountdown();
  };

  function generateTargets(lv) {
    const chosen = [];
    const usedIndices = new Set();
    for (let i = 0; i < lv; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * 9);
      } while (usedIndices.has(index));
      usedIndices.add(index);
      const color = colors[Math.floor(Math.random() * colors.length)];
      chosen.push({ index, color, found: false });
    }
    return chosen;
  }

  function revealTargets() {
    targets.forEach(t => {
      const sq = grid.children[t.index];
      sq.classList.add('highlight', t.color);
    });
  }

  function hideTargets() {
    targets.forEach(t => {
      const sq = grid.children[t.index];
      sq.classList.remove('highlight', t.color);
    });
    showBtn.disabled = true;
    goBtn.disabled = true;
    waitingForClick = false;
  }

  function startCountdown() {
    barContainer.style.visibility = 'visible';
    bar.style.width = '0%';
    let progress = 0;

    const interval = setInterval(() => {
      progress += 1;
      bar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        waitingForClick = true;
        colorSelectionEnabled = true;
        message.textContent = '🟢 Pick a color, then tap a square!';
        barContainer.style.visibility = 'hidden';
      }
    }, 30); // 30ms x 100 = 3s
  }

  function handleSquareClick(clickedIndex) {
    if (!selectedColor) {
      message.textContent = '⚠️ Choose a color first!';
      return;
    }

    const match = targets.find(t => !t.found && t.index === clickedIndex);

    if (match && match.color === selectedColor) {
      match.found = true;
      message.textContent = '✅ Correct!';
      score++;
      markSquare(clickedIndex, match.color);
    } else {
      message.textContent = '❌ Wrong!';
      score--;
      revealTargets();
      updateHUD();
      checkLevelChange();
      endRound();
      return;
    }

    updateHUD();
    checkLevelChange();
    selectedColor = '';
    resetSelector();

    const allFound = targets.every(t => t.found);
    if (allFound) {
      message.textContent += ' 🎯 Round complete!';
      endRound();
    }
  }

  function markSquare(idx, color) {
    const sq = grid.children[idx];
    sq.classList.add('highlight', color);
  }

  function updateHUD() {
    scoreSpan.textContent = score;
    levelSpan.textContent = level;
  }

  function checkLevelChange() {
    if (level === 1 && score >= 10) {
      level = 2;
      message.textContent += ' 🎉 Level up!';
    } else if (level === 2 && score < 10) {
      level = 1;
      message.textContent += ' 🔄 Back to Level 1';
    }
  }

  function endRound() {
    waitingForClick = false;
    colorSelectionEnabled = false;
    showBtn.disabled = false;
  }

  function resetGrid() {
    [...grid.children].forEach(sq =>
      sq.classList.remove('highlight', 'blue', 'red', 'green', 'yellow')
    );
  }

  function resetSelector() {
    colorBoxes.forEach(b => b.classList.remove('selected'));
  }

  updateHUD();
};
