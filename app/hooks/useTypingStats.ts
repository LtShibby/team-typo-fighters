import {useState, useEffect, useCallback} from 'react'

interface UseTypingStatsProps {
  onWpmChange?: (wpm: number) => void
  onTimePassedChange?: (timePassed: number) => void
  onComplete?: () => void
  currentPrompt?: string
  isEliminated?: boolean
}

export function useTypingStats({
  onWpmChange,
  onTimePassedChange,
  onComplete,
  currentPrompt,
  isEliminated
}: UseTypingStatsProps = {}) {
  const [text, setText] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [timePassed, setTimePassed] = useState<number | null>(null)
  const [previousPromptTextLength, setPreviousPromptTextLength] = useState(0)
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!startTime && gameStarted) {
      setStartTime(Date.now())
    }
  }, [text, startTime, gameStarted])

  useEffect(() => {
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000 / 60
      // Count only correctly typed characters
      let correctChars = 0
      if (currentPrompt) {
        for (let i = 0; i < text.length && i < currentPrompt.length; i++) {
          if (text[i] === currentPrompt[i]) {
            correctChars++
          }
        }
      }
      const words = (correctChars + previousPromptTextLength) / 5
      const newWpm = Math.round(words / elapsed)
      setWpm(newWpm)
      onWpmChange?.(newWpm)
    }
  }, [text, timePassed, startTime, previousPromptTextLength, onWpmChange, currentPrompt])

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000 / 60

        if (elapsed > 0) {
          const newTimePassed = (timePassed ?? 0) + (0.5)
          onTimePassedChange?.(newTimePassed)
          setTimePassed(newTimePassed)
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [startTime, timePassed, onTimePassedChange])

  // Check for prompt completion
  useEffect(() => {
    if (currentPrompt && text === currentPrompt) {
      onComplete?.()
    }
  }, [text, currentPrompt, onComplete])

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
    updateText,
    updatePreviousPromptLength,
    resetTimePassed,
    setGameStarted
  }
}
