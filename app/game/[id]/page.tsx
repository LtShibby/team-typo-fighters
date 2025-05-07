'use client'

import { useSearchParams } from 'next/navigation'
import {useState, useEffect, useCallback} from 'react'
import { createClient } from '@supabase/supabase-js'

import GameHeaderBanner from '@/app/components/GameHeaderBanner'
import TypingPrompt from '@/app/components/TypingPrompt'
import TypingInput from '@/app/components/TypingInput'
import PlayerList from '@/app/components/PlayerList'
import { useGameChannel } from '@/app/hooks/useGameChannel'
import { useTypingStats } from '@/app/hooks/useTypingStats'
import { TugOfWar } from '@/app/components/TugOfWar'
import {EliminationTimer} from "@/app/components/EliminationTimer";

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
  const [tugPrompts, setTugPrompts] = useState<Prompt[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isTugMode, setIsTugMode] = useState(false)
  const [tugPlayer1, setTugPlayer1] = useState('')
  const [tugPlayer2, setTugPlayer2] = useState('')
  const [tugStartTime, setTugStartTime] = useState<number | null>(null)
  const [finalWpm, setFinalWpm] = useState<number | null>(null)

  const {
    isChannelReady,
    isHost,
    players,
    trackPresence,
    isEliminated,
    setIsEliminated,
    broadcastGameStart,
    broadcastGameReset,
    broadcastElimination,
    broadcastTugModeStart,
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
            setGameStarted(true)
            return null
          }
          return (prev ?? 1) - 1
        })
      }, 1000)
    },
    onGameReset: () => {
      setTugStartTime(null)
      setTugPlayer1('')
      setTugPlayer2('')
      setPrompts([])
      setCountdown(null)
      setGameStarted(false)
      setStartTime(null)
      setIsTugMode(false)
      setFinalWpm(null)
      setIsEliminated(false)
    },
    onElimination: useCallback((eliminatedPlayer: string) => {
      if (eliminatedPlayer === username) {
        setIsEliminated(true)
        trackPresence({ words: wpm, isEliminated: true, finalWpm: finalWpm })
      }
    }, []),
    onWinner: (winnerId) => {
      setCountdown(null)
      setStartTime(null)
    },
    onTugModeStart: (player1, player2, startTime) =>{
      setIsTugMode(true)
      setTugPlayer1(player1)
      setTugPlayer2(player2)
      setTugStartTime(startTime)
    }
  })

  const {
    text,
    wpm,
    timePassed,
    reset: resetTypingStats,
    updateText,
    updatePreviousPromptLength,
    resetTimePassed,
    setGameStarted
  } = useTypingStats({
    onWpmChange: useCallback((newWpm: number) => {
      if (isEliminated && finalWpm === null) {
        setFinalStats()
      }
      trackPresence({ words: newWpm, isEliminated: isEliminated, finalWpm: finalWpm })
    }, [trackPresence]),
    isEliminated: isEliminated
  })

  const setFinalStats = useCallback(() => {
    setIsEliminated(true)
    setFinalWpm(wpm)
  }, [setIsEliminated, setFinalWpm, wpm])

  const onPlayerElimination = useCallback(() => {
    if (isHost) {
      const playersRemaining = players
        .filter(p => !p.isEliminated)
        .sort((a, b) => a.wpm - b.wpm)

      if (playersRemaining.length > 0) {
        const playerToElim = playersRemaining[0]
        broadcastElimination(playerToElim.id)
        if (playerToElim.id === username) {
          setFinalStats()
        }
        const remainingPlayers = playersRemaining.filter(p => p.id !== playerToElim.id)
        if (remainingPlayers.length === 2) {
          const tugStartTime = Date.now() + 5000;
          broadcastTugModeStart(remainingPlayers[0].id, remainingPlayers[1].id, tugStartTime)
          setIsTugMode(true)
          setTugPlayer1(remainingPlayers[0].id)
          setTugPlayer2(remainingPlayers[1].id)
          setTugStartTime(tugStartTime)
        }
      }
    }
    resetTimePassed()
  }, [isHost, wpm, username, timePassed, startTime, players, broadcastElimination, broadcastWinner, resetTimePassed])

  // Add effect to track time passed for all players
  useEffect(() => {
    if (startTime && !countdown) {
      const interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsed = (currentTime - startTime) / 1000
        if (elapsed >= 0) {
          trackPresence({ words: wpm, isEliminated: isEliminated, finalWpm: finalWpm })
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime, countdown, wpm, trackPresence])

  const handleStartGame = async () => {
    const startTime = Date.now() + 3000;

    // Fallback prompts in case API fails
    const fallbackRegularPrompts = [
      { text: 'Life before death. Strength before weakness. Journey before destination.' },
      { text: 'Honor is not dead so long as he lives in the hearts of men.' },
      { text: 'Some men may be stronger than others. That does not give them the right to dominate those who are weaker.' },
      { text: 'You mustnt kneel to me. The Knights Radiant must stand again.' },
      { text: 'The most important step a man can take. Its not the first one, is it? Its the next one. Always the next step.' }
    ];

    const fallbackTugPrompts = [
      { text: 'What is sanity, but a shared hallucination we cling to in a universe that forgot its own rules?' },
      { text: 'All this happened, more or less.' },
      { text: 'QUANTUM COLLAPSE: superposition lost in /dev/void' },
      { text: 'VIRUS DETECTED: recursive thoughts infecting /mind/os' },
      { text: 'I am the voice between the beats. I am what is lost in the pause. I am the silence that screams.' }
    ];

    try {
      const response = await fetch('https://python3-m-uvicorn-main-production.up.railway.app/get_game_prompts');
      const json = await response.json();
      console.log('API Response:', json);

      if (!json?.data?.result || !Array.isArray(json.data.result)) {
        throw new Error('Invalid prompt format from API');
      }

      if (!json?.data?.tug_of_war || !Array.isArray(json.data.tug_of_war)) {
        throw new Error('Invalid tug of war prompt format from API');
      }

      const regularPrompts = json.data.result.map((p: { text: string }) => ({ text: p.text }));
      const tugPrompts = json.data.tug_of_war.map((p: { text: string }) => ({ text: p.text }));

      console.log('Parsed prompts:', { regular: regularPrompts, tug: tugPrompts });
      
      setPrompts(regularPrompts);
      setTugPrompts(tugPrompts);
      setCountdown(3);

      await broadcastGameStart(regularPrompts, startTime);

      if (isHost && players.length === 2) {
        const tugStartTime = Date.now() + 5000;
        await broadcastTugModeStart(players[0].id, players[1].id, tugStartTime);
        setIsTugMode(true);
        setTugPlayer1(players[0].id);
        setTugPlayer2(players[1].id);
        setTugStartTime(tugStartTime);
        return;
      }
    } catch (err) {
      console.warn('Failed to fetch from API, using fallback prompts:', err);
      setPrompts(fallbackRegularPrompts);
      setTugPrompts(fallbackTugPrompts);
      setCountdown(3);

      await broadcastGameStart(fallbackRegularPrompts, startTime);

      if (isHost && players.length === 2) {
        const tugStartTime = Date.now() + 5000;
        await broadcastTugModeStart(players[0].id, players[1].id, tugStartTime);
        setIsTugMode(true);
        setTugPlayer1(players[0].id);
        setTugPlayer2(players[1].id);
        setTugStartTime(tugStartTime);
        return;
      }
    }
  }

  if (!isChannelReady) {
    return (
      <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
        <div className="retro-grid opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-arcade-text">Loading...</div>
        </div>
      </main>
    )
  }

  if (isTugMode) {
    return (
      <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
        <div className="retro-grid opacity-50"></div>
        <div className="relative z-10">
          <TugOfWar
            gameId={gameId}
            username={username}
            prompts={tugPrompts.map(p => p.text)}
            player1={tugPlayer1}
            player2={tugPlayer2}
            tugStartTime={tugStartTime!}
          />
        </div>
      </main>
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
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <GameHeaderBanner roomId={gameId} username={username} />

        {isChannelReady && (
          <>
            {countdown !== null ? (
                <div className="text-center">
                  <div className="text-4xl font-bold">{countdown}</div>
                  <PlayerList players={players} currentUser={username} currentWPM={wpm} gameStarted={true}/>
                </div>
            ) : prompts.length > 0 ? (
                <div>
                  {!prompts[0]?.winnerId && (
                      <>
                        <TypingPrompt prompt={targetText} userInput={text}/>
                        <TypingInput
                            value={text}
                            prompt={targetText}
                            onChange={updateText}
                            onComplete={() => {
                              updatePreviousPromptLength(targetText.length)
                              setPrompts(prev => prev.slice(1))
                              updateText('')
                            }}
                            disabled={isEliminated}
                        />
                      </>
                  )}
                  <EliminationTimer
                      duration={10}
                      timePassed={timePassed}
                      onComplete={onPlayerElimination}/>
                  <PlayerList players={players} currentUser={username} currentWPM={wpm} gameStarted={true}/>
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
