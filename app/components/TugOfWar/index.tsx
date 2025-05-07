import {useReducer, useEffect, useCallback, useRef, useState} from 'react'
import { useGameChannel } from '@/app/hooks/useGameChannel'
import { useTypingStats } from '@/app/hooks/useTypingStats'
import { TugOfWarProps, TugGameState, TugGameEvent } from './types'
import { TugPrompt } from './TugPrompt'
import { TugScoreboard } from './TugScoreboard'
import EndGameScreen from '../EndGameScreen'

const ROUND_TIMEOUT = 30000 // 30 seconds
const COOLDOWN_DURATION = 3000 // 3 seconds
const COUNTDOWN_DURATION = 7000 // 7 seconds
const WINNING_SCORE = 3

const initialState: TugGameState = {
  currentPrompt: {text: ''},
  promptIndex: 0,
  prompts: [],
  scores: {},
  roundWinner: null,
  gameWinner: null,
  isCooldown: true,
  cooldownEndTime: Date.now() + COUNTDOWN_DURATION,
  gameStarted: false,
  isSpectator: true
}

function tugGameReducer(state: TugGameState, event: TugGameEvent): TugGameState {
  switch (event.type) {
    case 'TUG_MODE_START':
      return {
        ...state,
        currentPrompt: event.payload.prompts?.length == 0 ? state.currentPrompt : event.payload.prompts[0] || {text: ''},
        promptIndex: 0,
        prompts: event.payload.prompts?.length == 0 ? state.prompts : event.payload.prompts,
        isCooldown: true,
        cooldownEndTime: Date.now() + COUNTDOWN_DURATION
      }
    case 'TUG_POINT_AWARDED':
      return {
        ...state,
        scores: {
          ...state.scores,
          [event.payload.playerId]: event.payload.newScore
        }
      }
    case 'TUG_WINNER':
      return {
        ...state,
        gameWinner: event.payload.winnerId
      }
    case 'TUG_ROUND_END':
      return {
        ...state,
        roundWinner: event.payload.winnerId,
        isCooldown: true,
        cooldownEndTime: Date.now() + COOLDOWN_DURATION
      }
    case 'TUG_COOLDOWN_END':
      const nextIndex = state.promptIndex + 1
      const nextPrompt = state.prompts[nextIndex] || state.currentPrompt
      return {
        ...state,
        isCooldown: false,
        cooldownEndTime: null,
        roundWinner: null,
        currentPrompt: nextPrompt,
        promptIndex: nextIndex
      }
    case 'TUG_COUNTDOWN_END':
      return {
        ...state,
        isCooldown: false,
        cooldownEndTime: null,
        roundWinner: null
      }
    default:
      return state
  }
}

