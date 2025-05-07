'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MockAnimation from './components/MockAnimation'
import HighScores from './components/HighScores'

type ScoreKey = 'highest_wpm' | 'games_played' | 'tug_entries' | 'tug_wins'

type ScoreEntry = {
  username: string
  highest_wpm: number
  games_played: number
  tug_entries: number
  tug_wins: number
}

// TypingAnimation Component
interface TypingAnimationProps {
  text: string
  as?: keyof JSX.IntrinsicElements // Allow rendering as different HTML tags
  className?: string
  typingSpeed?: number // ms per character
  typoChance?: number // Probability of a typo (0 to 1)
  onComplete?: () => void // Callback when typing is complete
}

const nearbyKeys: { [key: string]: string[] } = {
  'a': ['s', 'q', 'z', 'w'],
  'b': ['v', 'n', 'h'],
  'c': ['x', 'd', 'f', 'v'],
  'e': ['w', 'r', 'd', 's'],
  // Add more for a realistic QWERTY typo simulation
  'i': ['u', 'o', 'k', 'j'],
  'l': ['k', 'o', 'p'],
  'n': ['b', 'm', 'h', 'j'],
  'o': ['i', 'p', 'l', 'k'],
  'r': ['e', 't', 'f', 'd'],
  's': ['a', 'd', 'w', 'x'],
  't': ['r', 'y', 'g', 'f'],
  'w': ['q', 'e', 's', 'a'],
  'y': ['t', 'u', 'h', 'g'],
  // Simplified; extend for all letters if needed
}

function normalizeHighScores(data: any): ScoreEntry[] {
  const merged: Record<string, Partial<ScoreEntry>> = {}

  const keys: ScoreKey[] = ['highest_wpm', 'games_played', 'tug_entries', 'tug_wins']
  for (const key of keys) {
    for (const entry of data[key] || []) {
      const user = entry.username
      if (!merged[user]) merged[user] = { username: user, highest_wpm: 0, games_played: 0, tug_entries: 0, tug_wins: 0 }
      merged[user][key] = entry[key]
    }
  }

  return Object.values(merged).map(entry => ({
    username: entry.username!,
    highest_wpm: entry.highest_wpm || 0,
    games_played: entry.games_played || 0,
    tug_entries: entry.tug_entries || 0,
    tug_wins: entry.tug_wins || 0,
  }))
}


function TypingAnimation({
  text,
  as: Tag = 'span',
  className,
  typingSpeed = 200,
  typoChance = 0.25,
  onComplete,
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const isInView = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView.current) {
          isInView.current = true
          setIsTyping(true)
        }
      },
      { threshold: 0.1 }
    )

    const currentElement = document.getElementById(`typing-${text.slice(0, 10)}`)
    if (currentElement) observer.observe(currentElement)

    return () => {
      if (currentElement) observer.unobserve(currentElement)
    }
  }, [text])

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (currentIndex >= text.length && onComplete) onComplete()
      return
    }

    const typeNextCharacter = () => {
      if (Math.random() < typoChance && currentIndex < text.length - 1) {
        // Insert a typo
        const correctChar = text[currentIndex].toLowerCase()
        const possibleTypos = nearbyKeys[correctChar] || ['x', 'z']
        const typoChar =
          possibleTypos[Math.floor(Math.random() * possibleTypos.length)]
        setDisplayText((prev) => prev + typoChar)

        // Backspace after a short delay
        setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1))
          // Type correct character after backspacing
          setTimeout(() => {
            setDisplayText((prev) => prev + text[currentIndex])
            setCurrentIndex((i) => i + 1)
          }, typingSpeed / 2)
        }, typingSpeed)
      } else {
        // Type correct character
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((i) => i + 1)
      }
    }

    const timer = setTimeout(typeNextCharacter, typingSpeed)

    return () => clearTimeout(timer)
  }, [currentIndex, isTyping, text, typingSpeed, typoChance, onComplete])

  return (
    <Tag id={`typing-${text.slice(0, 10)}`} className={className}>
      {displayText}
      {isTyping && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </Tag>
  )
}

