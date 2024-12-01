let handPose;
let video;
let hands = [];
let state = "Inhale"; // Current breathing state
let lastState = ""; // Previous state for detecting transitions
let cycleCount = 0; // Count of completed breathing cycles
let color = [255, 100, 150]; // Default circle color

var w = window.innerWidth;
var h = window.innerHeight;
let canvas;
function preload() {
  handPose = ml5.handPose(); // Load Handpose model
}

function setup() {
  canvas = createCanvas(w, h);
  angleMode(DEGREES);
  canvas.parent("canvas-container");

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose.detectStart(video, gotHands); // Start detecting hands
  instructions(true);
}

function draw() {
  background("#00111a");

  if (hands.length > 0) {
    instructions(false);
    let rightHand = hands[0];
    let leftHand = hands.length > 1 ? hands[1] : null;

    // Measure the distance between thumb and index finger
    let indexFinger = rightHand.keypoints[8];
    let thumb = rightHand.keypoints[4];
    let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

    // Update the breathing state based on the distance
    if (distance > 70 && state !== "Exhale") {
      state = "Exhale";
      if (lastState === "Inhale") {
        cycleCount++; // Increment cycle count on transition
      }
      lastState = "Exhale";
    } else if (distance <= 70 && state !== "Inhale") {
      state = "Inhale";
      if (lastState === "Exhale") {
        cycleCount++; // Increment cycle count on transition
      }
      lastState = "Inhale";
    }

    // Display breathing state and update visuals
    displayBreathingState(state, cycleCount);
    drawKaleidoscope(indexFinger, thumb);
    if (leftHand) {
      let leftIndexFinger = leftHand.keypoints[8];
      color = getColorFromPosition(leftIndexFinger);
    }
  } else {
    instructions(true);
  }
}
function windowResized() {
  // Resize canvas when the window size changes
  resizeCanvas(windowWidth, windowHeight);
}

function instructions(visible) {
  let heading = document.getElementById("heading");
  let instructionDiv = document.getElementById("instructions");

  if (visible) {
    heading.style.display = "block";
    instructionDiv.style.display = "block";
    instructionDiv.innerHTML = `
        <p>Place your hand in the frame</p>
    <p>Ensure the hand is well-lit</p>
    <p>Close your hand to 'Inhale'</p>
    <p>Open your hand to 'Exhale'</p>
    <p>Adjust the distance between fingers to change the pattern</p>
    <p>Move your left hand to change the color</p>`;
  } else {
    heading.style.display = "none";
    instructionDiv.style.display = "none";
  }
}

// Function to display the breathing state and cycle count
function displayBreathingState(state, cycleCount) {
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  if (state === "Inhale") {
    text("Exhale... Slowly open your hand", width / 2, 50);
  } else {
    text("Inhale... Slowly close your hand", width / 2, 50);
  }

  // Cycle count
  textSize(20);
  text(`Breathing Cycles: ${cycleCount}`, width / 2, height - 20);
}

// Function to draw the kaleidoscope pattern
function drawKaleidoscope(indexFinger, thumb) {
  translate(width / 2, height / 2);
  let symmetry = 12; // Number of kaleidoscope sections
  let angleStep = 360 / symmetry;

  for (let i = 0; i < symmetry; i++) {
    let angle = i * angleStep;

    push();
    rotate(angle);
    drawPattern(indexFinger, thumb);
    pop();
  }
}

// Function to draw the breathing pattern
function drawPattern(indexFinger, thumb) {
  let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);
  let size = map(distance, 0, 200, 30, 100);
  if (size < 80) size = 80;

  let posX = indexFinger.x - width / 2;
  let posY = indexFinger.y - height / 2;

  if (posX > -50 && posX < 50) posX = posX < 0 ? -50 : 50; // Push away from the center on X-axis
  if (posY > -50 && posY < 50) posY = posY < 0 ? -50 : 50; // Push away from the center on Y-axis

  noStroke();
  fill(color[0], color[1], color[2], 150); // Semi-transparent fill
  ellipse(posX, posY, size, size);
}

// Callback for hand detection results
function gotHands(results) {
  hands = results;
}
function getColorFromPosition(finger) {
  let x = finger.x;
  let y = finger.y;

  let r = map(x, 0, width, 100, 255);
  let g = map(y, 0, height, 100, 255);
  let b = map(x + y, 0, width + height, 200, 100);

  return [r, g, b];
}
