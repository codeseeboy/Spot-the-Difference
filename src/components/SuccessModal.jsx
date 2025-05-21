"use client"

import "./SuccessModal.css"

const SuccessModal = ({ time, score, onPlayAgain, onBackToConfig }) => {
  return (
    <div className="modal-backdrop">
      <div className="success-modal">
        <h2>Congratulations! 🎉</h2>
        <p>You found all the differences!</p>

        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-label">Time:</span>
            <span className="summary-value">{time}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Differences Found:</span>
            <span className="summary-value">{score}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary-button" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="button" onClick={onBackToConfig}>
            Configure New Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
