'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-arcade-background text-arcade-text font-sans overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 py-24 space-y-24">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl font-arcade text-arcade-accent tracking-widest">
            Team Typo Fighters
          </h1>
          <motion.p
            className="text-lg sm:text-xl text-arcade-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            A real-time typing battle royale. Outtype. Outlive. Outlast.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/play">
              <button className="arcade-button mt-6 px-8 py-3 text-lg animate-pulse-slow">
                Play Now
              </button>
            </Link>
          </motion.div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
          className="grid sm:grid-cols-3 gap-10 text-center"
        >
          {[
            ['Enter Username', 'No account needed. Just jump in.'],
            ['Create or Join', 'Spin up a game or use a room code.'],
            ['Type to Survive', 'Last one standing wins. WPM matters.'],
          ].map(([title, desc], idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="space-y-2"
            >
              <h3 className="text-xl font-bold text-arcade-accent">{
                `${idx + 1}. ${title}`
              }</h3>
              <p className="text-sm text-arcade-muted">{desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Game Modes */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-bold text-arcade-accent">Game Modes</h2>
          <p className="text-md text-arcade-muted max-w-xl mx-auto">
            Survive elimination every 20 seconds in <span className="text-arcade-accent">Survival Mode</span>, then face off in a <span className="text-arcade-accent">1v1 Tug-of-Words</span> finale.
          </p>
        </motion.section>

        {/* Footer */}
        <footer className="text-center text-sm text-arcade-muted pt-10 border-t border-arcade-border">
          Built with 💀 and ☕ by Team Typo Fighters for ACV Hackathon 2025
        </footer>
      </div>
    </main>
  )
}
