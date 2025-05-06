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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
)

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const gameId = params?.id || 'unknown'
  const username = searchParams?.get('username') || 'Player'

  const [promptList, setPromptList] = useState<string[]>([])
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isEliminated, setIsEliminated] = useState(false)

  const {
    isChannelReady,
    isHost,
    players,
    winnerId,
    trackPresence,
    broadcastGameStart,
    broadcastGameReset,
    broadcastElimination,
    broadcastWinner
  } = useGameChannel({
    gameId,
    username,
    onGameStart: (prompts, startTime) => {
      setPromptList(prompts)
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
    },
    onGameReset: () => {
      updateText('')
      updatePreviousPromptLength(0)
      setCountdown(null)
      setCurrentPromptIndex(0)
      setPromptList([])
      setIsEliminated(false)
      resetTypingStats()

      if (isHost) {
        broadcastGameReset()
      }
    },
    onElimination: (eliminatedPlayer) => {
      if (username === eliminatedPlayer) {
        setIsEliminated(true)
      }
    },
    onWinner: (winner) => {
      // Winner is already set in the hook
    }
  })

  const {
    text,
    wpm,
    timePassed,
    startTime,
    reset: resetTypingStats,
    updateText,
    updatePreviousPromptLength
  } = useTypingStats({
    onWpmChange: (newWpm) => {
      trackPresence({ words: newWpm, isEliminated })
    }
  })

  useEffect(() => {
    if (isHost && timePassed && startTime && timePassed > 5) {
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
  }, [startTime, isHost, timePassed, players])

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

    await broadcastGameStart(finalPrompts, startTime)
  }

  const targetText = promptList[currentPromptIndex] || ''

  console.log('Render state:', {
    isChannelReady,
    isHost,
    promptListLength: promptList.length,
    countdown,
    players
  })

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
            ) : promptList.length > 0 ? (
              <div>
                {!winnerId && (
                  <>
                    <TypingPrompt prompt={targetText} userInput={text} />
                    <TypingInput
                      value={text}
                      onChange={updateText}
                      onComplete={() => {
                        updatePreviousPromptLength(targetText.length)
                        setCurrentPromptIndex(prev => prev + 1)
                        updateText('')
                      }}
                      disabled={isEliminated}
                    />
                  </>
                )}
                <PlayerList players={players} currentUser={username} currentWPM={wpm} />
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
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
