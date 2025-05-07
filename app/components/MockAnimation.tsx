'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const basePlayers = [
  { name: 'TyperOne', wpm: 130 },
  { name: 'FastFingers', wpm: 110 },
  { name: 'SlowJoe', wpm: 80 },
  { name: 'ClickClack', wpm: 125 },
]

function generateFluctuatingWPM(base: number, steps = 20): number[] {
  return Array.from({ length: steps }, () =>
    Math.max(60, Math.min(140, base + Math.floor(Math.random() * 21 - 10)))
  )
}

export default function MockAnimation() {
  const [eliminated, setEliminated] = useState<string[]>([])
  const [showTug, setShowTug] = useState(false)
  const [scores, setScores] = useState<{ [key: string]: number }>({})
  const [winner, setWinner] = useState<string | null>(null)
  const [wpmMap, setWpmMap] = useState<{ [name: string]: number[] }>({})
  const [frozenWpm, setFrozenWpm] = useState<{ [name: string]: number }>({})
  const [tick, setTick] = useState(0)

  // Generate WPM fluctuation map
  useEffect(() => {
    const initialMap: { [name: string]: number[] } = {}
    basePlayers.forEach((p) => {
      initialMap[p.name] = generateFluctuatingWPM(p.wpm)
    })
    setWpmMap(initialMap)
  }, [])

  // Elimination and showdown flow
  useEffect(() => {
    if (winner || !Object.keys(wpmMap).length) return // Skip if winner exists or wpmMap is not ready

    const timeouts: NodeJS.Timeout[] = []

    console.log('Setting up elimination and showdown timeouts') // Debugging

    timeouts.push(
      setTimeout(() => {
        setEliminated((prev) => [...prev, 'SlowJoe'])
        setFrozenWpm((prev) => ({
          ...prev,
          SlowJoe: wpmMap['SlowJoe']?.[tick % wpmMap['SlowJoe'].length] ?? 80,
        }))
      }, 2000)
    )

    timeouts.push(
      setTimeout(() => {
        setEliminated((prev) => [...prev, 'FastFingers'])
        setFrozenWpm((prev) => ({
          ...prev,
          FastFingers: wpmMap['FastFingers']?.[tick % wpmMap['FastFingers'].length] ?? 110,
        }))
      }, 4000)
    )

    timeouts.push(
      setTimeout(() => {
        setShowTug(true)
        setScores({ TyperOne: 0, ClickClack: 0 })
        setFrozenWpm((prev) => ({
          ...prev,
          TyperOne: wpmMap['TyperOne']?.[tick % wpmMap['TyperOne'].length] ?? 130,
          ClickClack: wpmMap['ClickClack']?.[tick % wpmMap['ClickClack'].length] ?? 125,
        }))
      }, 5000)
    )

    const scoringRounds = [5500, 6000, 6500, 7000, 7500]
    let typerScore = 0
    let clickScore = 0

    scoringRounds.forEach((delay) => {
      timeouts.push(
        setTimeout(() => {
          const typerWinsRound = Math.random() < 0.6
          if (typerWinsRound) typerScore++
          else clickScore++

          setScores({ TyperOne: typerScore, ClickClack: clickScore })

          if (typerScore >= 3) setWinner('TyperOne')
          else if (clickScore >= 3) setWinner('ClickClack')
        }, delay)
      )
    })

    return () => {
      console.log('Cleaning up timeouts') // Debugging
      timeouts.forEach(clearTimeout)
    }
  }, [winner, wpmMap]) // Removed tick from dependencies

  // Tick for live WPM updates (only while active)
  useEffect(() => {
    if (showTug || winner) return // Freeze WPM on showdown or win

    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [showTug, winner])

  return (
    <section className="text-center space-y-8 mt-16">
      <h3 className="text-2xl font-bold text-arcade-accent">🤖 Simulation: Type to Survive</h3>

      <div className="flex justify-center gap-8 flex-wrap">
        {basePlayers.map((p) => {
          const isEliminated = eliminated.includes(p.name)
          const isFrozen = isEliminated || showTug
          const wpmArray = wpmMap[p.name] || []
          const fluctuatingWpm = wpmArray[tick % wpmArray.length] ?? p.wpm
          const currentWpm = isFrozen ? frozenWpm[p.name] ?? p.wpm : fluctuatingWpm

          return (
            <div key={p.name} className="relative flex flex-col items-center">
              <div className={`flex flex-col items-center ${isEliminated ? 'opacity-30 grayscale' : ''}`}>
                <div className="text-3xl">🧑‍💻</div>
                <div className="text-md font-mono mt-1">{p.name}</div>
                <div className="w-24 h-2 bg-gray-700 mt-1 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${currentWpm < 90 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((currentWpm / 140) * 100, 100)}%` }}
                    initial={false}
                    animate={{ width: `${Math.min((currentWpm / 140) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs mt-1 text-gray-300">{currentWpm} WPM</div>
              </div>

              {isEliminated && (
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                  <div className="text-red-600 text-5xl font-extrabold drop-shadow-lg">✖</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showTug && (
        <div className="mt-12 space-y-4">
          {winner && (
            <p className="text-lg text-arcade-accent font-bold mt-2">🏆 {winner} Wins!</p>
          )}
          <p className="text-lg text-arcade-muted">Final Showdown</p>
          <div className="flex justify-center gap-16 text-xl font-mono">
            <div className="text-green-400">
              TyperOne: {scores['TyperOne'] ?? 0}
            </div>
            <div className="text-green-400">
              ClickClack: {scores['ClickClack'] ?? 0}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}