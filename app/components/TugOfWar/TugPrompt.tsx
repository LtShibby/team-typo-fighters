import { useEffect, useState } from 'react'

interface TugPromptProps {
  prompt: string
  currentInput: string
  onInputChange: (text: string) => void
  isCooldown: boolean
  cooldownEndTime: number | null
}

export function TugPrompt({
  prompt,
  currentInput,
  onInputChange,
  isCooldown,
  cooldownEndTime
}: TugPromptProps) {
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!isCooldown || !cooldownEndTime) {
      setCooldownTimeLeft(0)
      return
    }

    const interval = setInterval(() => {
      const timeLeft = Math.max(0, cooldownEndTime - Date.now())
      setCooldownTimeLeft(timeLeft)

      if (timeLeft === 0) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isCooldown, cooldownEndTime])

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-8">
        {isCooldown ? (
          <div className="text-center">
            <div className="text-3xl mb-2 text-arcade-text">Round Over!</div>
            <div className="text-lg text-arcade-text">
              Next round in {(cooldownTimeLeft / 1000).toFixed(1)}s
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2 text-arcade-text">Type This:</div>
            <div className="text-2xl font-mono">
              {prompt.split('').map((char, index) => {
                const isTyped = index < currentInput.length
                const isCorrect = isTyped && currentInput[index] === char
                const className = isTyped
                  ? isCorrect
                    ? 'text-arcade-secondary'
                    : 'text-arcade-primary'
                  : 'text-arcade-text'
                return (
                  <span key={index} className={className}>
                    {char}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isCooldown}
          className="w-full p-4 text-xl font-mono bg-arcade-bg border-2 border-arcade-text text-black rounded-lg focus:outline-none focus:border-arcade-accent disabled:opacity-50"
          placeholder={isCooldown ? 'Waiting for next round...' : 'Start typing...'}
        />
      </div>
    </div>
  )
} 