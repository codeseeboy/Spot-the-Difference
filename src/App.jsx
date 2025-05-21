"use client"

import { useState } from "react"
import ConfigScreen from "./components/ConfigScreen"
import GameScreen from "./components/GameScreen"
import { defaultGameConfig } from "./data/defaultConfig"
import "./App.css"

function App() {
  const [gameConfig, setGameConfig] = useState(defaultGameConfig)
  const [isConfiguring, setIsConfiguring] = useState(true)
  const [gameKey, setGameKey] = useState(0) // Used to force re-render of game

  const handleStartGame = (config) => {
    setGameConfig(config)
    setIsConfiguring(false)
    setGameKey((prevKey) => prevKey + 1) // Force re-render when config changes
  }

  const handleBackToConfig = () => {
    setIsConfiguring(true)
  }

  return (
    <div className="app">
      {isConfiguring ? (
        <ConfigScreen initialConfig={gameConfig} onStartGame={handleStartGame} />
      ) : (
        <GameScreen key={gameKey} gameConfig={gameConfig} onBackToConfig={handleBackToConfig} />
      )}
    </div>
  )
}

export default App
