'use client'

export default function TypingPrompt({ prompt, userInput }: { prompt: string, userInput: string }) {
  return (
      <div>
        <div
            className="font-arcade text-2xl mb-2 text-arcade-secondary underline">{"Type This:"}
        </div>
        <div className="text-xl sm:text-2xl font-arcade mb-4 leading-relaxed break-words">
          {prompt.split('').map((char, index) => {
            const isTyped = index < userInput.length
            const isCorrect = isTyped && userInput[index] === char
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
  )
}
