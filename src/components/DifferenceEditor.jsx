"use client"

import { useState } from "react"
import "./DifferenceEditor.css"

const DifferenceEditor = ({ index, difference, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localDifference, setLocalDifference] = useState({ ...difference })

  const handleInputChange = (field, value) => {
    const updatedDifference = { ...localDifference }

    if (field === "x" || field === "y" || field === "width" || field === "height") {
      updatedDifference[field] = Number.parseFloat(value)
    } else {
      updatedDifference[field] = value
    }

    setLocalDifference(updatedDifference)
    onUpdate(index, updatedDifference)
  }

  return (
    <div className="difference-editor">
      <div className="difference-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Difference {index + 1}</h3>
        <div className="difference-actions">
          <button
            className="icon-button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(index)
            }}
          >
            🗑️
          </button>
          <span className="expand-icon">{isExpanded ? "▼" : "►"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="difference-details">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={localDifference.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="coordinates-grid">
            <div className="form-group">
              <label className="form-label">X Position (%)</label>
              <input
                type="number"
                className="form-input"
                value={localDifference.x}
                min="0"
                max="100"
                step="0.1"
                onChange={(e) => handleInputChange("x", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Y Position (%)</label>
              <input
                type="number"
                className="form-input"
                value={localDifference.y}
                min="0"
                max="100"
                step="0.1"
                onChange={(e) => handleInputChange("y", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Width (%)</label>
              <input
                type="number"
                className="form-input"
                value={localDifference.width}
                min="0"
                max="100"
                step="0.1"
                onChange={(e) => handleInputChange("width", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Height (%)</label>
              <input
                type="number"
                className="form-input"
                value={localDifference.height}
                min="0"
                max="100"
                step="0.1"
                onChange={(e) => handleInputChange("height", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DifferenceEditor
