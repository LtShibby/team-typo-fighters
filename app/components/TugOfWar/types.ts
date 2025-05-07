export interface TugOfWarProps {
  gameId: string
  username: string
  prompts: {text: string}[]
  player1: string
  player2: string
  tugStartTime: number
  onGameReset?: () => void
}

export interface TugPlayer {
  id: string
  score: number
  isEliminated: boolean
}

export interface TugGameState {
  currentPrompt: {text: string}
  promptIndex: number
  prompts: {text: string}[]
  scores: Record<string, number>
  roundWinner: string | null
  gameWinner: string | null
  isCooldown: boolean
  cooldownEndTime: number | null
  gameStarted: boolean
  isSpectator: boolean
}

export type TugGameEvent =
  | { type: 'TUG_MODE_START'; payload: { prompts: {text: string}[] } }
  | { type: 'TUG_POINT_AWARDED'; payload: { playerId: string; newScore: number } }
  | { type: 'TUG_WINNER'; payload: { winnerId: string } }
  | { type: 'TUG_ROUND_END'; payload: { winnerId: string | null } }
  | { type: 'TUG_COOLDOWN_START'; payload: { endTime: number } }
  | { type: 'TUG_COOLDOWN_END' }
  | { type: 'TUG_COUNTDOWN_END' }
