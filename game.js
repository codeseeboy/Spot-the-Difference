document.addEventListener("DOMContentLoaded", () => {
  // Game state
  const gameState = {
    gameData: null,
    foundDifferences: [],
    startTime: null,
    timerInterval: null,
    soundEnabled: true,
    hintUsed: false,
    hintTimeout: null,
    imageLoaded: false, // Track if images are loaded
    clickEnabled: false, // Prevent clicks until images are fully loaded
  }

  // DOM Elements
  const elements = {
    image1: document.getElementById("image1"),
    image2: document.getElementById("image2"),
    image1Wrapper: document.getElementById("image1-wrapper"),
    image2Wrapper: document.getElementById("image2-wrapper"),
    gameTitle: document.getElementById("game-title"),
    timer: document.getElementById("timer"),
    score: document.getElementById("score"),
    hintBtn: document.getElementById("hint-btn"),
    restartBtn: document.getElementById("restart-btn"),
    soundBtn: document.getElementById("sound-btn"),
    soundIcon: document.getElementById("sound-icon"),
    successModal: document.getElementById("success-modal"),
    playAgainBtn: document.getElementById("play-again-btn"),
    finalTime: document.getElementById("final-time"),
    finalScore: document.getElementById("final-score"),
    loadingScreen: document.getElementById("loading-screen"),
    correctSound: document.getElementById("correct-sound"),
    wrongSound: document.getElementById("wrong-sound"),
    successSound: document.getElementById("success-sound"),
    hintSound: document.getElementById("hint-sound"),
  }

  // Initialize the game
  initGame()

  // Event listeners
  elements.image1Wrapper.addEventListener("click", handleImageClick)
  elements.image2Wrapper.addEventListener("click", handleImageClick)
  elements.hintBtn.addEventListener("click", showHint)
  elements.restartBtn.addEventListener("click", restartGame)
  elements.soundBtn.addEventListener("click", toggleSound)
  elements.playAgainBtn.addEventListener("click", restartGame)

  // Functions
  async function initGame() {
    try {
      showLoadingScreen()
      gameState.clickEnabled = false;

      // Fetch game data from JSON
      const response = await fetch("game-data.json")
      if (!response.ok) {
        throw new Error("Failed to load game data")
      }

      gameState.gameData = await response.json()

      // Set game title
      elements.gameTitle.textContent = gameState.gameData.gameTitle

      // Load images
      elements.image1.src = gameState.gameData.images.image1
      elements.image2.src = gameState.gameData.images.image2

      // Wait for images to load
      await Promise.all([imageLoaded(elements.image1), imageLoaded(elements.image2)])
      
      // Enable click interactions once images are loaded
      gameState.clickEnabled = true;
      gameState.imageLoaded = true;

      // Update score display
      updateScoreDisplay()

      // Start timer
      startTimer()

      // Hide loading screen
      hideLoadingScreen()
      
      // Add debug overlay for development (comment out for production)
      // addDebugOverlay();
      
    } catch (error) {
      console.error("Error initializing game:", error)
      alert("Failed to load the game. Please try again later.")
    }
  }

  function imageLoaded(imgElement) {
    return new Promise((resolve) => {
      if (imgElement.complete) {
        resolve()
      } else {
        imgElement.onload = resolve
      }
    })
  }

  function handleImageClick(event) {
    if (!gameState.gameData || !gameState.clickEnabled || !gameState.imageLoaded) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Calculate relative position (percentage)
    const relativeX = (x / rect.width) * 100
    const relativeY = (y / rect.height) * 100

    console.log(`Click at: ${relativeX.toFixed(2)}%, ${relativeY.toFixed(2)}%`);

    // Check if click is on a difference
    const clickedDifferenceIndex = findClickedDifference(relativeX, relativeY)

    if (clickedDifferenceIndex !== -1 && !gameState.foundDifferences.includes(clickedDifferenceIndex)) {
      // Found a new difference
      gameState.foundDifferences.push(clickedDifferenceIndex)
      markDifference(clickedDifferenceIndex)
      updateScoreDisplay()
      playSound(elements.correctSound)

      // Check if all differences are found
      if (gameState.foundDifferences.length === gameState.gameData.differences.length) {
        gameComplete()
      }
    } else if (clickedDifferenceIndex === -1) {
      // Wrong click
      showWrongClickEffect(event.currentTarget, x, y)
      playSound(elements.wrongSound)
    }
  }

  function findClickedDifference(relativeX, relativeY) {
    const tolerance = 4.0 // Click tolerance (4% of image size)

    for (let i = 0; i < gameState.gameData.differences.length; i++) {
      if (gameState.foundDifferences.includes(i)) continue

      const diff = gameState.gameData.differences[i]

      // Use the center and dimensions from game data (already in percentage)
      const diffCenterX = diff.x + (diff.width / 2)
      const diffCenterY = diff.y + (diff.height / 2)
      const diffRadiusX = diff.width / 2
      const diffRadiusY = diff.height / 2

      // Check if click is within the difference area (with tolerance)
      const distanceX = Math.abs(relativeX - diffCenterX)
      const distanceY = Math.abs(relativeY - diffCenterY)

      if (distanceX <= diffRadiusX + tolerance && distanceY <= diffRadiusY + tolerance) {
        return i
      }
    }

    return -1
  }

  function markDifference(differenceIndex) {
    const diff = gameState.gameData.differences[differenceIndex]

    // Create markers for both images
    createDifferenceMarker(elements.image1Wrapper.querySelector(".image-overlay"), diff)
    createDifferenceMarker(elements.image2Wrapper.querySelector(".image-overlay"), diff)
  }

  function createDifferenceMarker(overlay, diff) {
    const marker = document.createElement("div")
    marker.className = "difference-marker"

    // Position and size the marker using percentages
    marker.style.left = `${diff.x}%`
    marker.style.top = `${diff.y}%`
    marker.style.width = `${diff.width}%`
    marker.style.height = `${diff.height}%`
    
    // Center the marker on the difference
    marker.style.transform = "translate(-50%, -50%)"

    overlay.appendChild(marker)
  }

  function showWrongClickEffect(imageWrapper, x, y) {
    const overlay = imageWrapper.querySelector(".image-overlay")
    const wrongMark = document.createElement("div")
    wrongMark.className = "wrong-mark"
    wrongMark.style.left = `${x}px`
    wrongMark.style.top = `${y}px`
    wrongMark.innerHTML = "✕"
    wrongMark.style.position = "absolute"
    wrongMark.style.color = "red"
    wrongMark.style.fontSize = "24px"
    wrongMark.style.transform = "translate(-50%, -50%)"
    wrongMark.style.pointerEvents = "none"

    overlay.appendChild(wrongMark)

    // Animate and remove
    setTimeout(() => {
      wrongMark.style.opacity = "0"
      wrongMark.style.transform = "translate(-50%, -50%) scale(1.5)"
      wrongMark.style.transition = "all 0.3s ease"

      setTimeout(() => {
        overlay.removeChild(wrongMark)
      }, 300)
    }, 50)
  }

  function showHint() {
    if (!gameState.gameData || !gameState.clickEnabled || 
        gameState.foundDifferences.length === gameState.gameData.differences.length) {
      return
    }

    // Clear any existing hint
    clearHint()

    // Find a random unfound difference
    const unfoundDifferences = gameState.gameData.differences.filter(
      (_, index) => !gameState.foundDifferences.includes(index),
    )

    if (unfoundDifferences.length === 0) return

    const randomDiff = unfoundDifferences[Math.floor(Math.random() * unfoundDifferences.length)]

    // Create hint markers
    const hintMarker1 = createHintMarker(elements.image1Wrapper.querySelector(".image-overlay"), randomDiff)
    const hintMarker2 = createHintMarker(elements.image2Wrapper.querySelector(".image-overlay"), randomDiff)

    // Play hint sound
    playSound(elements.hintSound)

    // Remove hint after 3 seconds
    gameState.hintTimeout = setTimeout(() => {
      if (hintMarker1.parentNode) hintMarker1.parentNode.removeChild(hintMarker1)
      if (hintMarker2.parentNode) hintMarker2.parentNode.removeChild(hintMarker2)
    }, 3000)
  }

  function createHintMarker(overlay, diff) {
    const marker = document.createElement("div")
    marker.className = "hint-marker"

    // Position and size the marker using percentages
    marker.style.left = `${diff.x}%`
    marker.style.top = `${diff.y}%`
    marker.style.width = `${diff.width}%`
    marker.style.height = `${diff.height}%`
    
    // Center the marker on the difference
    marker.style.transform = "translate(-50%, -50%)"

    overlay.appendChild(marker)
    return marker
  }

  function clearHint() {
    if (gameState.hintTimeout) {
      clearTimeout(gameState.hintTimeout)
      gameState.hintTimeout = null
    }

    document.querySelectorAll(".hint-marker").forEach((marker) => {
      if (marker.parentNode) marker.parentNode.removeChild(marker)
    })
  }

  function startTimer() {
    gameState.startTime = Date.now()

    gameState.timerInterval = setInterval(() => {
      const elapsedTime = Date.now() - gameState.startTime
      const seconds = Math.floor(elapsedTime / 1000) % 60
      const minutes = Math.floor(elapsedTime / 60000)

      elements.timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }, 1000)
  }

  function stopTimer() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval)
      gameState.timerInterval = null
    }
  }

  function updateScoreDisplay() {
    if (!gameState.gameData) return

    const found = gameState.foundDifferences.length
    const total = gameState.gameData.differences.length
    elements.score.textContent = `${found}/${total}`
  }

  function gameComplete() {
    stopTimer()

    // Update final stats
    elements.finalTime.textContent = elements.timer.textContent
    elements.finalScore.textContent = elements.score.textContent

    // Play success sound
    playSound(elements.successSound)

    // Show success modal with slight delay for better UX
    setTimeout(() => {
      elements.successModal.style.display = "flex"
    }, 500)
  }

  function restartGame() {
    // Reset game state
    gameState.foundDifferences = []

    // Clear markers
    document.querySelectorAll(".difference-marker, .hint-marker").forEach((marker) => {
      if (marker.parentNode) marker.parentNode.removeChild(marker)
    })

    // Reset timer
    stopTimer()
    startTimer()

    // Update score display
    updateScoreDisplay()

    // Hide success modal
    elements.successModal.style.display = "none"

    // Clear any active hint
    clearHint()
  }

  function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled
    elements.soundIcon.textContent = gameState.soundEnabled ? "🔊" : "🔇"
  }

  function playSound(audioElement) {
    if (gameState.soundEnabled && audioElement) {
      audioElement.currentTime = 0
      audioElement.play().catch((error) => {
        console.warn("Audio playback failed:", error)
      })
    }
  }

  function showLoadingScreen() {
    elements.loadingScreen.style.display = "flex"
  }

  function hideLoadingScreen() {
    elements.loadingScreen.style.display = "none"
  }
  
  // Helper function to add visual debug overlay (for development purposes only)
  function addDebugOverlay() {
    const debugOverlay1 = document.createElement("div");
    debugOverlay1.className = "debug-overlay";
    elements.image1Wrapper.appendChild(debugOverlay1);
    
    const debugOverlay2 = document.createElement("div");
    debugOverlay2.className = "debug-overlay";
    elements.image2Wrapper.appendChild(debugOverlay2);
    
    // Add markers for all differences
    gameState.gameData.differences.forEach((diff, index) => {
      const marker1 = document.createElement("div");
      marker1.className = "debug-marker";
      marker1.textContent = index + 1;
      marker1.style.left = `${diff.x}%`;
      marker1.style.top = `${diff.y}%`;
      marker1.style.transform = "translate(-50%, -50%)";
      debugOverlay1.appendChild(marker1);
      
      const marker2 = document.createElement("div");
      marker2.className = "debug-marker";
      marker2.textContent = index + 1;
      marker2.style.left = `${diff.x}%`;
      marker2.style.top = `${diff.y}%`;
      marker2.style.transform = "translate(-50%, -50%)";
      debugOverlay2.appendChild(marker2);
    });
  }
})