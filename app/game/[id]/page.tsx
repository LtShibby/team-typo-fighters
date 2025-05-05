'use client'

import { useSearchParams } from 'next/navigation'
import {useState, useEffect, useMemo, useCallback} from 'react'
import { createClient } from '@supabase/supabase-js'

// 🧩 Components
import GameHeader from '@/app/components/GameHeader'
import TypingPrompt from '@/app/components/TypingPrompt'
import TypingInput from '@/app/components/TypingInput'
import PlayerList from '@/app/components/PlayerList'

class PresenceState {
  public presence_ref?: string;
  public id?: string;
  public words?: number;
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY!

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

  const [presence, setPresence] = useState<PresenceState[]>([])
  const players = useMemo(() => {
    return presence?.map(u => {
      return {
        id: u.id,
        wpm: u.words
      }
    })
  }, [presence])


  // Room state
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  // Join a room/topic
  const roomChannel = supabase.channel(gameId, {
    config: {
      presence: { key: username }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      roomChannel.track({
        id: username,
        words: wpm
      })
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Receive Presence updates
  const presenceChanged = () => {
    const newState = roomChannel.presenceState()
    console.log(newState);
  }

  roomChannel
      .on('presence', { event: 'sync' }, () => presenceChanged())
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log(newPresences);
        setPresence(newPresences);
      })
      .subscribe()

  const handleReset = () => {
    setText('')
    setStartTime(null)
    setWpm(0)
  }

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
          <PlayerList players={players ?? []} currentUser={username} />
        </div>
      </div>
    </main>
  )
}
