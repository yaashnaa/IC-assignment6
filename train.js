let handPose;
let video;
let hands = [];
let state = "Inhale"; // Current breathing state
let breathProgress = 0; // Progress for smooth animation
let maxBreathProgress = 300; // Duration for one breath cycle
let lastDistance = 0; // Store the last distance between thumb and index
let cycleCount = 0; // Count of completed breathing cycles
let color = [255, 100, 150]; // Default circle color
let countdown = 5;
let timerStart = 0;
let rotationAngle = 0;
let timerStarted = false;

function preload() {
  handPose = ml5.handPose(); // Load Handpose model
}

function setup() {
  createCanvas(740, 580);
  angleMode(DEGREES);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose.detectStart(video, gotHands); // Start detecting hands
  timerStart = millis();
  setTimeout(() => {
    timerStarted = true; // Set flag to true after 2 seconds
    timerStart = millis(); // Initialize timerStart for countdown
  }, 1000);

}

function draw() {
  background(0);

  // image(video, 0, 0, width, height);

  if (timerStarted) {
    timer();
  }

  if (hands.length > 0) {
    // Check for both han
    timerStarted = true;
    console.log("hand detected starting timer");

    let rightHand = hands[0];
    let leftHand = hands.length > 1 ? hands[1] : null;

    // Handle right-hand breathing logic
    if (rightHand) {
      let indexFinger = rightHand.keypoints[8];
      let thumb = rightHand.keypoints[4];

      // Measure the distance between thumb and index finger
      let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

      // Determine the breathing state
      if (distance > 100 && state !== "Exhale") {
        state = "Exhale";
        breathProgress = 0; // Reset the progress
      } else if (distance <= 100 && state !== "Inhale") {
        state = "Inhale";
        breathProgress = 0; // Reset the progress
      }

      // Smoothly animate the breathing progress
      breathProgress = min(breathProgress + 1, maxBreathProgress);

      // Update the kaleidoscope pattern
      drawKaleidoscope(indexFinger, thumb, breathProgress, maxBreathProgress);
    }

    // Handle left-hand color logic
    if (leftHand) {
      let leftIndexFinger = leftHand.keypoints[8];
      color = getColorFromPosition(leftIndexFinger);
    }
  } else {
    // Prompt to ensure hand is detected
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Place your hand in the frame", width / 2, height / 2);
    timerStarted = false;
  }

  // Display the cycle count
  displayCycleCount();
}

function timer() {
  let elapsedTime = (millis() - timerStart) / 1000;
  let remainingTime = Math.ceil(countdown - elapsedTime);

  text(remainingTime, width / 2, height / 2);

  if (elapsedTime >= countdown) {
    timerStart = millis();
    state = "Inhale" ? "Inhale " : "Exhal";
    cycleCount++;
  }
  text(state == "Breathe in" ? "Inhale" : "Exhale", width / 2, height / 2 - 200);
}
// Function to draw the kaleidoscope pattern
function drawKaleidoscope(indexFinger, thumb, progress, maxProgress) {
    translate(width / 2, height / 2);
    let symmetry = 12; // Number of kaleidoscope sections
    let angleStep = 360 / symmetry;
    rotationAngle += 1; // Increment rotation angle for smooth rotation
    rotate(rotationAngle);
  
    for (let i = 0; i < symmetry; i++) {
      let angle = i * angleStep;
  
      // Draw the pattern at each angle
      push();
      rotate(angle);
      drawPattern(indexFinger, thumb);
      pop();
    }
  }
  

  function drawPattern(indexFinger, thumb) {
    let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);
  
    // Calculate the size of the circle, with a minimum size of 30
    let size = map(distance, 0, 200, 30, 100);
    if (size < 80) size = 80; // Ensure the circle is never smaller than 30
  
    // Calculate the position of the circle
    let posX = indexFinger.x - width / 2;
    let posY = indexFinger.y - height / 2;
  
    // Prevent the circle from getting too close to the center (timer area)
    if (posX > -50 && posX < 50) posX = posX < 0 ? -50 : 50; // Push away from the center on X-axis
    if (posY > -50 && posY < 50) posY = posY < 0 ? -50 : 50; // Push away from the center on Y-axis
  
    // Draw the circle
    noStroke();
    fill(color[0], color[1], color[2], 150); // Semi-transparent fill
    ellipse(posX, posY, size, size);
  }
  
// Function to display the cycle count
function displayCycleCount() {
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(`Breathing Cycles: ${Math.floor(cycleCount)}`, width / 2, height - 20);
}

// Function to change color based on left-hand position
function getColorFromPosition(finger) {
  let x = finger.x;
  let y = finger.y;

  let r = map(x, 0, width, 100, 255);
  let g = map(y, 0, height, 100, 255);
  let b = map(x + y, 0, width + height, 200, 100);

  return [r, g, b];
}

// Callback for hand detection results
function gotHands(results) {
  hands = results;
}
