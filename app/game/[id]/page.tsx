'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

import GameHeaderBanner from '@/app/components/GameHeaderBanner'
import TypingPrompt from '@/app/components/TypingPrompt'
import TypingInput from '@/app/components/TypingInput'
import PlayerList from '@/app/components/PlayerList'
import { useGameChannel } from '@/app/hooks/useGameChannel'
import { useTypingStats } from '@/app/hooks/useTypingStats'
import { TugOfWar } from '@/app/components/TugOfWar'

interface Prompt {
  text: string
  winnerId?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
)

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const { id: gameId } = params
  const username = searchParams?.get('username') || 'Player'

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [previousPromptLength, setPreviousPromptLength] = useState(0)
  const [isTugMode, setIsTugMode] = useState(false)

  const {
    isChannelReady,
    isHost,
    players,
    trackPresence,
    broadcastGameStart,
    broadcastGameReset,
    broadcastElimination,
    broadcastWinner
  } = useGameChannel({
    gameId,
    username,
    onGameStart: (prompts, startTime) => {
      console.log('Game start received:', { prompts, startTime })
      setPrompts(prompts.map(text => ({ text })))
      setStartTime(startTime)
      setCountdown(3)

      // Start countdown for all players
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownInterval)
            return null
          }
          return (prev ?? 1) - 1
        })
      }, 1000)
    },
    onGameReset: () => {
      setPrompts([])
      setCountdown(null)
      setStartTime(null)
      setPreviousPromptLength(0)
      setIsTugMode(false)
    },
    onElimination: (eliminatedPlayer) => {
      // Check if we should enter Tug of War mode
      const remainingPlayers = players.filter(p => !p.isEliminated)
      if (remainingPlayers.length === 2) {
        setIsTugMode(true)
      }
    },
    onWinner: (winnerId) => {
      setCountdown(null)
      setStartTime(null)
    }
  })

  const {
    text,
    wpm,
    timePassed,
    reset: resetTypingStats,
    updateText,
    updatePreviousPromptLength
  } = useTypingStats({
    onWpmChange: (newWpm) => {

      trackPresence({ words: newWpm, isEliminated: false })
    }
  })

  useEffect(() => {
    if (isHost && timePassed && startTime && timePassed > 10000) {
      const playersRemaining = players
        .filter(p => !p.isEliminated)
        .sort((a, b) => a.wpm - b.wpm)

      if (playersRemaining.length > 0) {
        const playerToElim = playersRemaining[0]
        broadcastElimination(playerToElim.id)

        if (playersRemaining.length === 2) {
          broadcastWinner(playersRemaining[1].id)
        }
      }
    }
  }, [isHost, timePassed, startTime, players, broadcastElimination, broadcastWinner])

  // Add a separate effect to handle game state updates
  useEffect(() => {
    if (startTime && timePassed) {
      const playersRemaining = players.filter(p => !p.isEliminated)
      if (playersRemaining.length === 2) {
        setIsTugMode(true)
      }
    }
  }, [players, startTime, timePassed])

  // Add effect to track time passed for all players
  useEffect(() => {
    if (startTime && !countdown) {
      const interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsed = (currentTime - startTime) / 1000
        if (elapsed >= 0) {
          trackPresence({ words: wpm, isEliminated: false })
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime, countdown, wpm, trackPresence])

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

    // Set initial state for host
    setPrompts(finalPrompts)
    setCountdown(3)

    // Broadcast game start to all players
    await broadcastGameStart(finalPrompts, startTime)
  }

  if (!isChannelReady) {
    return <div className="text-arcade-text">Loading...</div>
  }

  if (isTugMode) {
    return (
      <TugOfWar
        gameId={gameId}
        username={username}
        prompts={prompts.map(p => p.text)}
      />
    )
  }

  const targetText = prompts[0]?.text || ''

  // console.log('Render state:', {
  //   isChannelReady,
  //   isHost,
  //   promptListLength: prompts.length,
  //   countdown,
  //   players,
  //   startTime,
  //   timePassed
  // })

  return (
    <main className="min-h-screen px-4 py-10 bg-arcade-background text-arcade-text font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        <GameHeaderBanner roomId={gameId} username={username} />

        {isChannelReady && (
          <>
            {countdown !== null ? (
              <div className="text-center">
                <div className="text-4xl font-bold">{countdown}</div>
              </div>
            ) : prompts.length > 0 ? (
              <div>
                {!prompts[0]?.winnerId && (
                  <>
                    <TypingPrompt prompt={targetText} userInput={text} />
                    <TypingInput
                      value={text}
                      onChange={updateText}
                      onComplete={() => {
                        updatePreviousPromptLength(targetText.length)
                        setPrompts(prev => prev.slice(1))
                        updateText('')
                      }}
                      disabled={false}
                    />
                  </>
                )}
                <PlayerList players={players} currentUser={username} currentWPM={wpm} gameStarted={true} />
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleStartGame}
                  disabled={!isHost}
                  className="px-4 py-2 bg-arcade-primary text-white rounded disabled:opacity-50"
                >
                  {isHost ? 'Start Game' : 'Waiting for host...'}
                </button>
                <PlayerList players={players} currentUser={username} currentWPM={wpm} gameStarted={false}/>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
