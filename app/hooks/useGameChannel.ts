import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
)

export interface Player {
  id: string
  wpm: number
  isEliminated: boolean
  finalWpm: number | null
}

interface UseGameChannelProps {
  gameId: string
  username: string
  onGameStart?: (prompts: string[], startTime: number, tugPrompts: string[]) => void
  onGameReset?: () => void
  onElimination?: (eliminatedPlayer: string) => void
  onTugModeStart?: (player1:string, player2:string, startTime: number, tugPrompts: string[]) => void
  onWinner?: (winnerId: string) => void
  onTugPointAwarded?: (playerId: string, newScore: number) => void
  onTugWinner?: (winnerId: string) => void
}

export function useGameChannel({
  gameId,
  username,
  onGameStart,
  onGameReset,
  onElimination,
  onTugModeStart,
  onWinner,
  onTugPointAwarded,
  onTugWinner
}: UseGameChannelProps) {
  const [presence, setPresence] = useState<any[]>([])
  const [isChannelReady, setIsChannelReady] = useState(false)
  const [isEliminated, setIsEliminated] = useState(false)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const channelRef = useRef<any>(null)

  const isHost = useMemo(() => {
    return presence.length > 0 && presence[0].id === username
  }, [presence, username])

  const players = useMemo(() => {
    return presence.map((u: any) => ({
      id: u.id,
      wpm: u.words,
      isEliminated: u.isEliminated,
      finalWpm: u.finalWpm
    }))
  }, [presence])

  const handlePresenceSync = (channel: any) => {
    const state = channel.presenceState()
    const flat = Object.values(state).flat()
    // console.log('received presence:', flat);
    setPresence(flat)
  }

  const sendBroadcast = async (event: string, payload: Record<string, any>) => {
    if (!channelRef.current) {
      console.warn('Channel not ready for broadcasting')
      return
    }
    await channelRef.current.send({
      type: 'broadcast',
      event,
      payload
    })
  }

  const [timeSinceLastTracked, setTimeSinceLastTracked] = useState(0)

  const trackPresence = (data: { words: number; isEliminated: boolean; finalWpm: number | null }) => {
    if (!channelRef.current) {
      console.warn('Channel not ready for tracking')
      return
    }
    if (Date.now() - timeSinceLastTracked > 1000) {
      // console.log('Tracking presence:', { data, username });
      channelRef.current.track({ id: username, ...data })
      setTimeSinceLastTracked(Date.now())
    }
  }

  useEffect(() => {
    const channel = supabase.channel(gameId, {
      config: { presence: { key: username }, broadcast: { self: true } }
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => handlePresenceSync(channel))
      .on('broadcast', { event: 'game_start' }, ({ payload }) => {
        const { prompts, startTime, tugPrompts } = payload
        onGameStart?.(prompts.map((p: any) => p.text), startTime, tugPrompts.map((p: any) => p.text))
      })
      .on('broadcast', { event: 'game_reset' }, () => {
        onGameReset?.()
      })
      .on('broadcast', { event: 'game_elimination' }, ({ payload }) => {
        onElimination?.(payload.newElimination)
      })
      .on('broadcast', { event: 'game_winner' }, ({ payload }) => {
        setWinnerId(payload.winnerId)
        onWinner?.(payload.winnerId)
      })
      .on('broadcast', { event: 'tug_mode_start' }, ({ payload }) => {
        onTugModeStart?.(payload.player1, payload.player2, payload.startTime, payload.tugPrompts.map((p: any) => p.text))
      })
      .on('broadcast', { event: 'tug_point_awarded' }, ({ payload }) => {
        onTugPointAwarded?.(payload.playerId, payload.newScore)
      })
      .on('broadcast', { event: 'tug_winner' }, ({ payload }) => {
        onTugWinner?.(payload.winnerId)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              id: username,
              words: 0,
              isEliminated: false
            })
            setIsChannelReady(true)
          } catch (err) {
            console.error('Error tracking presence:', err)
          }
        }
      })

    return () => {
      channel.unsubscribe()
      setIsChannelReady(false)
    }
  }, [gameId, username])

  const broadcastTugRoundEnd = async (winnerId: string) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'tug_round_end',
      payload: { winnerId }
    });
  };

  return {
    isChannelReady,
    isHost,
    players,
    winnerId,
    trackPresence,
    isEliminated,
    setIsEliminated,
    broadcastGameStart: (prompts: any[], startTime: number, tugPrompts: any[]) =>
      sendBroadcast('game_start', { prompts, startTime, tugPrompts }),
    broadcastGameReset: () =>
      sendBroadcast('game_reset', {}),
    broadcastElimination: (eliminatedPlayer: string) =>
      sendBroadcast('game_elimination', { newElimination: eliminatedPlayer }),
    broadcastTugModeStart: (player1: string, player2: string, startTime: number, tugPrompts: any[]) =>
      sendBroadcast('tug_mode_start', { player1, player2, startTime, tugPrompts }),
    broadcastWinner: (winnerId: string) =>
      sendBroadcast('game_winner', { winnerId }),
    broadcastTugPointAwarded: (playerId: string, newScore: number) =>
      sendBroadcast('tug_point_awarded', { playerId, newScore }),
    broadcastTugWinner: (winnerId: string) =>
      sendBroadcast('tug_winner', { winnerId }),
    broadcastTugRoundEnd
  }
}
