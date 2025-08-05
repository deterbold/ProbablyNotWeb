// Global variables
let video;
let classifier;
let isModelLoaded = false;

// Initialize the application when page loads
document.addEventListener("DOMContentLoaded", async function () {
  initializeCamera();

  // Wait for ML5.js to load before initializing model
  if (typeof ml5 !== "undefined") {
    await loadModel();
  } else {
    // Wait for ML5.js to load
    const checkML5 = setInterval(async () => {
      if (typeof ml5 !== "undefined") {
        console.log("ML5.js loaded successfully");
        clearInterval(checkML5);
        await loadModel();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (typeof ml5 === "undefined") {
        clearInterval(checkML5);
        showError(
          "Failed to load ML5.js library. Please check your internet connection and refresh the page."
        );
      }
    }, 10000);
  }
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
async function loadModel() {
  try {
    console.log("Starting to load MobileNet model...");
    showModelLoading();

    // Load the MobileNet model with async/await syntax
    classifier = await ml5.imageClassifier("MobileNet");
    console.log("MobileNet model loaded successfully!");
    isModelLoaded = true;

    // Show the control buttons now that model is ready
    showControlButtons();
    hideModelLoading();
  } catch (error) {
    console.error("Error loading ML5 model:", error);
    showError("Failed to load AI model. Please refresh the page.");
    hideModelLoading();
  }
}

/**
 * Callback function when model is loaded (legacy support)
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
    console.log("Starting image analysis...");
    console.log("Model loaded status:", isModelLoaded);
    console.log("Classifier object:", classifier);

    if (!isModelLoaded || !classifier) {
      throw new Error("Model not loaded yet");
    }

    // Classify the image using ML5.js with async/await
    console.log("Calling classifier.classify...");
    const results = await classifier.classify(img);

    console.log("Classification results:", results);

    // Get the 3rd most likely result (index 2)
    let thirdMostLikely;
    if (results && results.length >= 3) {
      thirdMostLikely = results[2].label;
      console.log("Using 3rd result:", thirdMostLikely);
    } else if (results && results.length > 0) {
      // If less than 3 results, use the last available one
      thirdMostLikely = results[results.length - 1].label;
      console.log("Using last available result:", thirdMostLikely);
    } else {
      thirdMostLikely = "mysterious object";
      console.log("No results, using default");
    }

    // Clean up the label (remove commas and take first part if multiple labels)
    thirdMostLikely = thirdMostLikely.split(",")[0].trim();

    showResult(imageUrl, thirdMostLikely);
  } catch (error) {
    console.error("Error analyzing image:", error);
    showError(`Failed to analyze image: ${error.message}. Please try again.`);
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
  hideControlButtons();

  // Show result
  resultContainer.style.display = "block";
}

/**
 * Restart the application
 */
function restartApp() {
  // Hide result
  document.getElementById("resultContainer").style.display = "none";

  // Show camera and controls (only if model is loaded)
  document.querySelector(".camera-container").style.display = "block";
  if (isModelLoaded) {
    showControlButtons();
  }

  // Reset file input
  document.getElementById("fileInput").value = "";

  // Clear any error messages
  hideError();
}

/**
 * Show control buttons when model is loaded
 */
function showControlButtons() {
  const controlsElement = document.querySelector(".controls");
  if (controlsElement) {
    controlsElement.classList.add("visible");
    console.log("Control buttons are now visible");
  }
}

/**
 * Hide control buttons
 */
function hideControlButtons() {
  const controlsElement = document.querySelector(".controls");
  if (controlsElement) {
    controlsElement.classList.remove("visible");
  }
}

/**
 * Show model loading message
 */
function showModelLoading() {
  // You can add a specific loading message for model loading if desired
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.innerHTML = '<div class="spinner"></div>Loading AI model...';
    loadingElement.style.display = "block";
  }
}

/**
 * Hide model loading message
 */
function hideModelLoading() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = "none";
    // Reset to original message for image analysis
    loadingElement.innerHTML =
      '<div class="spinner"></div>Analyzing image with ML5.js...';
  }
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
