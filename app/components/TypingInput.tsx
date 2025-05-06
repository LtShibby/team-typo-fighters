'use client'

type TypingInputProps = {
  value: string
  onChange: (text: string) => void
  onComplete?: () => void
  disabled?: boolean
}

export default function TypingInput({ value, onChange, onComplete, disabled }: TypingInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue)
        if (onComplete && newValue === value) {
          onComplete()
        }
      }}
      onPaste={(e) => {
        e.preventDefault()
        alert('Nice try, but no pasting allowed.')
      }}
      className="arcade-input w-full mt-2"
      placeholder="Start typing..."
      disabled={disabled}
    />
  )
}
