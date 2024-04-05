//Constants
const snake_border = "black";
const board_background = "white";
const board_border = "black";
const food_color = "#ffd700";

//Game variables
let snake = [
  { x: 10, y: 10 }, //tail
  { x: 20, y: 10 }, //head
];
let scoreBoard = 0;
let highScore = 0;
let food = { x: 0, y: 0 };
let dx = 10;
let dy = 0;
let gameStarted = false;
let gameOver = false;
let gameLoopId = null; // Variable to store the ID of the current game loop
let isMusicPlaying = false; // Variable to track music playback state

//DOM elements
const restartButton = document.getElementById("restartBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const audioIcon = document.getElementById("audio-icon");

//Event Listeners
document.addEventListener("keydown", checkKeys);
restartButton.addEventListener("click", restartGame);
document.addEventListener("keydown", startGame);
audioIcon.addEventListener("click", playbackgroundMusic);

//Image
const image = new Image();
image.src = "Images/grass.png";
image.onload = function () {
  // Draw the image background once it's loaded
  drawImageBackground();

  clearBoard();
  drawSnake();
  generateFood();
};

//Audio
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
    backgroundMusic.volume = 0.5; // Adjust this value as needed
    backgroundMusic.play();
    isMusicPlaying = true;
  }
}

function playSound() {
  eatSound.play();
}

function explosionSound() {
  collisionSound.currentTime = 0; // Reset playback to the beginning
  collisionSound.play();
}

