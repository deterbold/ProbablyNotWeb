// Global variables
let video;
let classifier;
let isModelLoaded = false;

// Initialize the application when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeCamera();
  loadModel();
});

/**
 * Initialize camera and video stream
 */
async function initializeCamera() {
  video = document.getElementById("videoElement");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
    });
    video.srcObject = stream;

    // Wait for video to be ready
    video.addEventListener("loadedmetadata", () => {
      console.log("Camera initialized successfully");
    });
  } catch (error) {
    console.error("Error accessing camera:", error);
    showError(
      "Unable to access camera. Please ensure you have granted camera permissions and try again."
    );
  }
}

/**
 * Load ML5.js MobileNet model for image classification
 */
function loadModel() {
  try {
    // Load the MobileNet model
    classifier = ml5.imageClassifier("MobileNet", modelLoaded);
  } catch (error) {
    console.error("Error loading ML5 model:", error);
    showError("Failed to load AI model. Please refresh the page.");
  }
}

/**
 * Callback function when model is loaded
 */
function modelLoaded() {
  console.log("MobileNet model loaded successfully!");
  isModelLoaded = true;
}

/**
 * Take a picture from the video stream
 */
function takePicture() {
  if (!video.srcObject) {
    showError("Camera not available. Please check camera permissions.");
    return;
  }

  if (!isModelLoaded) {
    showError("AI model is still loading. Please wait a moment and try again.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert canvas to image element for ML5
  const img = new Image();
  img.onload = function () {
    analyzeImage(img, canvas.toDataURL("image/jpeg", 0.8));
  };
  img.src = canvas.toDataURL("image/jpeg", 0.8);
}

/**
 * Handle file upload
 */
function uploadPicture(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showError("Please select a valid image file.");
    return;
  }

  if (!isModelLoaded) {
    showError("AI model is still loading. Please wait a moment and try again.");
    return;
  }

  const img = new Image();
  const imageUrl = URL.createObjectURL(file);

  img.onload = function () {
    analyzeImage(img, imageUrl);
  };
  img.src = imageUrl;
}

/**
 * Analyze image using ML5.js MobileNet
 */
async function analyzeImage(img, imageUrl) {
  hideError();
  showLoading();

  try {
    // Classify the image using ML5.js
    const results = await new Promise((resolve, reject) => {
      classifier.classify(img, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    console.log("Classification results:", results);

    // Get the 3rd most likely result (index 2)
    let thirdMostLikely;
    if (results && results.length >= 3) {
      thirdMostLikely = results[2].label;
    } else if (results && results.length > 0) {
      // If less than 3 results, use the last available one
      thirdMostLikely = results[results.length - 1].label;
    } else {
      thirdMostLikely = "mysterious object";
    }

    // Clean up the label (remove commas and take first part if multiple labels)
    thirdMostLikely = thirdMostLikely.split(",")[0].trim();

    showResult(imageUrl, thirdMostLikely);
  } catch (error) {
    console.error("Error analyzing image:", error);
    showError("Failed to analyze image. Please try again.");
  } finally {
    hideLoading();
  }
}

/**
 * Display the analysis result
 */
function showResult(imageUrl, prediction) {
  const resultContainer = document.getElementById("resultContainer");
  const resultImage = document.getElementById("resultImage");
  const resultText = document.getElementById("resultText");

  resultImage.src = imageUrl;
  resultText.textContent = `Probably Not a ${prediction}`;

  // Hide camera and controls
  document.querySelector(".camera-container").style.display = "none";
  document.querySelector(".controls").style.display = "none";

  // Show result
  resultContainer.style.display = "block";
}

/**
 * Restart the application
 */
function restartApp() {
  // Hide result
  document.getElementById("resultContainer").style.display = "none";

  // Show camera and controls
  document.querySelector(".camera-container").style.display = "block";
  document.querySelector(".controls").style.display = "flex";

  // Reset file input
  document.getElementById("fileInput").value = "";

  // Clear any error messages
  hideError();
}

/**
 * Show loading indicator
 */
function showLoading() {
  document.getElementById("loading").style.display = "block";
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

/**
 * Show error message
 */
function showError(message) {
  const errorElement = document.getElementById("errorMessage");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

/**
 * Hide error message
 */
function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}

/**
 * Cleanup function when page is closed
 */
window.addEventListener("beforeunload", () => {
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }
});

/**
 * Handle page visibility changes to manage camera resources
 */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden, pause video if needed
    if (video && !video.paused) {
      video.pause();
    }
  } else {
    // Page is visible, resume video
    if (video && video.paused) {
      video.play();
    }
  }
});
