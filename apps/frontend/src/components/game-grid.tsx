'use client'

import { Card } from '@radix-ui/themes'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Zap, Play } from 'lucide-react'
import Link from 'next/link'

const games = [
  {
    id: 'snake',
    slug: 'snake',
    name: 'AI Snake',
    description: 'Classic snake with AI-powered opponents and adaptive difficulty',
    image: 'https://images.pexels.com/photos/194094/pexels-photo-194094.jpeg?auto=compress&cs=tinysrgb&w=400',
    players: 1247,
    highScore: 15420
  },
  {
    id: 'tetris',
    slug: 'tetris',
    name: 'Neural Tetris',
    description: 'Tetris enhanced with AI piece prediction and optimization hints',
    image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
    players: 2156,
    highScore: 89340
  },
  {
    id: 'space-shooter',
    slug: 'space-shooter',
    name: 'Cosmic Defender',
    description: 'Space shooter with AI-generated enemies and dynamic difficulty',
    image: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=400',
    players: 1891,
    highScore: 42150
  }
]

export function GameGrid() {
  return (
    <section id="games" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-white mb-4">
            Choose Your Game
          </h3>
          <Link href="/games">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 mb-8">
              View All Games
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Card key={game.id} className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all group overflow-hidden">
              <div className="p-0">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <h4 className="text-white text-xl font-bold mb-2">{game.name}</h4>
                  <p className="text-white/70 text-sm mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex justify-between text-sm text-white/60 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{game.players.toLocaleString()} players</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{game.highScore.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Link href={`/game/${game.slug}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}