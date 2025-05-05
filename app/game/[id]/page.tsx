'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()

  // Extract and sanitize
  const gameId = params?.id || 'unknown'
  const username = searchParams?.get('username') || 'Player'

  // Local state
  const [text, setText] = useState('')
  const [targetText] = useState('The quick brown fox jumps over the lazy dog.')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)

  // Track when user starts typing
  useEffect(() => {
    if (!startTime && text.length === 1) {
      setStartTime(Date.now())
    }
  }, [text, startTime])

  // Calculate WPM
  useEffect(() => {
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60
      const wordsTyped = text.length / 5
      setWpm(Math.round(wordsTyped / timeElapsed))
    }
  }, [text, startTime])

  const handleReset = () => {
    setText('')
    setStartTime(null)
    setWpm(0)
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-arcade-background text-arcade-text font-sans">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-arcade text-arcade-accent tracking-wide">
            Game Room: <span className="text-arcade-secondary">{gameId}</span>
          </h1>
          <span className="text-arcade-secondary font-arcade text-sm sm:text-base">
            Player: {username}
          </span>
        </div>

        {/* Typing Area */}
        <div className="bg-arcade-background border border-arcade-secondary rounded-xl p-6 shadow-inner">
          <div className="text-xl sm:text-2xl font-arcade mb-4 leading-relaxed break-words">
            {targetText.split('').map((char, index) => {
              const isTyped = index < text.length
              const isCorrect = isTyped && text[index] === char
              const className = isTyped
                ? isCorrect
                  ? 'text-arcade-secondary'
                  : 'text-arcade-primary'
                : 'text-arcade-text'
              return (
                <span key={index} className={className}>
                  {char}
                </span>
              )
            })}
          </div>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="arcade-input w-full mt-2"
            placeholder="Start typing..."
            disabled={text === targetText}
          />
        </div>

        {/* Footer Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-lg font-arcade text-arcade-secondary">
            WPM: <span className="font-bold text-arcade-accent">{wpm}</span>
          </div>
          <button onClick={handleReset} className="arcade-button">
            Reset
          </button>
        </div>
      </div>
    </main>
  )
}