export default function Home() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<ScoreKey>('highest_wpm')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [allScores, setAllScores] = useState<ScoreEntry[]>([])

  // const mockHighScores: ScoreEntry[] = [
  //   {
  //     username: 'keyboard_queen',
  //     highest_wpm: 110,
  //     games_played: 4,
  //     tug_entries: 2,
  //     tug_wins: 2,
  //   },
  //   {
  //     username: 'fast_fingers',
  //     highest_wpm: 95,
  //     games_played: 6,
  //     tug_entries: 4,
  //     tug_wins: 1,
  //   },
  //   {
  //     username: 'typo_tycoon',
  //     highest_wpm: 88,
  //     games_played: 10,
  //     tug_entries: 7,
  //     tug_wins: 3,
  //   },
  //   {
  //     username: 'click_clack',
  //     highest_wpm: 102,
  //     games_played: 3,
  //     tug_entries: 1,
  //     tug_wins: 1,
  //   },
  //   {
  //     username: 'wpm_warrior',
  //     highest_wpm: 120,
  //     games_played: 8,
  //     tug_entries: 5,
  //     tug_wins: 4,
  //   },
  // ]

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('https://python3-m-uvicorn-main-production.up.railway.app/high_scores')
        const json = await res.json()
        const normalized = normalizeHighScores(json)
        if (normalized.length > 0) {
          setAllScores(normalized)
        } 
        if (normalized.length === 0) {
          setAllScores(normalized)
        }
        else {
          throw new Error('Empty scores')
        }
      } catch (err) {
        console.warn('Failed to fetch high scores:', err)
        // setAllScores(mockHighScores)
      }
    }
  
    fetchScores()
  }, [])
  

  const sortedScores = [...allScores].sort((a, b) =>
    sortOrder === 'asc' ? a[selectedTab] - b[selectedTab] : b[selectedTab] - a[selectedTab]
  )

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const tabLabels: { key: ScoreKey; label: string }[] = [
    { key: 'highest_wpm', label: 'WPM' },
    { key: 'games_played', label: 'Games Played' },
    { key: 'tug_entries', label: 'Tug Entries' },
    { key: 'tug_wins', label: 'Tug Wins' },
  ]

  return (
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 space-y-24">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <TypingAnimation
            text="Typo Fighters"
            as="h1"
            className="text-4xl sm:text-5xl font-arcade text-arcade-accent tracking-widest"
            typingSpeed={300}
          />
          <TypingAnimation
            text="A real-time typing battle royale. Outtype. Outlive. Outlast."
            as="p"
            className="text-lg sm:text-xl text-arcade-secondary"
            typingSpeed={100}
          />
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href="/play">
              <button className="arcade-button mt-6 px-8 py-3 text-lg animate-pulse-slow">
                <TypingAnimation text="Play Now" typingSpeed={200} />
              </button>
            </Link>
          </motion.div>
        </motion.section>


        {/* How It Works */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ staggerChildren: 0.2 }} className="grid sm:grid-cols-3 gap-10 text-center">
          {[
            ['Enter Username', 'No account needed. Just jump in.'],
            ['Create or Join', 'Spin up a game or use a room code.'],
            ['Type to Survive', 'Last one standing wins. WPM matters.'],
          ].map(([title, desc], idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.2 }} className="space-y-2">
              <h3 className="text-xl font-bold text-arcade-accent">{`${idx + 1}. ${title}`}</h3>
              <p className="text-sm text-arcade-muted">{desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Game Objective */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-arcade-accent">🎯 Game Objective</h2>
          <p className="text-md text-arcade-muted max-w-xl mx-auto">
            <span className="text-arcade-accent">Type faster than your opponents</span> to survive each elimination round. Only the sharpest typist reaches the final duel — <span className="text-arcade-accent">win the Showdown</span> to claim the crown.
          </p>
        </motion.section>


        {/* Animated Mock Battle */}
        <MockAnimation />

        {/* High Scores */}
        <HighScores />
      </div>
    </main>
  )
}