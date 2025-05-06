import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
)

interface Player {
  id: string
  wpm: number
  isEliminated: boolean
}

interface UseGameChannelProps {
  gameId: string
  username: string
  onGameStart?: (prompts: string[], startTime: number) => void
  onGameReset?: () => void
  onElimination?: (eliminatedPlayer: string) => void
  onWinner?: (winnerId: string) => void
}

export function useGameChannel({
  gameId,
  username,
  onGameStart,
  onGameReset,
  onElimination,
  onWinner
}: UseGameChannelProps) {
  const [presence, setPresence] = useState<any[]>([])
  const [isChannelReady, setIsChannelReady] = useState(false)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const roomChannelRef = useRef<any>(null)
  const isInitializedRef = useRef(false)

  const isHost = useMemo(() => {
    if (!isChannelReady) return false
    // The first person in the presence array is the host
    return presence.length > 0 && presence[0].id === username
  }, [isChannelReady, presence, username])

  const players = useMemo(() => {
    return presence.map((u: any) => ({
      id: u.id,
      wpm: u.words,
      isEliminated: u.isEliminated
    }))
  }, [presence])

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return
    }
    isInitializedRef.current = true

    console.log('Initializing channel for game:', gameId, 'username:', username)
    
    const channel = supabase.channel(gameId, {
      config: { presence: { key: username } }
    })

    roomChannelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const flat = Object.values(state).flat()
        console.log('Presence sync:', flat)
        setPresence(flat)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('[join]', newPresences)
      })
      .on('broadcast', { event: 'game_start' }, ({ payload }) => {
        const { prompts, startTime } = payload
        onGameStart?.(prompts.map((p: any) => p.text), startTime)
      })
      .on('broadcast', { event: 'game_reset' }, () => {
        onGameReset?.()
      })
      .on('broadcast', { event: 'game_elimination' }, ({ payload }) => {
        const { newElimination } = payload
        onElimination?.(newElimination)
      })
      .on('broadcast', { event: 'game_winner' }, ({ payload }) => {
        const { winnerId } = payload
        setWinnerId(winnerId)
        onWinner?.(winnerId)
      })
      .subscribe(async (status) => {
        console.log('Channel subscription status:', status)
        if (status === 'SUBSCRIBED') {
          try {
            // Track initial presence when channel is subscribed
            await channel.track({
              id: username,
              words: 0,
              isEliminated: false
            })
            console.log('Initial presence tracked')
            setIsChannelReady(true)
          } catch (error) {
            console.error('Error tracking presence:', error)
          }
        }
      })

    return () => {
      console.log('Cleaning up channel')
      isInitializedRef.current = false
      channel.unsubscribe()
    }
  }, [gameId, username]) // Remove dependencies that cause re-renders

  const trackPresence = (data: { words: number; isEliminated: boolean }) => {
    if (!roomChannelRef.current) {
      console.warn('Channel not ready for tracking')
      return
    }
    roomChannelRef.current.track({
      id: username,
      ...data
    })
  }

  const broadcastGameStart = async (prompts: any[], startTime: number) => {
    if (!roomChannelRef.current) {
      console.warn('Channel not ready for broadcasting')
      return
    }
    await roomChannelRef.current.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { prompts, startTime }
    })
  }

  const broadcastGameReset = async () => {
    if (!roomChannelRef.current) {
      console.warn('Channel not ready for broadcasting')
      return
    }
    await roomChannelRef.current.send({
      type: 'broadcast',
      event: 'game_reset',
      payload: {}
    })
  }

  const broadcastElimination = async (eliminatedPlayer: string) => {
    if (!roomChannelRef.current) {
      console.warn('Channel not ready for broadcasting')
      return
    }
    await roomChannelRef.current.send({
      type: 'broadcast',
      event: 'game_elimination',
      payload: { newElimination: eliminatedPlayer }
    })
  }

  const broadcastWinner = async (winnerId: string) => {
    if (!roomChannelRef.current) {
      console.warn('Channel not ready for broadcasting')
      return
    }
    await roomChannelRef.current.send({
      type: 'broadcast',
      event: 'game_winner',
      payload: { winnerId }
    })
  }

  return {
    isChannelReady,
    isHost,
    players,
    winnerId,
    trackPresence,
    broadcastGameStart,
    broadcastGameReset,
    broadcastElimination,
    broadcastWinner
  }
} 