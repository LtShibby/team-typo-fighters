import { Player } from '@/app/hooks/useGameChannel'

interface TugScoreboardProps {
  players: Player[]
  scores: Record<string, number>
  roundWinner: string | null
}

export function TugScoreboard({ players, scores, roundWinner }: TugScoreboardProps) {
  const [player1, player2] = players

  if (!player1 || !player2) {
    return null
  }

  const score1 = scores[player1.id] || 0
  const score2 = scores[player2.id] || 0

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 mt-10">
      <div className="flex justify-between items-center text-arcade-text text-2xl font-bold">
        <div className={`flex-1 text-right pr-4 ${roundWinner === player1.id ? 'text-arcade-accent' : 'text-arcade-primary'}`}>
          {player1.id}
        </div>
        <div className="px-4 border-8 border-arcade-background border-l-arcade-primary border-r-arcade-secondary">
          <span className={`text-arcade-primary`}>{score1}</span> — <span className={`text-arcade-secondary`}>{score2}</span>
        </div>
        <div className={`flex-1 text-left pl-4  ${roundWinner === player2.id ? 'text-arcade-accent' : 'text-arcade-secondary'}`}>
          {player2.id}
        </div>
      </div>
    </div>
  )
}
