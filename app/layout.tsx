import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from './components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Team Typo Fighters',
  description: 'Real-time multiplayer typing battle game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-arcade-background text-arcade-text min-h-screen flex flex-col`}>
        <NavBar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="text-center text-sm text-arcade-muted py-6 border-t border-arcade-border">
          Forged with 🔥, grit, and endless ☕ by <span className="text-arcade-accent">Team Tpyo Fihgters</span> — <span className="text-arcade-primary">ACV Hackathon 2025</span>
        </footer>
      </body>
    </html>
  )
} 