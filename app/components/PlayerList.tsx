'use client'

import { useMemo } from 'react'

// [
//     { id: 'Player1', wpm: 72 },
//     { id: 'Player2', wpm: 59 },
//     ...
// ]


export default function PlayerList({ players, currentUser, currentWPM, gameStarted }: { players: any[], currentUser: string, currentWPM: number, gameStarted: boolean }) {
    const eliminatedPlayers:any[] = [];
    const activePlayers:any[] = [];
    const hostId = players?.[0]?.id;
    players.forEach(player => {
        if (player.isEliminated) {
            eliminatedPlayers.push(player);
        } else {
            activePlayers.push(player);
        }
    })
    const sortPlayers = (playerArray: any[]) => playerArray.sort((a, b) => a.wpm - b.wpm);

    sortPlayers(activePlayers);
    sortPlayers(eliminatedPlayers);

    const makeUserListItem = (player: any) => {
        return (<li key={player.id} className="flex justify-between">
                    <span className={player.id === currentUser ? 'text-arcade-accent' : (player.id === hostId ? 'text-arcade-secondary' : '')}>
                      {player.id === currentUser ? `${player.id} (You)` : player.id}{player.id === hostId ? ' (Host)' : ''}
                    </span>
                    {gameStarted
                        ? (<span
                            className="text-arcade-secondary">{player.isEliminated
                            ? player.finalWpm ?? 0
                            : (player.id === currentUser
                                ? currentWPM
                                : player.wpm)
                            } WPM</span>)
                        : (<span className="text-arcade-secondary">Joined</span>)
                    }
                </li>)
    }

    return (
        <div style={{marginTop:100}}>
            <div>
                <h2 className="text-lg space-y-1 font-arcade text-left">Typo Fighters</h2>
                <ul className="text-sm space-y-1 font-arcade">
                    {activePlayers.map((p) => (makeUserListItem(p)))}
              </ul>
          </div>
          {eliminatedPlayers.length > 0 && (
              <div>
                  <h2 className="eliminatedListTitle">Fighters Eliminated</h2>
                  <ul className="text-sm space-y-1 font-arcade">
                      {eliminatedPlayers.map((p) => (makeUserListItem(p)))}
                  </ul>
              </div>
          )}
      </div>
    )
}
