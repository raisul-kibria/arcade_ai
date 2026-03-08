import { GameGrid } from '@/components/game-grid'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <main>
        <Hero />
        <GameGrid />
      </main>
    </div>
  )
}