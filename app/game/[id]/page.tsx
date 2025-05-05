'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

// 🧩 Components
import GameHeader from '@/app/components/GameHeader'
import TypingPrompt from '@/app/components/TypingPrompt'
import TypingInput from '@/app/components/TypingInput'
import PlayerList from '@/app/components/PlayerList'

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()

  const gameId = params?.id || 'unknown'
  const username = searchParams?.get('username') || 'Player'

  const [text, setText] = useState('')
  const [targetText] = useState('The quick brown fox jumps over the lazy dog.')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)

  // Start timer on first keystroke
  useEffect(() => {
    if (!startTime && text.length === 1) {
      setStartTime(Date.now())
    }
  }, [text, startTime])

  // WPM calculation
  useEffect(() => {
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      const words = text.length / 5
      setWpm(Math.round(words / elapsed))
    }
  }, [text, startTime])

  const handleReset = () => {
    setText('')
    setStartTime(null)
    setWpm(0)
  }

  // 🔧 Temporary mocked player list
  const mockPlayers = [
    { id: username, wpm },
    { id: 'Zane', wpm: 68 },
    { id: 'Fairuz', wpm: 74 },
    { id: 'Connor', wpm: 59 },
  ]

  return (
    <main className="min-h-screen px-4 py-10 bg-arcade-background text-arcade-text font-sans">
      <div className="max-w-3xl mx-auto space-y-10">

        <GameHeader roomId={gameId} username={username} />

        <div className="bg-arcade-background border border-arcade-secondary rounded-xl p-6 shadow-inner">
          <TypingPrompt prompt={targetText} userInput={text} />
          <TypingInput
            value={text}
            onChange={setText}
            disabled={text === targetText}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-lg font-arcade text-arcade-secondary">
            WPM: <span className="font-bold text-arcade-accent">{wpm}</span>
          </div>
          <button onClick={handleReset} className="arcade-button">
            Reset
          </button>
        </div>

        <div className="border-t border-arcade-secondary pt-4">
          <h2 className="font-arcade text-arcade-accent text-lg mb-2">Players</h2>
          <PlayerList players={mockPlayers} currentUser={username} />
        </div>
      </div>
    </main>
  )
}
