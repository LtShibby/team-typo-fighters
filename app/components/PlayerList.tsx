'use client'

import { useMemo } from 'react'

// [
//     { id: 'Player1', wpm: 72 },
//     { id: 'Player2', wpm: 59 },
//     ...
// ]


export default function PlayerList({ players, currentUser, currentWPM, gameStarted }: { players: any[], currentUser: string, currentWPM: number, gameStarted: boolean }) {
  const sortedPlayers = useMemo(() => players.sort((a, b) => a.wpm - b.wpm), [players]);
  return (
    <ul className="text-sm space-y-1 font-arcade">
      {sortedPlayers
        .map((p) => (
        <li key={p.id} className="flex justify-between">
          <span className={p.id === currentUser ? 'text-arcade-accent' : ''} style={{textDecoration: p.isEliminated ? 'line-through' : 'inherit'}}>
            {p.id === currentUser ? `${p.id} (You)` : p.id}
          </span>
          {gameStarted
              ? ( <span className="text-arcade-secondary">{p.id === currentUser ? currentWPM: p.wpm} WPM</span> )
              : ( <span className="text-arcade-secondary">Joined</span> )
          }
        </li>
        ))}
    </ul>
  )
}
