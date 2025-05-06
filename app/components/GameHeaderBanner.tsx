'use client'

export default function GameHeader({ roomId, username }: { roomId: string, username: string }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
      <h1 className="text-3xl sm:text-4xl font-arcade text-arcade-accent tracking-wide">
        Game Room: <span className="text-arcade-secondary">{roomId}</span>
      </h1>
      <span className="text-arcade-secondary font-arcade text-sm sm:text-base">
        Player: {username}
      </span>
    </div>
  )
}
