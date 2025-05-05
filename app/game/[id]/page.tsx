'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

import GameHeader from '@/app/components/GameHeader'
import TypingPrompt from '@/app/components/TypingPrompt'
import TypingInput from '@/app/components/TypingInput'
import PlayerList from '@/app/components/PlayerList'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
)

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const gameId = params?.id || 'unknown'
  const username = searchParams?.get('username') || 'Player'

  const [text, setText] = useState('')
  const [targetText] = useState('The quick brown fox jumps over the lazy dog.')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [presence, setPresence] = useState<any[]>([])

  const roomChannelRef = useRef<any>(null)

  useEffect(() => {
    const channel = supabase.channel(gameId, {
      config: {
        presence: { key: username }
      }
    })

    roomChannelRef.current = channel

    channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          const flat = Object.values(state).flat()
          setPresence(flat)
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('[join]', newPresences)
        })
        .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [gameId, username])

  useEffect(() => {
    if (!startTime && text.length === 1) {
      setStartTime(Date.now())
    }
  }, [text, startTime])

  useEffect(() => {
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      const words = text.length / 5
      setWpm(Math.round(words / elapsed))
    }
  }, [text, startTime])

  // Broadcast WPM
  useEffect(() => {
    const interval = setInterval(() => {
      roomChannelRef.current?.track({
        id: username,
        words: wpm
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [wpm, username])

  const handleReset = () => {
    setText('')
    setStartTime(null)
    setWpm(0)
  }

  const players = useMemo(() => {
    return presence.map((u: any) => ({
      id: u.id,
      wpm: u.words
    }))
  }, [presence])

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
            <PlayerList players={players} currentUser={username} />
          </div>
        </div>
      </main>
  )
}
