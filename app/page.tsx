'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { pingSupabase } from './pingSupabase' // ✅ Make sure this path is correct

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    pingSupabase()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-arcade text-arcade-accent mb-8 animate-pulse-slow">
        Team Typo Fighters
      </h1>
      {/* your page content here */}
    </main>
  )
}
