const snake_border = "black";
const board_background = "white";
const board_border = "black";
const food_color = "#ffd700";

let snake = [
  { x: 50, y: 50 },
  { x: 60, y: 50 },
];
let scoreBoard = 0;
let highScore = 0;
let food = { x: 0, y: 0 };
let dx = 10;
let dy = 0;
let gameStarted = false;
let gameOver = false;
let gameLoopId = null;
let isMusicPlaying = false;

const restartButton = document.getElementById("restartBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const audioIcon = document.getElementById("audio-icon");

document.addEventListener("keydown", checkKeys);
restartButton.addEventListener("click", restartGame);
document.addEventListener("keydown", startGame);
audioIcon.addEventListener("click", playbackgroundMusic);

const image = new Image();
image.src = "Images/grass.png";
image.onload = function () {
  drawImageBackground();
  clearBoard();
  drawSnake();
  generateFood();
};

const eatSound = new Audio("Audio/mario-coin.mp3");
const collisionSound = new Audio("Audio/explosion.mp3");
const backgroundMusic = new Audio("Audio/space-music.mp3");

backgroundMusic.preload = "auto";
eatSound.preload = "auto";
collisionSound.preload = "auto";

function playbackgroundMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
    isMusicPlaying = false;
  } else {
    backgroundMusic.volume = 0.5;
    backgroundMusic.play();
    isMusicPlaying = true;
  }
}

function playSound() {
  eatSound.play();
}

function explosionSound() {
  collisionSound.currentTime = 0;
  collisionSound.play();
}

function drawText(
  text,
  x,
  y,
  fontSize = "30px",
  fontFamily = "Arial",
  color = "#ffeb3b",
  textAlign = "center"
) {
  ctx.font = `${fontSize} ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.fillText(text, x, y);
}

function drawImageBackground() {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (!gameStarted) {
    drawText(
      "Press any arrow keys to start",
      canvas.width / 2,
      canvas.height / 2
    );
  }
}

function generateFood() {
  const maxX = canvas.width - 10;
  const maxY = canvas.height - 10;

  food.x = Math.floor((Math.random() * maxX) / 10) * 10;
  food.y = Math.floor((Math.random() * maxY) / 10) * 10;
  drawFoodPart();
}

function drawFoodPart() {
  ctx.fillStyle = food_color;
  ctx.strokeStyle = snake_border;
  ctx.beginPath();
  ctx.arc(food.x + 5, food.y + 5, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

function drawSnake() {
  snake.forEach((snakePart, index) => {
    drawSnakePart(snakePart, index);
  });
}

function drawSnakePart(snakePart, index) {
  const hue = (index * 10 + performance.now() / 10) % 360;
  const color = `hsl(${hue}, 100%, 50%)`;

  ctx.fillStyle = color;
  ctx.strokeStyle = snake_border;
  ctx.beginPath();
  ctx.arc(snakePart.x + 5, snakePart.y + 5, 5.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

function clearBoard() {
  drawImageBackground();
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function main() {
  if (gameLoopId !== null) {
    clearTimeout(gameLoopId);
  }

  if (gameEnded()) {
    gameLoopId = null;
    return;
  }

  gameLoopId = setTimeout(function onTick() {
    clearBoard();
    moveSnake();
    drawSnake();
    drawFoodPart();
    main();
  }, 50);
}

function startGame(event) {
  if (
    !gameStarted &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    gameStarted = true;
    main();
  }
}

function restartGame() {
  snake = [
    { x: 50, y: 50 },
    { x: 60, y: 50 },
  ];
  dx = 10;
  dy = 0;
  scoreBoard = 0;
  document.getElementById("scoreBoard").textContent = "Score: " + scoreBoard;
  gameStarted = false;
  clearBoard();
  drawSnake();
  generateFood();
}

function gameEnded() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      explosionSound();
      displayGameOverModal();
      return true;
    }
  }
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  ) {
    explosionSound();
    displayGameOverModal();
    return true;
  }
  return false;
}

function moveSnake() {
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };
  if (head.x === food.x && head.y === food.y) {
    for (let i = 0; i < 4; i++) {
      let newSegment = {
        x: snake[snake.length - 1].x,
        y: snake[snake.length - 1].y,
      };
      snake.push(newSegment);
    }
    scoreBoard += 100;
    playSound();
    document.getElementById("scoreBoard").textContent = "Score: " + scoreBoard;
    updateHighScore();
    generateFood();
  } else {
    snake.unshift(head);
    snake.pop();
  }
}

function updateHighScore() {
  if (scoreBoard > highScore) {
    highScore = scoreBoard;
    document.getElementById("highScore").textContent =
      "Highscore: " + highScore;
  }
}

function checkKeys(event) {
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingLeft = dx === -10;
  const goingRight = dx === 10;

  switch (event.key) {
    case "ArrowUp":
      if (!goingDown) {
        dx = 0;
        dy = -10;
      }
      break;
    case "ArrowLeft":
      if (!goingRight) {
        dx = -10;
        dy = 0;
      }
      break;
    case "ArrowRight":
      if (!goingLeft) {
        dx = 10;
        dy = 0;
      }
      break;
    case "ArrowDown":
      if (!goingUp) {
        dx = 0;
        dy = 10;
      }
      break;
  }
}

function displayGameOverModal() {
  const modal = document.getElementById("gameOverModal");
  const finalScoreSpan = document.getElementById("finalScore");
  finalScoreSpan.textContent = scoreBoard;
  modal.style.display = "block";
}

document.getElementById("restartBtn").addEventListener("click", function () {
  restartGame();
  const modal = document.getElementById("gameOverModal");
  modal.style.display = "none";
});

function random(min, max) {
  return min + Math.random() * (max + 1 - min);
}

const body = document.querySelector("body");

const canvasWidth = canvas.offsetWidth;
const canvasRect = canvas.getBoundingClientRect();

function isOverlappingCanvas(x, y) {
  return (
    x >= canvasRect.left &&
    x <= canvasRect.right &&
    y >= canvasRect.top &&
    y <= canvasRect.bottom
  );
}

const starsFraction = 200;

for (let i = 0; i < starsFraction; i++) {
  let xPos, yPos;
  do {
    xPos = random(0, window.innerWidth);
    yPos = random(0, window.innerHeight);
  } while (isOverlappingCanvas(xPos, yPos));
  let alpha = random(0.5, 1);
  let size = random(1, 2);
  let colour = "#ffffff";
  const star = document.createElement("div");
  star.classList.add("star");
  star.style.position = "fixed";
  star.style.left = xPos + "px";
  star.style.top = yPos + "px";
  star.style.opacity = alpha;
  star.style.width = size + "px";
  star.style.height = size + "px";
  star.style.backgroundColor = colour;
  const delay = random(0, 2);
  star.style.animationDelay = delay + "s";
  document.body.appendChild(star);
}
