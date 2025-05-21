/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useRef, useEffect } from "react"
import "./GameScreen.css"

const GameScreen = ({ gameConfig, onBackToConfig }) => {
  const [foundDifferences, setFoundDifferences] = useState([])
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [clickPosition, setClickPosition] = useState(null)
  
  const image1Ref = useRef(null)
  const image2Ref = useRef(null)
  const image1ContainerRef = useRef(null)
  const image2ContainerRef = useRef(null)
  const timerRef = useRef(null)

  // Keep track of actual dimensions - FIX: Correctly define state and setter
  const [, setImage1Dimensions] = useState({ width: 0, height: 0 })
  const [, setImage2Dimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Start the timer
    setStartTime(Date.now())
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [startTime])

  // Track image dimensions when images load
  useEffect(() => {
    const updateImageDimensions = () => {
      if (image1Ref.current) {
        const { naturalWidth, naturalHeight } = image1Ref.current
        setImage1Dimensions({ width: naturalWidth, height: naturalHeight })
      }
      
      if (image2Ref.current) {
        const { naturalWidth, naturalHeight } = image2Ref.current
        setImage2Dimensions({ width: naturalWidth, height: naturalHeight })
      }
    }

    // Set up load event listeners
    if (image1Ref.current) {
      if (image1Ref.current.complete) {
        updateImageDimensions()
      } else {
        image1Ref.current.addEventListener('load', updateImageDimensions)
      }
    }
    
    if (image2Ref.current) {
      if (image2Ref.current.complete) {
        updateImageDimensions()
      } else {
        image2Ref.current.addEventListener('load', updateImageDimensions)
      }
    }

    return () => {
      if (image1Ref.current) {
        image1Ref.current.removeEventListener('load', updateImageDimensions)
      }
      if (image2Ref.current) {
        image2Ref.current.removeEventListener('load', updateImageDimensions)
      }
    }
  }, [])

  // Track game completion
  useEffect(() => {
    if (
      gameConfig.differences &&
      foundDifferences.length === gameConfig.differences.length &&
      foundDifferences.length > 0
    ) {
      setGameCompleted(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [foundDifferences, gameConfig.differences])

  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get normalized click coordinates (accounting for image and container sizes)
  const getNormalizedCoordinates = (event, containerRef, imageRef) => {
    if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 }
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const clickX = event.clientX - containerRect.left
    const clickY = event.clientY - containerRect.top
    
    // Get the displayed image dimensions
    const displayedWidth = imageRef.current.clientWidth
    const displayedHeight = imageRef.current.clientHeight
    
    // Calculate the offset if the image is centered in the container
    const offsetX = (containerRect.width - displayedWidth) / 2
    const offsetY = (containerRect.height - displayedHeight) / 2
    
    // Adjust click position based on image position within container
    const adjustedX = clickX - offsetX
    const adjustedY = clickY - offsetY
    
    // Convert to percentage of the displayed image size
    const x = (adjustedX / displayedWidth) * 100
    const y = (adjustedY / displayedHeight) * 100
    
    // Ensure coordinates are within bounds
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }
  }

  // Check if a click is inside a difference area
  const isClickInDifference = (coords, diff) => {
    return (
      coords.x >= diff.x &&
      coords.x <= diff.x + diff.width &&
      coords.y >= diff.y &&
      coords.y <= diff.y + diff.height
    )
  }

  // Handle image click
  const handleImageClick = (event, imageIndex) => {
    if (gameCompleted) return

    const containerRef = imageIndex === 0 ? image1ContainerRef : image2ContainerRef
    const imageRef = imageIndex === 0 ? image1Ref : image2Ref
    const coords = getNormalizedCoordinates(event, containerRef, imageRef)

    // Show click indicator
    setClickPosition({
      x: coords.x,
      y: coords.y,
      imageIndex,
    })

    // Clear click indicator after a short delay
    setTimeout(() => setClickPosition(null), 500)

    // Check if the click is on a difference that hasn't been found yet
    const foundDifferenceIndex = gameConfig.differences.findIndex(
      (diff, index) => !foundDifferences.includes(index) && isClickInDifference(coords, diff)
    )

    if (foundDifferenceIndex !== -1) {
      // Found a new difference
      setFoundDifferences((prev) => [...prev, foundDifferenceIndex])
    }
  }

  return (
    <div className="container game-screen">
      <div className="header">
        <h1 className="title">{gameConfig.gameTitle}</h1>
        <div className="game-status">
          <div className="timer">Time: {formatTime(timer)}</div>
          <div className="score">
            Found: {foundDifferences.length} / {gameConfig.differences.length}
          </div>
        </div>
      </div>

      {gameCompleted && (
        <div className="completion-message">
          <h2>Congratulations!</h2>
          <p>You found all the differences in {formatTime(timer)}!</p>
          <button className="button primary-button" onClick={onBackToConfig}>
            Play Again
          </button>
        </div>
      )}

      <div className="content">
        <div className="game-instructions">
          <p>Click on the spots where you see differences between the two images.</p>
        </div>

        <div className="images-container">
          <div className="game-image-container">
            <div 
              ref={image1ContainerRef}
              className="game-image" 
              onClick={(e) => handleImageClick(e, 0)}
            >
              <img ref={image1Ref} src={gameConfig.images.image1} alt="Original" />

              {/* Show found differences */}
              {foundDifferences.map((diffIndex) => (
                <div
                  key={`found-diff1-${diffIndex}`}
                  className="found-difference"
                  style={{
                    left: `${gameConfig.differences[diffIndex].x}%`,
                    top: `${gameConfig.differences[diffIndex].y}%`,
                    width: `${gameConfig.differences[diffIndex].width}%`,
                    height: `${gameConfig.differences[diffIndex].height}%`,
                  }}
                >
                  <span className="difference-number">{diffIndex + 1}</span>
                </div>
              ))}

              {/* Show click indicator */}
              {clickPosition && clickPosition.imageIndex === 0 && (
                <div
                  className="click-indicator"
                  style={{
                    left: `${clickPosition.x}%`,
                    top: `${clickPosition.y}%`,
                  }}
                ></div>
              )}
            </div>
          </div>

          <div className="game-image-container">
            <div 
              ref={image2ContainerRef}
              className="game-image" 
              onClick={(e) => handleImageClick(e, 1)}
            >
              <img ref={image2Ref} src={gameConfig.images.image2} alt="Modified" />

              {/* Show found differences */}
              {foundDifferences.map((diffIndex) => (
                <div
                  key={`found-diff2-${diffIndex}`}
                  className="found-difference"
                  style={{
                    left: `${gameConfig.differences[diffIndex].x}%`,
                    top: `${gameConfig.differences[diffIndex].y}%`,
                    width: `${gameConfig.differences[diffIndex].width}%`,
                    height: `${gameConfig.differences[diffIndex].height}%`,
                  }}
                >
                  <span className="difference-number">{diffIndex + 1}</span>
                </div>
              ))}

              {/* Show click indicator */}
              {clickPosition && clickPosition.imageIndex === 1 && (
                <div
                  className="click-indicator"
                  style={{
                    left: `${clickPosition.x}%`,
                    top: `${clickPosition.y}%`,
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>

        <div className="differences-list">
          <h3>Differences List</h3>
          <div className="differences-grid">
            {gameConfig.differences.map((diff, index) => (
              <div
                key={`diff-item-${index}`}
                className={`difference-item ${foundDifferences.includes(index) ? "found" : ""}`}
              >
                <span className="difference-number">{index + 1}</span>
                <span className="difference-description">
                  {diff.description || `Difference ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="game-actions">
          <button className="button" onClick={onBackToConfig}>
            Back to Config
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameScreen