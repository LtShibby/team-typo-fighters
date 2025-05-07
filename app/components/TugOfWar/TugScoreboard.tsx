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
      <div>
          <div className="font-arcade w-full max-w-2xl mx-auto mb-6 mt-8 text-center text-arcade-accent text-2xl font-bold">
              First to 3 wins!
          </div>
          <div className="font-arcade w-full max-w-2xl mx-auto mb-8 mt-10">
              <div className="flex flex-col items-center text-center text-arcade-text text-2xl font-bold">
                  {/* Player 1 */}
                  <div className={`text-center pr-4 ${roundWinner === player1.id ? 'text-arcade-accent' : 'text-arcade-primary'}`}>{player1.id}</div>

                  {/* Score */}
                  <div
                      className={`relative flex flex-row px-4 border-8 
                      ${roundWinner === player1.id ? 'border-t-arcade-accent border-l-arcade-accent' : 'border-t-arcade-primary border-l-arcade-primary'}
                      ${roundWinner === player2.id ? 'border-r-arcade-accent border-b-arcade-accent' : 'border-r-arcade-secondary border-b-arcade-secondary'}
                      `}
                      style={{width: 500}}
                  >
                      <span className={`absolute left-10 text-arcade-primary text-center`}>{score1}</span>
                      <span className={`relative left-1/2 -translate-x-1 text-arcade-text text-center`}>-</span>
                      <span className={`absolute right-10 text-arcade-secondary text-center`}>{score2}</span>
                  </div>

                  {/* Player 2 */}
                  <div
                      className={`text-center pl-4  ${roundWinner === player2.id ? 'text-arcade-accent' : 'text-arcade-secondary'}`}>
                      {player2.id}
                  </div>
              </div>
          </div>
      </div>
      )
  }
