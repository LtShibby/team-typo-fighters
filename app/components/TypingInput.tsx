'use client'

type TypingInputProps = {
  value: string
  prompt: string
  onChange: (text: string) => void
  onComplete?: () => void
  disabled?: boolean
}

export default function TypingInput({ value, prompt, onChange, onComplete, disabled }: TypingInputProps) {
  return disabled ? (
      <span className="font-arcade text-red-600">You've been eliminated!</span>
      ): (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue)
        if (onComplete && newValue === prompt) {
          onComplete()
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && value === prompt && onComplete) {
          onComplete()
        }
      }}
      autoFocus={true}
      onPaste={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      className="w-full p-4 text-xl font-mono bg-arcade-bg border-2 border-arcade-text text-black rounded-lg focus:outline-none focus:border-arcade-accent disabled:opacity-50"
      placeholder="Start typing..."
      disabled={disabled}
    />
  )
}
