'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

type ScoreKey = 'highest_wpm' | 'games_played' | 'tug_entries' | 'tug_wins'

type ScoreEntry = {
  username: string
  highest_wpm: number
  games_played: number
  tug_entries: number
  tug_wins: number
}

export default function Home() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<ScoreKey>('highest_wpm')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [highScoresByKey, setHighScoresByKey] = useState<Record<ScoreKey, ScoreEntry[]>>({
    highest_wpm: [],
    games_played: [],
    tug_entries: [],
    tug_wins: [],
  })

  const mockHighScores: ScoreEntry[] = [
    { username: 'keyboard_queen', highest_wpm: 110, games_played: 4, tug_entries: 2, tug_wins: 2 },
    { username: 'fast_fingers', highest_wpm: 95, games_played: 6, tug_entries: 4, tug_wins: 1 },
    { username: 'typo_tycoon', highest_wpm: 88, games_played: 10, tug_entries: 7, tug_wins: 3 },
    { username: 'click_clack', highest_wpm: 102, games_played: 3, tug_entries: 1, tug_wins: 1 },
    { username: 'wpm_warrior', highest_wpm: 120, games_played: 8, tug_entries: 5, tug_wins: 4 }
  ]

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/high_scores')
        const data = await res.json()

        if (
          data &&
          Array.isArray(data.highest_wpm) &&
          Array.isArray(data.games_played) &&
          Array.isArray(data.tug_entries) &&
          Array.isArray(data.tug_wins)
        ) {
          setHighScoresByKey(data)
        } else {
          throw new Error('Invalid structure')
        }
      } catch (err) {
        setHighScoresByKey({
          highest_wpm: [...mockHighScores].sort((a, b) => b.highest_wpm - a.highest_wpm),
          games_played: [...mockHighScores].sort((a, b) => b.games_played - a.games_played),
          tug_entries: [...mockHighScores].sort((a, b) => b.tug_entries - a.tug_entries),
          tug_wins: [...mockHighScores].sort((a, b) => b.tug_wins - a.tug_wins),
        })
      }
    }

    fetchScores()
  }, [])

  const sortedScores = [...(highScoresByKey[selectedTab] || [])].sort((a, b) => {
    const valA = a[selectedTab]
    const valB = b[selectedTab]
    return sortOrder === 'asc' ? valA - valB : valB - valA
  })

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const tabLabels: { key: ScoreKey, label: string }[] = [
    { key: 'highest_wpm', label: 'WPM' },
    { key: 'games_played', label: 'Games Played' },
    { key: 'tug_entries', label: 'Tug Entries' },
    { key: 'tug_wins', label: 'Tug Wins' }
  ]

  return (
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 space-y-24">

        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-arcade text-arcade-accent tracking-widest">Team Typo Fighters</h1>
          <motion.p className="text-lg sm:text-xl text-arcade-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            A real-time typing battle royale. Outtype. Outlive. Outlast.
          </motion.p>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href="/play">
              <button className="arcade-button mt-6 px-8 py-3 text-lg animate-pulse-slow">Play Now</button>
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

        {/* Game Modes */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-arcade-accent">Game Modes</h2>
          <p className="text-md text-arcade-muted max-w-xl mx-auto">
            Survive elimination every 10 seconds in <span className="text-arcade-accent">Survival Mode</span>, then face off in a <span className="text-arcade-accent">1v1 Tug-of-Words</span> finale.
          </p>
        </motion.section>

        {/* High Scores */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-arcade-accent mb-2">🏆 High Scores</h2>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {tabLabels.map(({ key, label }) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-md font-semibold text-sm border ${key === selectedTab ? 'bg-arcade-accent text-black' : 'bg-arcade-bg border-arcade-border'}`}
                onClick={() => key === selectedTab ? toggleSortOrder() : setSelectedTab(key)}
              >
                {label} {selectedTab === key ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-arcade-border table-fixed">
              <thead className="bg-arcade-accent text-black">
                <tr>
                  <th className="w-1/5 px-4 py-2 text-center">Username</th>
                  <th className="w-1/5 px-4 py-2 text-center">WPM</th>
                  <th className="w-1/5 px-4 py-2 text-center">Games Played</th>
                  <th className="w-1/5 px-4 py-2 text-center">Tug Entries</th>
                  <th className="w-1/5 px-4 py-2 text-center">Tug Wins</th>
                </tr>
              </thead>
              <motion.tbody
                key={`${selectedTab}-${sortOrder}`}
                className="bg-black text-arcade-text"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                {sortedScores.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className={`border-t border-arcade-border ${idx === 0 ? 'bg-arcade-gold bg-opacity-10' : ''}`}
                  >
                    <td className="px-4 py-2 font-semibold">{idx === 0 ? '👑 ' : ''}{row.username}</td>
                    <td className={`px-4 py-2 ${selectedTab === 'highest_wpm' ? 'text-arcade-accent font-bold' : ''}`}>{row.highest_wpm}</td>
                    <td className={`px-4 py-2 ${selectedTab === 'games_played' ? 'text-arcade-accent font-bold' : ''}`}>{row.games_played}</td>
                    <td className={`px-4 py-2 ${selectedTab === 'tug_entries' ? 'text-arcade-accent font-bold' : ''}`}>{row.tug_entries}</td>
                    <td className={`px-4 py-2 ${selectedTab === 'tug_wins' ? 'text-arcade-accent font-bold' : ''}`}>{row.tug_wins}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center text-sm text-arcade-muted pt-10 border-t border-arcade-border">
          Built with 💀 and ☕ by Team Typo Fighters for ACV Hackathon 2025
        </footer>
      </div>
    </main>
  )
}
