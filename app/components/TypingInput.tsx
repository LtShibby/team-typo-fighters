'use client'

type TypingInputProps = {
  value: string
  onChange: (text: string) => void
  disabled?: boolean
}

export default function TypingInput({ value, onChange, disabled }: TypingInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
