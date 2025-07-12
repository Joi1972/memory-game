window.onload = function () {
  /* ---------- DOM references ---------- */
  const grid         = document.getElementById('grid');
  const showBtn      = document.getElementById('showBtn');
  const goBtn        = document.getElementById('goBtn');
  const message      = document.getElementById('message');
  const scoreDisplay = document.getElementById('score');
  const bar          = document.getElementById('timerBar');
  const barContainer = document.getElementById('timerBarContainer');
  const colorBoxes   = document.querySelectorAll('.color-choice');

  /* ---------- game state ---------- */
  const colors = ['blue', 'red', 'green', 'yellow'];
  let correctIndex     = -1;
  let correctColor     = '';
  let waitingForClick  = false;
  let selectedColor    = '';
  let score            = 0;

  /* ---------- build 3×3 grid ---------- */
  for (let i = 0; i < 9; i++) {
    const square = document.createElement('div');
    square.className = 'square';
    square.dataset.index = i;
    square.onclick = () => waitingForClick && handleSquareClick(i);
    grid.appendChild(square);
  }

  /* ---------- color selector ---------- */
  colorBoxes.forEach(box => {
    box.onclick = () => {
      colorBoxes.forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');
      selectedColor = box.dataset.color;
    };
  });

  /* ---------- show button ---------- */
  showBtn.onclick = () => {
    resetGrid();
    resetSelector();
    message.textContent = '';
    selectedColor = '';

    correctIndex = Math.floor(Math.random() * 9);
    correctColor = colors[Math.floor(Math.random() * colors.length)];

    const square = grid.children[correctIndex];
    square.classList.add('highlight', correctColor);

    showBtn.disabled = true;
    goBtn.disabled   = false;
  };

  /* ---------- go button ---------- */
  goBtn.onclick = () => {
    const square = grid.children[correctIndex];
    square.classList.remove('highlight', correctColor);

    showBtn.disabled = true;
    goBtn.disabled   = true;
    waitingForClick  = false;

    /* ---- 3-second countdown ---- */
    barContainer.style.visibility = 'visible';
    bar.style.width = '0%';
    let progress = 0;

    const interval = setInterval(() => {
      progress += 1;
      bar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        waitingForClick = true;
        message.textContent = '🟢 Select color then click the square!';
        barContainer.style.visibility = 'hidden';
      }
    }, 30); // 30 ms × 100 = 3 seconds
  };

  /* ---------- user clicks square ---------- */
  function handleSquareClick(clickedIndex) {
    if (!selectedColor) {
      message.textContent = '⚠️ Choose a color first!';
      return;
    }

    waitingForClick = false;
    showBtn.disabled = false;

    const square = grid.children[correctIndex];

    if (clickedIndex === correctIndex && selectedColor === correctColor) {
      message.textContent = '✅ Correct!';
      score++;
    } else {
      message.textContent = '❌ Wrong! That was the correct square.';
    }

    // In both cases, show and keep the correct color
    square.classList.add('highlight', correctColor);
    scoreDisplay.textContent = score;
  }

  /* ---------- helpers ---------- */
  function resetGrid() {
    [...grid.children].forEach(sq =>
      sq.classList.remove('highlight', 'blue', 'red', 'green', 'yellow'));
  }

  function resetSelector() {
    colorBoxes.forEach(b => b.classList.remove('selected'));
  }
};
