"use client"

import { useRef, useEffect } from "react"
import "./ImageComparison.css"

const ImageComparison = ({ image1, image2, differences, foundDifferences, activeHint, onImageClick }) => {
  const image1Ref = useRef(null)
  const image2Ref = useRef(null)
  const overlay1Ref = useRef(null)
  const overlay2Ref = useRef(null)

  // Effect to update markers when foundDifferences changes
  useEffect(() => {
    // Clear existing markers
    if (overlay1Ref.current) {
      const existingMarkers = overlay1Ref.current.querySelectorAll(".difference-marker")
      existingMarkers.forEach((marker) => marker.remove())
    }
    if (overlay2Ref.current) {
      const existingMarkers = overlay2Ref.current.querySelectorAll(".difference-marker")
      existingMarkers.forEach((marker) => marker.remove())
    }

    // Add markers for found differences
    foundDifferences.forEach((index) => {
      const diff = differences[index]
      if (overlay1Ref.current && overlay2Ref.current) {
        createDifferenceMarker(overlay1Ref.current, diff)
        createDifferenceMarker(overlay2Ref.current, diff)
      }
    })
  }, [foundDifferences, differences])

  // Effect to handle active hint
  useEffect(() => {
    // Clear existing hints
    clearHints()

    // Show hint if active
    if (activeHint !== null) {
      const diff = differences[activeHint]
      if (overlay1Ref.current && overlay2Ref.current) {
        createHintMarker(overlay1Ref.current, diff)
        createHintMarker(overlay2Ref.current, diff)
      }
    }

    return () => clearHints()
  }, [activeHint, differences])

  // Create a marker for a found difference
  const createDifferenceMarker = (overlay, diff) => {
    const marker = document.createElement("div")
    marker.className = "difference-marker"

    // Position and size the marker
    marker.style.left = `${diff.x + diff.width / 2}%`
    marker.style.top = `${diff.y + diff.height / 2}%`
    marker.style.width = `${diff.width}%`
    marker.style.height = `${diff.height}%`

    overlay.appendChild(marker)
  }

  // Create a hint marker
  const createHintMarker = (overlay, diff) => {
    const marker = document.createElement("div")
    marker.className = "hint-marker"

    // Position and size the marker
    marker.style.left = `${diff.x + diff.width / 2}%`
    marker.style.top = `${diff.y + diff.height / 2}%`
    marker.style.width = `${diff.width}%`
    marker.style.height = `${diff.height}%`

    overlay.appendChild(marker)
  }

  // Clear all hint markers
  const clearHints = () => {
    if (overlay1Ref.current) {
      const hintMarkers = overlay1Ref.current.querySelectorAll(".hint-marker")
      hintMarkers.forEach((marker) => marker.remove())
    }
    if (overlay2Ref.current) {
      const hintMarkers = overlay2Ref.current.querySelectorAll(".hint-marker")
      hintMarkers.forEach((marker) => marker.remove())
    }
  }

  return (
    <div className="image-comparison">
      <div className="image-wrapper" onClick={(e) => onImageClick(e, 0)}>
        <img ref={image1Ref} src={image1 || "/placeholder.svg"} alt="Original" className="comparison-image" />
        <div ref={overlay1Ref} className="image-overlay"></div>
      </div>

      <div className="image-wrapper" onClick={(e) => onImageClick(e, 1)}>
        <img ref={image2Ref} src={image2 || "/placeholder.svg"} alt="Modified" className="comparison-image" />
        <div ref={overlay2Ref} className="image-overlay"></div>
      </div>
    </div>
  )
}

export default ImageComparison
