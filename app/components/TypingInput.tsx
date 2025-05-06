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
      onPaste={(e) => {
        e.preventDefault()
        alert('Nice try, but no pasting allowed.')
      }}
      className="arcade-input w-full mt-2"
      style={{ display: disabled ? 'none' : '' }}
      placeholder="Start typing..."
      disabled={disabled}
    />
  )
}
