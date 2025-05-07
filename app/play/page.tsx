'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [username, setUsername] = useState('')
  const [gameId, setGameId] = useState('')
  const router = useRouter()

  const createGame = () => {
    if (!username) return
    const newGameId = Math.random().toString(36).substring(2, 8)
    router.push(`/game/${newGameId}?username=${username}`)
  }

  const joinGame = () => {
    if (!username || !gameId) return
    router.push(`/game/${gameId}?username=${username}`)
  }

  return (
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-arcade text-arcade-accent mb-8 animate-pulse-slow">
          Team Typo Fighters
        </h1>
        
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-arcade-secondary font-arcade">
              Enter Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="arcade-input w-full"
              placeholder="Player1"
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={createGame}
              className="arcade-button w-full"
            >
              Create New Game
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-arcade-secondary"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-arcade-background text-arcade-secondary">
                  OR
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="gameId" className="block text-arcade-secondary font-arcade">
                Join Existing Game
              </label>
              <input
                id="gameId"
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="arcade-input w-full"
                placeholder="Game ID"
              />
              <button
                onClick={joinGame}
                className="arcade-button w-full"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 