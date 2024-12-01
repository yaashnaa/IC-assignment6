let classifier; // Teachable Machine model
let video; // Webcam feed
let label = ""; // Current detected label
let guideBox = { x1: 200, y1: 100, x2: 440, y2: 380 }; // Guide box coordinates
let state = ""; // Current state (Inhale/Exhale)
let prevPosition = null; // Previous position for drawing
let paint = []; // Store the paint trail

function preload() {
  // Replace with your Teachable Machine model URL
  const modelURL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/model.json";
  classifier = ml5.imageClassifier(modelURL, modelLoaded);
}

function setup() {
  createCanvas(640, 480);

  // Capture the webcam feed
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start classifying after the model loads
  classifyVideo();
}

function draw() {
  background(0);

  // Display the flipped webcam feed
  push();
  translate(width, 0); // Flip horizontally
  scale(-1, 1);
  image(video, 0, 0);
  pop();

  // Draw the guide box
  drawGuideBox();

  // Display the current state
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(state, width / 2, 30);

  // Draw the paint trail
  drawTrail();
}

// Classify the video feed
function classifyVideo() {
  if (classifier && video) {
    classifier.classify(video, gotResult);
  }
}

// Handle classification results
function gotResult(results, error) {
  if (error) {
    console.error(error);
    return;
  }

  // Update the detected label
  label = results[0].label;

  // Determine the state and add to the trail
  updateStateAndTrail(label);

  // Reclassify the video
  classifyVideo();
}

function updateStateAndTrail(label) {
  let x, y;

  // Map the label to positions within the guide box
  if (label === "up-left") {
    x = guideBox.x1;
    y = guideBox.y1;
    state = "Inhale";
  } else if (label === "up-right") {
    x = guideBox.x2;
    y = guideBox.y1;
    state = "Inhale";
  } else if (label === "down-left") {
    x = guideBox.x1;
    y = guideBox.y2;
    state = "Exhale";
  } else if (label === "down-right") {
    x = guideBox.x2;
    y = guideBox.y2;
    state = "Exhale";
  } else {
    return; // Ignore undefined labels
  }

  // Add to the paint trail if there's a previous position
  if (prevPosition) {
    paint.push({
      x1: prevPosition.x,
      y1: prevPosition.y,
      x2: x,
      y2: y,
    });
  }

  // Update the previous position
  prevPosition = { x, y };
}

function drawGuideBox() {
  noFill();
  stroke(0, 255, 0);
  strokeWeight(2);
  rect(guideBox.x1, guideBox.y1, guideBox.x2 - guideBox.x1, guideBox.y2 - guideBox.y1);
}

function drawTrail() {
  stroke(255, 0, 0);
  strokeWeight(4);
  paint.forEach((line) => {
    line(line.x1, line.y1, line.x2, line.y2);
  });
}

function modelLoaded() {
  console.log("Teachable Machine Model Loaded!");
}
