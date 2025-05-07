'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-black/80 border-b-2 border-arcade-text shadow-[0_0_10px_rgba(0,255,255,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-['Press_Start_2P'] text-arcade-text glow">Typo Fighters</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-3 pt-1 font-['Press_Start_2P'] text-sm ${
                  isActive('/') 
                    ? 'text-arcade-text glow border-b-2 border-arcade-text'
                    : 'text-arcade-text/70 hover:text-arcade-text hover:glow'
                }`}
              >
                Home
              </Link>
              <Link
                href="/play"
                className={`inline-flex items-center px-3 pt-1 font-['Press_Start_2P'] text-sm ${
                  isActive('/play')
                    ? 'text-arcade-text glow border-b-2 border-arcade-text'
                    : 'text-arcade-text/70 hover:text-arcade-text hover:glow'
                }`}
              >
                Play
              </Link>
              <Link
                href="/high-scores"
                className={`inline-flex items-center px-3 pt-1 font-['Press_Start_2P'] text-sm ${
                  isActive('/high-scores')
                    ? 'text-arcade-text glow border-b-2 border-arcade-text'
                    : 'text-arcade-text/70 hover:text-arcade-text hover:glow'
                }`}
              >
                High Scores
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-arcade-text hover:text-arcade-text/70 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block px-3 py-2 font-['Press_Start_2P'] text-sm ${
              isActive('/')
                ? 'text-arcade-text glow bg-black/40 border-l-2 border-arcade-text'
                : 'text-arcade-text/70 hover:text-arcade-text hover:glow hover:bg-black/20'
            }`}
          >
            Home
          </Link>
          <Link
            href="/play"
            className={`block px-3 py-2 font-['Press_Start_2P'] text-sm ${
              isActive('/play')
                ? 'text-arcade-text glow bg-black/40 border-l-2 border-arcade-text'
                : 'text-arcade-text/70 hover:text-arcade-text hover:glow hover:bg-black/20'
            }`}
          >
            Play
          </Link>
          <Link
            href="/high-scores"
            className={`block px-3 py-2 font-['Press_Start_2P'] text-sm ${
              isActive('/high-scores')
                ? 'text-arcade-text glow bg-black/40 border-l-2 border-arcade-text'
                : 'text-arcade-text/70 hover:text-arcade-text hover:glow hover:bg-black/20'
            }`}
          >
            High Scores
          </Link>
        </div>
      </div>
    </nav>
  );
} 