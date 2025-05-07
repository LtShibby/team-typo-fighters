import { useReducer, useEffect, useCallback, useRef } from 'react'
import { useGameChannel } from '@/app/hooks/useGameChannel'
import { useTypingStats } from '@/app/hooks/useTypingStats'
import { TugOfWarProps, TugGameState, TugGameEvent } from './types'
import { TugPrompt } from './TugPrompt'
import { TugScoreboard } from './TugScoreboard'

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

export function TugOfWar({ gameId, username, prompts, player1, player2 }: TugOfWarProps) {
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
    onElimination: (eliminatedPlayer) => {
      // Handle elimination if needed
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
          resetInput()
          isProcessingRef.current = false
        }, COOLDOWN_DURATION)
      }
    },
    onWinner: (winnerId) => {
      dispatch({ type: 'TUG_WINNER', payload: { winnerId } })
    }
  })

  const tugPlayers = players.filter(p => p.id === player1 || p.id === player2);

  const {
    text: currentInput,
    updateText: handleInputChange,
    reset: resetInput
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

        dispatch({ type: 'TUG_POINT_AWARDED', payload: { playerId: username, newScore } })

        // Check for winner
        if (newScore >= WINNING_SCORE) {
          broadcastWinner(username)
        } else {
          // Start cooldown
          dispatch({ type: 'TUG_ROUND_END', payload: { winnerId: username } })
        }
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
        resetInput()
      }, COOLDOWN_DURATION)
    }, ROUND_TIMEOUT)

    return () => {
      clearTimeout(timeoutId)
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current)
      }
    }
  }, [state.isCooldown, state.gameWinner, resetInput])

  if (!isChannelReady) {
    return <div className="text-arcade-text">Loading...</div>
  }

  if (state.gameWinner) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-arcade-text text-4xl mb-4">
          {state.gameWinner === username ? 'You Win!' : 'Game Over!'}
        </h2>
        <p className="text-arcade-text text-xl">
          {state.gameWinner === username
            ? 'Congratulations!'
            : `${state.gameWinner} wins!`}
        </p>
      </div>
    )
  }

  if (!state.gameStarted) {
    setTimeout(() => {
      dispatch({type: 'TUG_COUNTDOWN_END'})
      resetInput()
      isProcessingRef.current = false
      state.gameStarted = true
    }, COUNTDOWN_DURATION)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
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
          dispatch({ type: 'TUG_ROUND_END', payload: { winnerId: username } });
          broadcastTugRoundEnd(username);
          isProcessingRef.current = false;
        }}
      />
    </div>
  )
}
