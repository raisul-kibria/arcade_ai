import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Classic Arcade
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Meets AI
          </span>
        </h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Experience nostalgic arcade games reimagined with cutting-edge AI technology. 
          Compete, learn, and have fun in a whole new way.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/games">
            <Button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
              Start Playing
            </Button>
          </Link>
          <Link href="/#leaderboard">
            <Button variant="outline" className="px-8 py-4 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all">
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}