export function TugOfWar({ gameId, username, prompts, player1, player2, playerState }: TugOfWarProps) {
  const [hasSentScores, setHasSentScores] = useState(false)
  const [state, dispatch] = useReducer(tugGameReducer, {
    ...initialState,
    currentPrompt: prompts[0] || '',
    promptIndex: 0,
    prompts
  })

  if (username === player1 || username === player2) {
    state.isSpectator = false
  }

  const { isChannelReady, players, broadcastTugPointAwarded, broadcastWinner, broadcastTugRoundEnd } = useGameChannel({
    gameId,
    username,
    onGameStart: (newPrompts, startTime, tugPrompts) => {
      dispatch({
        type: 'TUG_MODE_START',
        payload: {
          prompts: tugPrompts.map(p => {
            return {text: p}
          })
        }
      })
    },
    onTugPointAwarded: (playerId, newScore) => {
      state.scores[playerId] = newScore
      state.roundWinner = playerId
      // Check for winner
      if (newScore >= WINNING_SCORE) {
        broadcastWinner(playerId)
      } else {
        dispatch({ type: 'TUG_POINT_AWARDED', payload: { playerId: playerId, newScore } })
        // Start cooldown
        dispatch({ type: 'TUG_ROUND_END', payload: { winnerId: playerId } })
        setTimeout(() => {
          dispatch({ type: 'TUG_COOLDOWN_END' })
          handleInputChange('')
          isProcessingRef.current = false
        }, COOLDOWN_DURATION)
      }
    },
    onWinner: async (winnerId) => {
      dispatch({ type: 'TUG_WINNER', payload: { winnerId } })
      if (username === player1) {
        await postHighScoreUpdates(winnerId)
      }
    }
  })

  const postHighScoreUpdates = useCallback(async (winnerId: string) => {
    if (hasSentScores) return
    setHasSentScores(true)
    const highScoreUpdates = playerState.map(p => ({
      username: p.id,
      highest_wpm: p.finalWpm || 0,
      games_played: 1,
      tug_entries: p.id === player1 || p.id === player2 ? 1 : 0,
      tug_wins: winnerId === p.id ? 1 : 0
    }))

    try {
      const response = await fetch('https://python3-m-uvicorn-main-production.up.railway.app/bulk_update_high_scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highScoreUpdates)
      })

      if (!response.ok) {
        throw new Error(`Failed to post scores: ${response.statusText}`)
      }
      console.log('High scores updated.')
    } catch (err) {
      console.error('Error posting high scores:', err)
    }
  }, [hasSentScores])

  const tugPlayers = players.filter(p => p.id === player1 || p.id === player2);

  const {
    text: currentInput,
    updateText: handleInputChange
  } = useTypingStats({
    onComplete: () => {
      if (state.isCooldown || state.gameWinner || isProcessingRef.current) return

      isProcessingRef.current = true
      const currentScore = state.scores[username] || 0
      const newScore = currentScore + 1

      // Clear any existing broadcast timeout
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }

      // Debounce the broadcast
      broadcastTimeoutRef.current = setTimeout(() => {
        // Broadcast point awarded
        broadcastTugPointAwarded(username, newScore) // Reusing elimination event for point awarding
      }, 100) // Small delay to prevent rapid updates
    },
    currentPrompt: state.currentPrompt.text
  })

  const isProcessingRef = useRef(false)
  const broadcastTimeoutRef = useRef<NodeJS.Timeout>()

  // Handle round timeout
  useEffect(() => {
    if (state.isCooldown || state.gameWinner) return

    const timeoutId = setTimeout(() => {
      dispatch({ type: 'TUG_ROUND_END', payload: { winnerId: null } })
      setTimeout(() => {
        dispatch({ type: 'TUG_COOLDOWN_END' })
        handleInputChange('')
      }, COOLDOWN_DURATION)
    }, ROUND_TIMEOUT)

    return () => {
      clearTimeout(timeoutId)
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }
    }
  }, [state.isCooldown, state.gameWinner])

  if (!isChannelReady) {
    return <div className="text-arcade-text">Loading...</div>
  }

  if (state.gameWinner) {
    return <EndGameScreen winner={state.gameWinner} username={username} />
  }

  if (!state.gameStarted) {
    setTimeout(() => {
      dispatch({type: 'TUG_COUNTDOWN_END'})
      isProcessingRef.current = false
      state.gameStarted = true
    }, COUNTDOWN_DURATION)
  }

  return (
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <TugScoreboard
            players={tugPlayers}
            scores={state.scores}
            roundWinner={state.roundWinner}
        />

        <TugPrompt
            prompt={state.currentPrompt?.text || ''}
            currentInput={currentInput}
            onInputChange={handleInputChange}
            isCooldown={state.isCooldown}
            cooldownEndTime={state.cooldownEndTime}
            gameStarted={state.gameStarted}
            isSpectator={state.isSpectator}
            onComplete={() => {
              if (isProcessingRef.current) return;
              isProcessingRef.current = true;
              dispatch({type: 'TUG_ROUND_END', payload: {winnerId: username}});
              broadcastTugRoundEnd(username);
              isProcessingRef.current = false;
            }}
        />
      </div>
    </main>
  )
}
