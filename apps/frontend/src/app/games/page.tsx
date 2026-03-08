'use client'

import { useEffect, useState } from 'react'
import { Card } from '@radix-ui/themes'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Zap, Play } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Game {
  id: string
  slug: string
  name: string
  cover_url: string | null
  created_at: string
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGames(games || [])
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  // Default games if none in database
  const defaultGames = [
    {
      id: 'snake',
      slug: 'snake',
      name: 'AI Snake',
      cover_url: 'https://images.pexels.com/photos/194094/pexels-photo-194094.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Classic snake with AI-powered opponents and adaptive difficulty',
      players: 1247,
      highScore: 15420
    },
    {
      id: 'tetris',
      slug: 'tetris',
      name: 'Neural Tetris',
      cover_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Tetris enhanced with AI piece prediction and optimization hints',
      players: 2156,
      highScore: 89340
    },
    {
      id: 'space-shooter',
      slug: 'space-shooter',
      name: 'Cosmic Defender',
      cover_url: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Space shooter with AI-generated enemies and dynamic difficulty',
      players: 1891,
      highScore: 42150
    }
  ]

  const displayGames = games.length > 0 ? games : defaultGames

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading games...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Game Library
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Choose from our collection of AI-enhanced retro arcade games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {displayGames.map((game) => (
            <Card key={game.id} className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all group overflow-hidden">
              <div className="p-0">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={game.cover_url || 'https://images.pexels.com/photos/194094/pexels-photo-194094.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-2">{game.name}</h3>
                  <p className="text-white/70 text-sm mb-4">
                    {'description' in game ? game.description : 'Experience classic arcade gaming with AI enhancements'}
                  </p>
                  
                  <div className="flex justify-between text-sm text-white/60 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{'players' in game ? game.players.toLocaleString() : '1,000+'} players</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{'highScore' in game ? game.highScore.toLocaleString() : '10,000+'}</span>
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

        {games.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-white/60 text-lg">
              No games found in database. Showing default games.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}