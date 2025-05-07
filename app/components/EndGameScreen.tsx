import { motion } from 'framer-motion'
import Link from 'next/link'

function EndGameScreen({ winner, username }: { winner: string; username: string }) {
  const isWinner = winner === username

  return (
    <motion.div
      className="flex flex-col items-center justify-start h-full text-center pt-24"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div
        className={`p-8 rounded-xl border-4 shadow-xl ${
          isWinner
            ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 border-blue-200'
            : 'bg-gradient-to-br from-black via-red-800 to-red-900 border-red-500'
        }`}
      >
        <motion.h2
          className={`text-5xl font-arcade font-bold mb-4 ${
            isWinner ? 'text-white' : 'text-red-300'
          }`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {isWinner ? '👑 You Win!' : '💀 Game Over'}
        </motion.h2>
        <motion.p
          className={`text-2xl ${isWinner ? 'text-white' : 'text-red-200'}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isWinner
            ? 'You survived every round. The crown is yours.'
            : `${winner} claims the crown this time. Better luck next match!`}
        </motion.p>
        <motion.div
          className="mt-6"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/">
            <button className="arcade-button px-6 py-3 text-lg mt-4">
              Play Again
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default EndGameScreen
