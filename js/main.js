const SPIN_KEY = "roulette_spinned_jan2026";
const rouletteCard = document.querySelector(".roulette__card");
const checkButton = document.querySelector(".roulette__button--secondary");
const checkbox = document.querySelector(".roulette__checkbox-input");

const FORCE_WIN = null;

const segments = [
  { text: "4 часа FREE", color: "#f1c40f", weight: 8 },
  { text: "Повезёт в следующий раз", color: "#e74c3c", weight: 15 },
  { text: "Повезёт в следующий раз", color: "#e67e22", weight: 15 },
  { text: "Скидка 30%", color: "#3498db", weight: 12 },
  { text: "Скидка 50%", color: "#2ecc71", weight: 12 },
  { text: "Скидка 75%", color: "#9b59b6", weight: 13 },
];

const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

function alreadySpinned() {
  return localStorage.getItem(SPIN_KEY) === "true";
}

function showWheel() {
  rouletteCard.innerHTML = `
    <h1 class="roulette__title"><span class="roulette__icon">🎁</span> Рулетка удачи</h1>
    
    <div class="roulette-wheel-container">
      <div class="roulette-wheel-wrapper">
        <div class="roulette-pointer"></div>
        <canvas id="rouletteWheel" class="roulette-canvas"></canvas>
        <div class="roulette-center-circle"></div>
      </div>
    </div>
    
    <button id="spinButton" class="roulette-spin-btn">Крутить</button>
    
    <div id="alreadySpinnedMsg" class="roulette-already-msg" style="display: none;">
      Вы уже крутили: Повезёт в следующий раз<br>
      <small>Крутить можно один раз на устройство.</small>
    </div>
  `;

  const canvas = document.getElementById("rouletteWheel");
  const ctx = canvas.getContext("2d");
  const spinButton = document.getElementById("spinButton");
  const alreadyMsg = document.getElementById("alreadySpinnedMsg");
  const wheelContainer = document.querySelector(".roulette-wheel-container");

  function updateWheelSize() {
    const maxSize = Math.min(450, window.innerWidth * 0.95);
    const size = Math.floor(maxSize / 14) * 10; // чётный размер

    canvas.width = size;
    canvas.height = size;

    const wrapper = document.querySelector(".roulette-wheel-wrapper");
    wrapper.style.width = `${size}px`;
    wrapper.style.height = `${size}px`;

    const centerCircle = document.querySelector(".roulette-center-circle");
    centerCircle.style.width = `${size * 0.2}px`;
    centerCircle.style.height = `${size * 0.2}px`;

    wheelContainer.style.opacity = 1;
  }

  updateWheelSize();
  window.addEventListener("resize", updateWheelSize);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - canvas.width * 0.055;

  function drawWheel(rotation = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let startAngle = rotation - Math.PI / 2;

    segments.forEach((seg) => {
      const angle = (seg.weight / totalWeight) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = canvas.width * 0.013;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angle / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${canvas.width * 0.033}px sans-serif`;
      ctx.shadowColor = "#000";
      ctx.shadowBlur = canvas.width * 0.013;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const textDistance = radius - canvas.width * 0.189;

      if (seg.text === "Повезёт в следующий раз") {
        ctx.fillText("Повезёт в", textDistance, -10);
        ctx.fillText("следующий раз", textDistance, 14);
      } else {
        ctx.fillText(seg.text, textDistance, 6);
      }

      ctx.restore();

      startAngle += angle;
    });
  }

  function getWinningSegment() {
    if (FORCE_WIN)
      return segments.find((s) => s.text === FORCE_WIN) || segments[0];
    const r = Math.random() * totalWeight;
    let sum = 0;
    for (let s of segments) {
      sum += s.weight;
      if (r <= sum) return s;
    }
    return segments[segments.length - 1];
  }

  if (alreadySpinned()) {
    spinButton.disabled = true;
    alreadyMsg.style.display = "block";
    drawWheel();
    return;
  }

  drawWheel();

  spinButton.addEventListener("click", () => {
    spinButton.disabled = true;

    const winner = getWinningSegment();

    let accumulated = 0;
    let targetMid = 0;
    for (let s of segments) {
      if (s === winner) {
        targetMid = accumulated + s.weight / 2;
        break;
      }
      accumulated += s.weight;
    }

    const targetAngle = (targetMid / totalWeight) * Math.PI * 2;
    const fullSpins = 7 + Math.random() * 1;
    const finalRotation = fullSpins * Math.PI * 2 + targetAngle;

    let currentRotation = 0;
    const duration = 7000;
    const start = performance.now();

    function animate(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);

      currentRotation = finalRotation * easeOutQuint;
      drawWheel(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        localStorage.setItem(SPIN_KEY, "true");
        alreadyMsg.style.display = "block";
      }
    }

    requestAnimationFrame(animate);
  });
}

checkButton.addEventListener("click", () => {
  if (!checkbox.checked) {
    alert("Поставьте галочку, если подписались на канал");
    return;
  }
  showWheel();
});
