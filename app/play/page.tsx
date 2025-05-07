'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [username, setUsername] = useState('')
  const [gameId, setGameId] = useState('')
  const [gameList, setGameList] = useState<string[]>(['abcdef', 'abfsdd'])
  const router = useRouter()

  async function uploadNewGame(roomCode: string) {
    try {
      const response = await fetch('https://python3-m-uvicorn-main-production.up.railway.app/create_game', {
        method: 'POST', // Use POST if sending a body
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON

        },
        body: JSON.stringify({
          room_code: roomCode, // Include the room_code in the JSON body
        }),
      });

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Error sending room_code:', error);
    }
  }

  async function getGameList() {
    try {
      const response = await fetch('https://python3-m-uvicorn-main-production.up.railway.app/list_games');

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const games:any[] = data.data.data;
      console.log('Response data:', data);

      const rooms:string[] = games.map(t => t.target_text)
      return rooms;
    } catch (error) {
      console.error('Error sending room_code:', error);
    }
  }

  const createGame = async () => {
    if (!username) return
    const newGameId = Math.random().toString(36).substring(2, 8)

    const response = await uploadNewGame(newGameId);
    console.log('API Response:', response);
    router.push(`/game/${newGameId}?username=${username}`)
  }

  const joinGame = () => {
    if (!username || !gameId) return
    router.push(`/game/${gameId}?username=${username}`)
  }

  const joinGameClicked = (roomCode: string) => {
    if (!username || !roomCode) return
    router.push(`/game/${roomCode}?username=${username}`)
  }

  useEffect(() => {
    // Fetch rooms from your API
    const gameData = getGameList();
    gameData.then((games) => {
      setGameList(games ?? []);
    });
  }, []); // Empty dependency array ensures this runs once

  return (
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-arcade text-arcade-accent mb-8 animate-pulse-slow">
          Team Typo Fighters
        </h1>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-arcade-secondary font-arcade">
              *Enter Username
            </label>
            <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="arcade-input w-full"
                placeholder="Player1"
            />
          </div>

          <div className="space-y-4">
            <button
                onClick={createGame}
                className="arcade-button w-full"
            >
              Create New Game
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-arcade-secondary"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-arcade-background text-arcade-secondary">
                  AND
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="gameId" className="block text-arcade-secondary font-arcade">
                Enter room code
              </label>
              <input
                  id="gameId"
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="arcade-input w-full"
                  placeholder="Game ID"
              />
              <button
                  onClick={joinGame}
                  className="arcade-button w-full"
              >
                Join Game
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-arcade-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-arcade-background text-arcade-secondary">
                  OR
                </span>
            </div>
          </div>

          <div className="font-arcade w-full max-w-md mx-auto mt-8">
            <label htmlFor="gameId" className="block text-arcade-secondary font-arcade">
              Join existing game below
            </label>
            <ul className="space-y-4">
              {gameList.map((room) => (
                  <li
                      key={room}
                      className="p-4 bg-arcade-background shadow-md rounded-lg flex justify-between items-center"
                  >
                    <span className="text-xl font-medium">{room}</span>
                    <button
                        onClick={() => joinGameClicked(room)}
                        className="arcade-button w-36 h-10"
                    >
                      Join
                    </button>
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
