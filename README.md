# Team Typo Fighters 🎮

A real-time multiplayer typing battle game built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## Hackathon Team Members
Matthew Wozniak - Lead
Conner Westover
Alex Chung

## Features

- Real-time multiplayer typing battles
- Clean, arcade-style UI
- Serverless backend with Next.js API routes
- TypeScript for type safety
- Tailwind CSS for styling

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Vercel (Deployment)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/team-typo-fighters.git
cd team-typo-fighters
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
team-typo-fighters/
├── app/                 # Next.js 14 app directory
│   ├── api/            # API routes
│   ├── game/           # Game routes
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utility functions
├── styles/            # Global styles
└── types/             # TypeScript types
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The project is configured for deployment on Vercel. Push to the main branch to trigger automatic deployments.

## License

MIT 