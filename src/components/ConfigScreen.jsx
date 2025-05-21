"use client"

import { useState, useRef } from "react"
import DifferenceEditor from "./DifferenceEditor"
import "./ConfigScreen.css"

const ConfigScreen = ({ initialConfig, onStartGame }) => {
  const [gameTitle, setGameTitle] = useState(initialConfig.gameTitle)
  const [image1, setImage1] = useState(initialConfig.images.image1)
  const [image2, setImage2] = useState(initialConfig.images.image2)
  const [differences, setDifferences] = useState([]) // Start with empty differences array

  // New state for difference marking
  const [isMarkingDifference, setIsMarkingDifference] = useState(false)
  const [currentDifference, setCurrentDifference] = useState(null)
  const [markingStep, setMarkingStep] = useState(0) // 0: not marking, 1: first image, 2: second image
  const [markingMessage, setMarkingMessage] = useState("")

  const image1Ref = useRef(null)
  const image2Ref = useRef(null)

  // Handle image upload
  const handleImageUpload = (event, imageIndex) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (imageIndex === 0) {
        setImage1(e.target.result)
      } else {
        setImage2(e.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Start marking a new difference
  const startMarkingDifference = () => {
    if (!image1 || !image2) {
      alert("Please upload both images first")
      return
    }

    setIsMarkingDifference(true)
    setMarkingStep(1)
    setCurrentDifference({
      image1Point: null,
      image2Point: null,
      description: `Difference ${differences.length + 1}`,
    })
    setMarkingMessage("Click on the first image where you see a difference")
  }

  // Cancel marking difference
  const cancelMarkingDifference = () => {
    setIsMarkingDifference(false)
    setMarkingStep(0)
    setCurrentDifference(null)
    setMarkingMessage("")
  }

  // Handle image click when marking differences
  const handleImageClick = (event, imageIndex) => {
    if (!isMarkingDifference) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    if (markingStep === 1 && imageIndex === 0) {
      // First click on image 1
      setCurrentDifference((prev) => ({
        ...prev,
        image1Point: { x, y },
      }))
      setMarkingStep(2)
      setMarkingMessage("Now click on the second image at the corresponding location")
    } else if (markingStep === 2 && imageIndex === 1) {
      // Second click on image 2
      const image1Point = currentDifference.image1Point

      // Calculate the difference area (create a box around the points)
      const boxSize = 10 // Default size of 10% of the image

      const newDifference = {
        x: image1Point.x - boxSize / 2,
        y: image1Point.y - boxSize / 2,
        width: boxSize,
        height: boxSize,
        description: currentDifference.description,
      }

      // Add the new difference
      setDifferences((prev) => [...prev, newDifference])

      // Reset marking state
      setIsMarkingDifference(false)
      setMarkingStep(0)
      setCurrentDifference(null)
      setMarkingMessage("Difference added successfully! You can adjust its size and position in the list below.")

      // Clear message after 3 seconds
      setTimeout(() => {
        if (setMarkingMessage) {
          setMarkingMessage("")
        }
      }, 3000)
    }
  }

  // Update difference description
  const handleUpdateDifference = (index, updatedDifference) => {
    const newDifferences = [...differences]
    newDifferences[index] = updatedDifference
    setDifferences(newDifferences)
  }

  // Remove a difference
  const handleRemoveDifference = (index) => {
    const newDifferences = differences.filter((_, i) => i !== index)
    setDifferences(newDifferences)
  }

  // Start the game with current configuration
  const handleStartGame = () => {
    const gameConfig = {
      gameTitle,
      images: {
        image1,
        image2,
      },
      differences,
    }

    onStartGame(gameConfig)
  }

  // Save configuration to JSON file
  const handleSaveConfig = () => {
    const gameConfig = {
      gameTitle,
      images: {
        image1,
        image2,
      },
      differences,
    }

    const blob = new Blob([JSON.stringify(gameConfig, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "game-config.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Load configuration from JSON file
  const handleLoadConfig = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result)
        setGameTitle(config.gameTitle)
        setImage1(config.images.image1)
        setImage2(config.images.image2)
        setDifferences(config.differences)
      } catch (error) {
        alert("Invalid configuration file")
        console.error("Error parsing configuration:", error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container config-screen">
      <div className="header">
        <h1 className="title">Configure Spot the Difference Game</h1>
        <div className="header-actions">
          {isMarkingDifference ? (
            <button className="button secondary-button" onClick={cancelMarkingDifference}>
              Cancel Marking
            </button>
          ) : (
            <button className="button primary-button" onClick={startMarkingDifference}>
              Mark New Difference
            </button>
          )}
        </div>
      </div>

      {markingMessage && <div className="marking-message">{markingMessage}</div>}

      <div className="content">
        <div className="config-section">
          <h2>Game Settings</h2>

          <div className="form-group">
            <label className="form-label">Game Title</label>
            <input
              type="text"
              className="form-input"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              disabled={isMarkingDifference}
            />
          </div>

          <div className="image-upload-section">
            <div className="image-upload-container">
              <h3>Original Image</h3>
              <div
                className={`image-preview ${markingStep === 1 ? "active" : ""}`}
                onClick={(e) => handleImageClick(e, 0)}
              >
                {image1 ? (
                  <img
                    ref={image1Ref}
                    src={image1 || "/placeholder.svg"}
                    alt="Original"
                    className={markingStep === 1 ? "clickable" : ""}
                  />
                ) : (
                  <div className="upload-placeholder">No image selected</div>
                )}

                {currentDifference && currentDifference.image1Point && (
                  <div
                    className="marker-point"
                    style={{
                      left: `${currentDifference.image1Point.x}%`,
                      top: `${currentDifference.image1Point.y}%`,
                    }}
                  ></div>
                )}

                {/* Show existing differences */}
                {differences.map((diff, index) => (
                  <div
                    key={`diff1-${index}`}
                    className="existing-difference"
                    style={{
                      left: `${diff.x}%`,
                      top: `${diff.y}%`,
                      width: `${diff.width}%`,
                      height: `${diff.height}%`,
                    }}
                  >
                    <span className="difference-number">{index + 1}</span>
                  </div>
                ))}
              </div>

              {!isMarkingDifference && (
                <div className="upload-controls">
                  <input
                    type="file"
                    id="image1-upload"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 0)}
                    className="file-input"
                  />
                  <label htmlFor="image1-upload" className="button">
                    Upload Image
                  </label>
                </div>
              )}
            </div>

            <div className="image-upload-container">
              <h3>Modified Image</h3>
              <div
                className={`image-preview ${markingStep === 2 ? "active" : ""}`}
                onClick={(e) => handleImageClick(e, 1)}
              >
                {image2 ? (
                  <img
                    ref={image2Ref}
                    src={image2 || "/placeholder.svg"}
                    alt="Modified"
                    className={markingStep === 2 ? "clickable" : ""}
                  />
                ) : (
                  <div className="upload-placeholder">No image selected</div>
                )}

                {/* Show existing differences */}
                {differences.map((diff, index) => (
                  <div
                    key={`diff2-${index}`}
                    className="existing-difference"
                    style={{
                      left: `${diff.x}%`,
                      top: `${diff.y}%`,
                      width: `${diff.width}%`,
                      height: `${diff.height}%`,
                    }}
                  >
                    <span className="difference-number">{index + 1}</span>
                  </div>
                ))}
              </div>

              {!isMarkingDifference && (
                <div className="upload-controls">
                  <input
                    type="file"
                    id="image2-upload"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 1)}
                    className="file-input"
                  />
                  <label htmlFor="image2-upload" className="button">
                    Upload Image
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isMarkingDifference && (
          <div className="config-section">
            <h2>Differences ({differences.length})</h2>
            <p className="help-text">
              Click "Mark New Difference" to add differences by clicking on both images. You can adjust the size and
              position below.
            </p>

            {differences.length > 0 ? (
              <div className="differences-list">
                {differences.map((diff, index) => (
                  <DifferenceEditor
                    key={index}
                    index={index}
                    difference={diff}
                    onUpdate={handleUpdateDifference}
                    onRemove={handleRemoveDifference}
                  />
                ))}
              </div>
            ) : (
              <p className="no-differences">No differences defined yet. Click "Mark New Difference" to get started.</p>
            )}
          </div>
        )}

        {isMarkingDifference && (
          <div className="marking-instructions">
            <h3>Marking Instructions</h3>
            {markingStep === 1 && <p>Click on the first image where you see a difference</p>}
            {markingStep === 2 && <p>Now click on the second image at the corresponding location</p>}
          </div>
        )}

        <div className="config-actions">
          <div className="config-file-actions">
            <button className="button" onClick={handleSaveConfig} disabled={isMarkingDifference}>
              Save Configuration
            </button>

            <div className="file-upload-button">
              <input
                type="file"
                id="config-upload"
                accept=".json"
                onChange={handleLoadConfig}
                className="file-input"
                disabled={isMarkingDifference}
              />
              <label htmlFor="config-upload" className={`button ${isMarkingDifference ? "disabled" : ""}`}>
                Load Configuration
              </label>
            </div>
          </div>

          <button
            className="button primary-button"
            onClick={handleStartGame}
            disabled={isMarkingDifference || !image1 || !image2 || differences.length === 0}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigScreen
