'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const username = searchParams.get('username')
  const [text, setText] = useState('')
  const [targetText] = useState('The quick brown fox jumps over the lazy dog.')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)

  useEffect(() => {
    if (!startTime && text.length === 1) {
      setStartTime(Date.now())
    }
  }, [text, startTime])

  useEffect(() => {
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60 // in minutes
      const wordsTyped = text.length / 5 // assuming average word length of 5
      setWpm(Math.round(wordsTyped / timeElapsed))
    }
  }, [text, startTime])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-arcade text-arcade-accent">
            Game Room: {params.id}
          </h1>
          <div className="text-arcade-secondary font-arcade">
            Player: {username}
          </div>
        </div>

        <div className="bg-arcade-background p-6 rounded-lg border-2 border-arcade-secondary">
          <div className="font-arcade text-arcade-text mb-4">
            {targetText.split('').map((char, index) => (
              <span
                key={index}
                className={`
                  ${index < text.length 
                    ? text[index] === char 
                      ? 'text-arcade-secondary' 
                      : 'text-arcade-primary'
                    : 'text-arcade-text'
                  }
                `}
              >
                {char}
              </span>
            ))}
          </div>
          
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="arcade-input w-full"
            placeholder="Start typing..."
            disabled={text === targetText}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-arcade-secondary font-arcade">
            WPM: {wpm}
          </div>
          <button
            onClick={() => {
              setText('')
              setStartTime(null)
              setWpm(0)
            }}
            className="arcade-button"
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  )
} 