import {useState, useEffect, useCallback} from 'react'

interface UseTypingStatsProps {
  onWpmChange?: (wpm: number) => void
  onTimePassedChange?: (timePassed: number) => void
  onComplete?: () => void
  currentPrompt?: string
}

export function useTypingStats({ 
  onWpmChange, 
  onTimePassedChange,
  onComplete,
  currentPrompt 
}: UseTypingStatsProps = {}) {
  const [text, setText] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [timePassed, setTimePassed] = useState<number | null>(null)
  const [previousPromptTextLength, setPreviousPromptTextLength] = useState(0)

  useEffect(() => {
    if (!startTime && text.length === 1) {
      setStartTime(Date.now())
    }
  }, [text, startTime])

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000 / 60
        const words = (text.length + previousPromptTextLength) / 5
        const newWpm = Math.round(words / elapsed)
        setWpm(newWpm)
        onWpmChange?.(newWpm)

        if (elapsed > 0) {
          const newTimePassed = (timePassed ?? 0) + (elapsed * 60)
          setTimePassed(newTimePassed)
          onTimePassedChange?.(newTimePassed)
        }
      }, 100)

      return () => clearInterval(interval)
    }
  }, [text, startTime, previousPromptTextLength, onWpmChange, onTimePassedChange])

  // Check for prompt completion
  useEffect(() => {
    if (currentPrompt && text === currentPrompt) {
      onComplete?.()
    }
  }, [text, currentPrompt, onComplete])

  const reset = () => {
    setText('')
    setPreviousPromptTextLength(0)
    setStartTime(null)
    setWpm(0)
    setTimePassed(null)
  }

  const updateText = (newText: string) => {
    setText(newText)
  }

  const updatePreviousPromptLength = (length: number) => {
    setPreviousPromptTextLength(length)
  }

  const resetTimePassed = useCallback(() => {
    setTimePassed(0)
  }, [timePassed, setTimePassed])

  return {
    text,
    wpm,
    timePassed,
    startTime,
    reset,
    updateText,
    updatePreviousPromptLength,
    resetTimePassed
  }
}