// Function to draw the image background
function drawImageBackground() {
  // Draw the image from the top-left corner of the canvas (0,0)
  // Adjust the width and height to fit your canvas size
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

// this function generates random coordinates for the food within the canvas
function generateFood() {
  // Calculate the maximum x and y coordinates for food placement
  const maxX = canvas.width - 10; // Subtracting 10 to keep the food within canvas boundaries
  const maxY = canvas.height - 10; // Subtracting 10 to keep the food within canvas boundaries

  food.x = Math.floor((Math.random() * maxX) / 10) * 10;
  food.y = Math.floor((Math.random() * maxY) / 10) * 10;
  // console.log(food.x, food.y);
  drawFoodPart();
}

// Modify drawFoodPart function to draw a space-themed item
function drawFoodPart() {
  // Draw a space-themed item, such as a glowing asteroid or a UFO
  // You can customize this to create different space-themed items
  ctx.fillStyle = food_color;
  ctx.strokeStyle = snake_border;
  ctx.beginPath();
  ctx.arc(food.x + 5, food.y + 5, 6, 0, 2 * Math.PI); // Draw a circular shape
  ctx.fill();
  ctx.stroke();
}

// Iterates over the snake array and calls drawSnakePart() for each body part.
function drawSnake() {
  snake.forEach((snakePart, index) => {
    drawSnakePart(snakePart, index);
  });
}

// Iterates over the snake array and calls drawSnakePart() for each body part.
function drawSnake() {
  snake.forEach((snakePart, index) => {
    drawSnakePart(snakePart, index);
  });
}

// Modify drawSnakePart function to draw round segments for the snake
function drawSnakePart(snakePart, index) {
  // Calculate hue based on time
  const hue = (index * 10 + performance.now() / 10) % 360; // Adjust speed by changing the divisor

  // Convert hue to RGB color
  const color = `hsl(${hue}, 100%, 50%)`;

  // Set the fill style to the color
  ctx.fillStyle = color;
  //Sets the outline color
  ctx.strokeStyle = snake_border;

  // Draw a circular segment for the snake part
  ctx.beginPath();
  ctx.arc(snakePart.x + 5, snakePart.y + 5, 5.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

//Clears the canvas and prepares for the next frame of the game
//Doesn't neccessarily clear the snake, it effectively clears the entire canvas
function clearBoard() {
  // Draw the image background first
  drawImageBackground();

  // Draw a "border" around the entire canvas
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// main game loop
function main() {
  // Check if a game loop is already running
  if (gameLoopId !== null) {
    // If a game loop is running, clear it to stop the previous loop
    clearTimeout(gameLoopId);
  }

  if (gameEnded()) {
    // If the game has ended, stop the game loop
    gameLoopId = null;
    return;
  }

  //calls setTimeout to execute an anonymous function after a delay of 40 milliseconds (this determines the speed of the game).
  //The anonymous function contains the game logic that should be executed in each frame of the game.
  gameLoopId = setTimeout(function onTick() {
    clearBoard();
    moveSnake();
    drawSnake();
    drawFoodPart();

    //Calls itself recursively to continue the game loop, creating an infinite loop until the game ends or the user quits.
    main();
  }, 50);
}

//This function starts the game loop when a valid key (arrow keys) is pressed for the first time.
function startGame(event) {
  if (
    //If gameStarted is currently false (meaning the game hasn't started yet) and
    //the key pressed by the player is one of the arrow keys (up, down, left, or right), then we execute the code inside the function
    !gameStarted &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    gameStarted = true;

    main();
  }
}

function restartGame() {
  snake = [
    { x: 10, y: 10 }, //tail
    { x: 20, y: 10 }, //head
  ];

  dx = 10;
  dy = 0;

  //Reset the score to 0
  scoreBoard = 0;
  // document.getElementById("scoreBoard").innerHTML = scoreBoard;
  document.getElementById("scoreBoard").textContent = "Score: " + scoreBoard;
  gameStarted = false;

  // Clear the canvas and redraw the snake with its original positions
  clearBoard();
  drawSnake();
  generateFood();
}

function gameEnded() {
  //Retrieve coordinates to the snake's head
  const head = snake[0];

  // Check collision with the snake's body parts
  //Iterate over each body part of the snake (excluding the head)
  for (let i = 1; i < snake.length; i++) {
    //If the head's coordinate matches any of the body part's coordinate
    if (head.x === snake[i].x && head.y === snake[i].y) {
      explosionSound();
      displayGameOverModal(); // Display game over modal

      return true; // Collision detected, game over
    }
  }

  // Check if the snake collides with the canvas borders
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  ) {
    explosionSound();
    displayGameOverModal(); // Display game over modal

    return true; // Collision with borders detected, game over
  }

  return false; // No collision detected
}

function moveSnake() {
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check if the snake's head is equal food's position
  if (head.x === food.x && head.y === food.y) {
    // Add 4 new segments to the snake's tail
    for (let i = 0; i < 4; i++) {
      // Create a new segment with the same position as the last segment of the snake

      let newSegment = {
        x: snake[snake.length - 1].x, // take the x-coordinate of the last segment (x would be 20)
        y: snake[snake.length - 1].y, // take the y-coordinate of the last segment (y would be 10)
      };
      snake.push(newSegment);
    }

    scoreBoard += 100;
    //adds 100 points for every food eaten
    playSound();

    document.getElementById("scoreBoard").textContent = "Score: " + scoreBoard;

    //this displays score on the score board
    updateHighScore();
    // If the snake's head is equal to the food's position, generate new food
    generateFood();
  } else {
    // If the snake's head is not within the range of the food, continue moving the snake
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
      // If not going down, allow moving up
      if (!goingDown) {
        dx = 0;
        dy = -10;
      }
      break;
    case "ArrowLeft":
      // If not going right, allow moving left
      if (!goingRight) {
        dx = -10;
        dy = 0;
      }
      break;
    case "ArrowRight":
      // If not going left, allow moving right
      if (!goingLeft) {
        dx = 10;
        dy = 0;
      }
      break;
    case "ArrowDown":
      if (!goingUp) {
        // If not going up, allow moving down
        dx = 0;
        dy = 10;
      }
      break;
  }
}
// Display game over modal
function displayGameOverModal() {
  const modal = document.getElementById("gameOverModal");
  const finalScoreSpan = document.getElementById("finalScore");
  finalScoreSpan.textContent = scoreBoard; // Update final score
  modal.style.display = "block"; // Show modal
}

// Event listener for restart button in modal
document.getElementById("restartBtn").addEventListener("click", function () {
  restartGame();
  const modal = document.getElementById("gameOverModal");
  modal.style.display = "none"; // Hide modal on restart
});

// Event listener for closing the modal when the 'x' button is clicked
document.querySelector(".close").addEventListener("click", function () {
  const modal = document.getElementById("gameOverModal");
  modal.style.display = "none"; // Hide the modal
});

function random(min, max) {
  return min + Math.random() * (max + 1 - min);
}

const body = document.querySelector("body");

const canvasWidth = canvas.offsetWidth; // Get canvas width
const canvasRect = canvas.getBoundingClientRect(); // Get canvas position and size

// Function to check if a point (x, y) overlaps with the canvas
function isOverlappingCanvas(x, y) {
  return (
    x >= canvasRect.left &&
    x <= canvasRect.right &&
    y >= canvasRect.top &&
    y <= canvasRect.bottom
  );
}

const starsFraction = 200; // Adjusted for the number of stars you want

for (let i = 0; i < starsFraction; i++) {
  let xPos, yPos;

  // Keep generating random positions until it doesn't overlap with the canvas
  do {
    // Generate random positions within the viewport
    xPos = random(0, window.innerWidth);
    yPos = random(0, window.innerHeight);
  } while (isOverlappingCanvas(xPos, yPos));

  // Set up other random elements
  let alpha = random(0.5, 1);
  let size = random(1, 2);
  let colour = "#ffffff";

  // Add them to the body
  const star = document.createElement("div");
  star.classList.add("star"); // Apply CSS class for animation
  star.style.position = "fixed"; // Position fixed to stay in place
  star.style.left = xPos + "px";
  star.style.top = yPos + "px";
  star.style.opacity = alpha;
  star.style.width = size + "px";
  star.style.height = size + "px";
  star.style.backgroundColor = colour;

  // Apply random delay to each star's animation
  const delay = random(0, 2); // Adjust the range of delay as needed
  star.style.animationDelay = delay + "s";
  document.body.appendChild(star);
}
