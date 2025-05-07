'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type ScoreKey = 'highest_wpm' | 'games_played' | 'tug_entries' | 'tug_wins';

type ScoreEntry = {
  username: string;
  highest_wpm: number;
  games_played: number;
  tug_entries: number;
  tug_wins: number;
};

function normalizeHighScores(data: any): ScoreEntry[] {
  const merged: Record<string, Partial<ScoreEntry>> = {};

  const keys: ScoreKey[] = ['highest_wpm', 'games_played', 'tug_entries', 'tug_wins'];
  for (const key of keys) {
    for (const entry of data[key] || []) {
      const user = entry.username;
      if (!merged[user]) merged[user] = { username: user, highest_wpm: 0, games_played: 0, tug_entries: 0, tug_wins: 0 };
      merged[user][key] = entry[key];
    }
  }

  return Object.values(merged).map(entry => ({
    username: entry.username!,
    highest_wpm: entry.highest_wpm || 0,
    games_played: entry.games_played || 0,
    tug_entries: entry.tug_entries || 0,
    tug_wins: entry.tug_wins || 0,
  }));
}

export default function HighScores({ className = '' }: { className?: string }) {
  const [selectedTab, setSelectedTab] = useState<ScoreKey>('highest_wpm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [allScores, setAllScores] = useState<ScoreEntry[]>([]);

  const tabLabels: { key: ScoreKey; label: string }[] = [
    { key: 'highest_wpm', label: 'WPM' },
    { key: 'games_played', label: 'Games Played' },
    { key: 'tug_entries', label: 'Tug Entries' },
    { key: 'tug_wins', label: 'Tug Wins' },
  ];

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('https://python3-m-uvicorn-main-production.up.railway.app/high_scores');
        const json = await res.json();
        const normalized = normalizeHighScores(json);
        if (normalized.length > 0) {
          setAllScores(normalized);
        } else {
          setAllScores([]);
        }
      } catch (err) {
        console.warn('Failed to fetch high scores:', err);
        setAllScores([]);
      }
    };

    fetchScores();
  }, []);

  const sortedScores = [...allScores].sort((a, b) =>
    sortOrder === 'asc' ? a[selectedTab] - b[selectedTab] : b[selectedTab] - a[selectedTab]
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      transition={{ duration: 0.8 }} 
      className={`text-center space-y-6 ${className}`}
    >
      <h2 className="text-2xl font-bold text-arcade-accent mb-2">🏆 High Scores</h2>
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {tabLabels.map(({ key, label }) => (
          <button
            key={key}
            className={`px-4 py-2 rounded-md font-semibold text-sm border ${
              key === selectedTab ? 'bg-arcade-accent text-black' : 'bg-arcade-bg border-arcade-border'
            }`}
            onClick={() => (key === selectedTab ? toggleSortOrder() : setSelectedTab(key))}
          >
            {label} {selectedTab === key ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
        ))}
      </div>
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
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {sortedScores.map((row, idx) => (
              <motion.tr
                key={idx}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className={`border-t border-arcade-border ${idx === 0 ? 'bg-arcade-gold bg-opacity-10' : ''}`}
              >
                <td className="px-4 py-2 font-semibold">
                  {idx === 0 ? '👑 ' : ''}
                  {row.username}
                </td>
                {(['highest_wpm', 'games_played', 'tug_entries', 'tug_wins'] as ScoreKey[]).map((col) => (
                  <td
                    key={col}
                    className={`px-4 py-2 transition-all duration-300 ${
                      selectedTab === col ? 'text-arcade-accent font-bold opacity-100' : 'text-arcade-text opacity-30'
                    }`}
                  >
                    {row[col]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.section>
  );
} 