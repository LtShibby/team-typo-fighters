'use client';

import HighScores from '../components/HighScores';

export default function HighScoresPage() {
  return (
    <main className="min-h-screen bg-black text-arcade-text font-sans overflow-hidden">
      <div className="retro-grid opacity-50"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-arcade text-arcade-accent text-center mb-12">High Scores</h1>
        <HighScores className="max-w-6xl mx-auto" />
      </div>
    </main>
  );
} 