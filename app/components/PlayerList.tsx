'use client'

// [
//     { id: 'Player1', wpm: 72 },
//     { id: 'Player2', wpm: 59 },
//     ...
// ]
  

export default function PlayerList({ players, currentUser }: { players: any[], currentUser: string }) {
  return (
    <ul className="text-sm space-y-1 font-arcade">
      {players.map((p) => (
        <li key={p.id} className="flex justify-between">
          <span className={p.id === currentUser ? 'text-arcade-accent' : ''}>
            {p.id === currentUser ? `${p.id} (You)` : p.id}
          </span>
          <span className="text-arcade-secondary">{p.wpm} WPM</span>
        </li>
      ))}
    </ul>
  )
}
