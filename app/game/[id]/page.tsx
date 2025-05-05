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
  const [promptList, setPromptList] = useState<string[]>([])
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [presence, setPresence] = useState<any[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isChannelReady, setIsChannelReady] = useState(false)

  const roomChannelRef = useRef<any>(null)
  const targetText = promptList[currentPromptIndex] || ''

  const isHost = useMemo(() => {
    return presence.length > 0 && presence[0]?.id === username
  }, [presence, username])

  useEffect(() => {
    const channel = supabase.channel(gameId, {
      config: { presence: { key: username } }
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
      .on('broadcast', { event: 'game_start' }, ({ payload }) => {
        const { prompts, startTime } = payload
        setPromptList(prompts.map((p: any) => p.text))

        const timeUntilStart = Math.max(startTime - Date.now(), 0)
        const initialCountdown = Math.ceil(timeUntilStart / 1000)
        setCountdown(initialCountdown)

        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === 1) {
              clearInterval(countdownInterval)
              return null
            }
            return (prev ?? 1) - 1
          })
        }, 1000)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsChannelReady(true)
        }
      })

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

  const handleStartGame = async () => {
    const startTime = Date.now() + 3000

    const { data: prompts, error } = await supabase.rpc('get_game_prompts')

    const fallbackPrompts = [
      { text: 'Life before death. Strength before weakness. Journey before destination.' },
      { text: 'Honor is not dead so long as he lives in the hearts of men.' },
      { text: 'Some men may be stronger than others. That does not give them the right to dominate those who are weaker.' },
      { text: 'You mustnt kneel to me. The Knights Radiant must stand again.' },
      { text: 'The most important step a man can take. Its not the first one, is it? Its the next one. Always the next step.' }
    ]

    const finalPrompts = (!error && prompts?.length > 0) ? prompts : fallbackPrompts

    if (error) {
      console.warn('Using fallback prompts due to RPC error:', error)
    }

    // Set prompts locally for the host
    setPromptList(finalPrompts.map((p: any) => p.text))
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval)
          return null
        }
        return (prev ?? 1) - 1
      })
    }, 1000)

    await roomChannelRef.current?.send({
      type: 'broadcast',
      event: 'game_start',
      payload: {
        prompts: finalPrompts,
        startTime
      }
    })
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

        {isChannelReady && (
          <>
            {promptList.length > 0 && countdown === null ? (
              <div className="text-center font-bold text-green-400 text-xl my-4 animate-pulse">
                🟢 Game in Progress
              </div>
            ) : isHost ? (
              <button
                onClick={handleStartGame}
                className="arcade-button bg-green-600 hover:bg-green-700"
              >
                Start Game
              </button>
            ) : (
              <div className="text-center font-bold text-yellow-400 text-xl my-4">
                WAITING FOR HOST TO START THE GAME
              </div>
            )}
          </>
        )}


        <div className="bg-arcade-background border border-arcade-secondary rounded-xl p-6 shadow-inner">
          <TypingPrompt prompt={targetText} userInput={text} />
          <TypingInput
            value={text}
            onChange={(newVal) => {
              setText(newVal)
              if (newVal === targetText) {
                setCurrentPromptIndex(prev => prev + 1)
                setText('')
              }
            }}
            disabled={text === targetText || countdown !== null}
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

        {countdown !== null && (
          <div className="text-center font-bold text-2xl text-arcade-accent">
            Game starts in: {countdown}
          </div>
        )}

        <div className="border-t border-arcade-secondary pt-4">
          <h2 className="font-arcade text-arcade-accent text-lg mb-2">Players</h2>
          <PlayerList players={players} currentUser={username} />
        </div>
      </div>
    </main>
  )
}
