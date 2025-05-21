"use client"

import "./GameControls.css"

const GameControls = ({ onShowHint, onRestart, onToggleSound, soundEnabled, onBackToConfig }) => {
  return (
    <div className="game-controls">
      <button className="button" onClick={onShowHint}>
        <span className="button-icon">💡</span>
        Hint
      </button>

      <button className="button" onClick={onRestart}>
        <span className="button-icon">🔄</span>
        Restart
      </button>

      <button className="button" onClick={onToggleSound}>
        <span className="button-icon">{soundEnabled ? "🔊" : "🔇"}</span>
        Sound
      </button>

      <button className="button" onClick={onBackToConfig}>
        <span className="button-icon">⚙️</span>
        Configure
      </button>
    </div>
  )
}

export default GameControls
