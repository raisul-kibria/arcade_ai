'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/providers'
import { Card } from '@radix-ui/themes'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
// Dynamic imports will be used for games to avoid SSR issues with Phaser
// import { initSnake, initTetris, initSpaceShooter } from '@arcade-ai/games'
// import type { SnakeConfig, TetrisConfig, SpaceShooterConfig } from '@arcade-ai/games'

// Type definitions for game configs
type SnakeConfig = {
  speed?: number
  gridSize?: number
  wrapAround?: boolean
  backgroundColor?: string
  snakeColor?: string
  foodColor?: string
}

type TetrisConfig = {
  speed?: number
  gridWidth?: number
  gridHeight?: number
  backgroundColor?: string
  blockColors?: string[]
}

type SpaceShooterConfig = {
  playerSpeed?: number
  bulletSpeed?: number
  enemySpeed?: number
  backgroundColor?: string
  playerColor?: string
  bulletColor?: string
  enemyColor?: string
}
import { ChatPanel } from '@/components/chat-panel'
import { VersionManager } from '@/components/version-manager'
import { useGameFocus } from '@/hooks/use-game-focus'

interface GameVersion {
  id: string
  game_id: string
  code_snapshot: any
  created_by: string | null
  created_at: string
}

interface Game {
  id: string
  slug: string
  name: string
  cover_url: string | null
  created_at: string
}

interface Score {
  id: string
  score: number
  timestamp: string
  users: { email: string } | null
}

export default function GamePage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const gameFocus = useGameFocus()
  
  console.log('GamePage component rendered with slug:', slug)
  
  const [game, setGame] = useState<Game | null>(null)
  const [currentVersion, setCurrentVersion] = useState<GameVersion | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [currentScore, setCurrentScore] = useState(0)
  const [gameInstance, setGameInstance] = useState<any>(null)
  const [gameConfig, setGameConfig] = useState<any>(null)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'passed' | 'failed'>('idle')
  const [pendingChanges, setPendingChanges] = useState<any>(null)
  
  const gameContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('useEffect triggered with slug:', slug)
    if (slug) {
      console.log('Calling fetchGameData...')
      fetchGameData()
    } else {
      console.log('No slug provided')
    }
  }, [slug])

  useEffect(() => {
    if (game && gameContainerRef.current) {
      // Register the game container with focus manager
      gameFocus.registerGameContainer(gameContainerRef.current)
      initializeGame()
    }
    
    return () => {
      if (gameInstance) {
        gameInstance.destroy(true)
      }
    }
  }, [game, gameConfig])

  // Add effect to manage Phaser input based on focus state
  useEffect(() => {
    if (gameInstance && gameInstance.input) {
      if (gameFocus.isGameFocused) {
        console.log('🔓 Enabling Phaser input - game focused')
        gameInstance.input.keyboard.enabled = true
      } else {
        console.log('🔒 Disabling Phaser input - chat focused')
        gameInstance.input.keyboard.enabled = false
      }
    }
  }, [gameFocus.isGameFocused, gameInstance])

  const fetchGameData = async () => {
    console.log('fetchGameData called with slug:', slug)
    try {
      // For now, always use default game data to avoid database issues
      const defaultGames = {
        'snake': { id: 'snake', slug: 'snake', name: 'AI Snake', cover_url: null, created_at: new Date().toISOString() },
        'tetris': { id: 'tetris', slug: 'tetris', name: 'Neural Tetris', cover_url: null, created_at: new Date().toISOString() },
        'space-shooter': { id: 'space-shooter', slug: 'space-shooter', name: 'Cosmic Defender', cover_url: null, created_at: new Date().toISOString() }
      }
      
      const gameToUse = defaultGames[slug as keyof typeof defaultGames]
      if (!gameToUse) {
        console.error('Unknown game slug:', slug)
        setLoading(false)
        return
      }

      console.log('Setting game:', gameToUse)
      setGame(gameToUse)
      
      const defaultConfig = getDefaultConfig(slug)
      console.log('Setting default config:', defaultConfig)
      setGameConfig(defaultConfig)
      
    } catch (error) {
      console.error('Error fetching game data:', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const fetchScores = async (gameId: string) => {
    try {
      // Temporarily disable scores to avoid type errors
      console.log('fetchScores called for gameId:', gameId)
      // const { data: scoresData, error } = await supabase
      //   .from('scores')
      //   .select(`
      //     id,
      //     score,
      //     timestamp,
      //     users:user_id(email),
      //     versions!inner(game_id)
      //   `)
      //   .eq('versions.game_id', gameId)
      //   .order('score', { ascending: false })
      //   .limit(10)

      // if (!error && scoresData) {
      //   setScores(scoresData)
      // }
    } catch (error) {
      console.error('Error fetching scores:', error)
    }
  }

  const getDefaultConfig = (gameSlug: string) => {
    switch (gameSlug) {
      case 'snake':
        return {
          speed: 150,
          gridSize: 20,
          wrapAround: false,
          backgroundColor: '#1a1a2e',
          snakeColor: '#00ff41',
          foodColor: '#ff073a'
        }
      case 'tetris':
        return {
          speed: 500,
          gridWidth: 10,
          gridHeight: 20,
          cellSize: 30,
          backgroundColor: '#1a1a2e',
          gridColor: '#333333'
        }
      case 'space-shooter':
        return {
          playerSpeed: 300,
          bulletSpeed: 500,
          enemySpeed: 100,
          spawnRate: 1000,
          backgroundColor: '#0a0a1a',
          playerColor: '#00ff41',
          bulletColor: '#ffff00',
          enemyColor: '#ff073a'
        }
      default:
        return {}
    }
  }

  const initializeGame = async () => {
    if (!gameContainerRef.current || !game) {
      console.log('Game initialization failed: missing container or game data', { 
        hasContainer: !!gameContainerRef.current, 
        hasGame: !!game 
      })
      return
    }

    console.log('Starting game initialization for:', game.slug)

    // Clear previous game
    if (gameInstance) {
      console.log('Destroying previous game instance')
      gameInstance.destroy(true)
    }

    const callbacks = {
      onScore: (score: number) => {
        console.log('Score updated:', score)
        setCurrentScore(score)
      },
      onGameOver: async (finalScore: number) => {
        console.log('Game over, final score:', finalScore)
        setCurrentScore(finalScore)
        if (user && currentVersion) {
          await submitScore(finalScore)
        }
      },
      getFocusState: () => {
        const focused = gameFocus.isGameFocused
        console.log('Game requesting focus state:', focused)
        return focused
      }
    }

    const config = gameConfig || getDefaultConfig(game.slug)
    console.log('Using game config:', config)
    let newGameInstance: any

    try {
      // Use dynamic imports to avoid SSR issues with Phaser
      console.log('Loading game module for:', game.slug)
      switch (game.slug) {
        case 'snake':
          const { initSnake } = await import('@arcade-ai/games')
          console.log('Snake module loaded, initializing...')
          newGameInstance = initSnake('game-container', config as SnakeConfig, callbacks)
          break
        case 'tetris':
          const { initTetris } = await import('@arcade-ai/games')
          console.log('Tetris module loaded, initializing...')
          newGameInstance = initTetris('game-container', config as TetrisConfig, callbacks)
          break
        case 'space-shooter':
          const { initSpaceShooter } = await import('@arcade-ai/games')
          console.log('Space Shooter module loaded, initializing...')
          newGameInstance = initSpaceShooter('game-container', config as SpaceShooterConfig, callbacks)
          break
        default:
          console.error('Unknown game type:', game.slug)
          return
      }

      console.log('Game instance created:', newGameInstance)
      setGameInstance(newGameInstance)
      
      // Run smoke test
      runSmokeTest(newGameInstance)
      
    } catch (error) {
      console.error('Error initializing game:', error)
      setTestStatus('failed')
    }
  }

  const runSmokeTest = (instance: any) => {
    setTestStatus('testing')
    
    setTimeout(() => {
      try {
        // Basic smoke test - check if game scene loaded
        if (instance && instance.scene && instance.scene.scenes.length > 0) {
          const scene = instance.scene.scenes[0]
          if (scene.scene.isActive()) {
            setTestStatus('passed')
          } else {
            setTestStatus('failed')
          }
        } else {
          setTestStatus('failed')
        }
      } catch (error) {
        console.error('Smoke test failed:', error)
        setTestStatus('failed')
      }
    }, 1000)
  }

  const submitScore = async (score: number) => {
    if (!user || !currentVersion) return

    try {
      const { error } = await supabase
        .from('scores')
        .insert([{
          version_id: currentVersion.id,
          user_id: user.id,
          score: score
        }])

      if (!error) {
        await fetchScores(game!.id)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  const handleCodeChange = (modification: any) => {
    if (modification === null) {
      // Revert changes
      setGameConfig(currentVersion?.code_snapshot || getDefaultConfig(game!.slug))
      setPendingChanges(null)
      setTestStatus('idle')
    } else if (modification.simple && modification.patch) {
      // Apply modifications to current config
      const newConfig = { ...gameConfig }
      
      // Simple parameter modifications based on common patterns
      if (modification.description?.toLowerCase().includes('speed')) {
        if (game?.slug === 'snake') newConfig.speed = Math.max(50, Math.min(500, newConfig.speed + 50))
        if (game?.slug === 'tetris') newConfig.speed = Math.max(100, Math.min(1000, newConfig.speed + 100))
        if (game?.slug === 'space-shooter') {
          newConfig.playerSpeed = Math.max(100, Math.min(500, newConfig.playerSpeed + 50))
        }
      }
      
      if (modification.description?.toLowerCase().includes('color')) {
        // Cycle through some predefined colors
        const colors = ['#ff073a', '#00ff41', '#0080ff', '#ff8000', '#ff00ff', '#ffff00']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        
        if (game?.slug === 'snake') {
          newConfig.snakeColor = randomColor
        } else if (game?.slug === 'space-shooter') {
          newConfig.playerColor = randomColor
        }
      }
      
      setGameConfig(newConfig)
      setPendingChanges(modification)
    }
  }

  const handleVersionLoad = (version: GameVersion) => {
    setCurrentVersion(version)
    setGameConfig(version.code_snapshot)
    setPendingChanges(null)
    setTestStatus('idle')
  }

  const handleVersionSave = async () => {
    if (!user || !game || !gameConfig) return

    try {
      const { data, error } = await supabase
        .from('versions')
        .insert([{
          game_id: game.id,
          code_snapshot: gameConfig,
          created_by: user.id
        }])
        .select()
        .single()

      if (!error && data) {
        setCurrentVersion(data)
        setPendingChanges(null)
      }
    } catch (error) {
      console.error('Error saving version:', error)
    }
  }

  // Temporary: bypass loading check to debug
  if (false && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game... (Debug: loading={loading.toString()})</div>
      </div>
    )
  }

  if (!game) {
    // Temporary fallback for debugging
    const fallbackGame = { id: 'snake', slug: 'snake', name: 'Debug Snake', cover_url: null, created_at: new Date().toISOString() }
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-white text-center">
            <h1>Debug Mode: Game data missing</h1>
            <p>Loading: {loading.toString()}</p>
            <p>Slug: {slug}</p>
            <div className="mt-4">
              <div 
                id="game-container"
                className="w-full h-96 bg-black rounded-lg mx-auto max-w-4xl"
              >
                <p className="text-white p-4">Game container (fallback)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/games">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">{game.name}</h1>
              <div className="flex items-center space-x-4 text-white/70">
                <span>Current Score: {currentScore}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  gameFocus.isGameFocused 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  Game Controls: {gameFocus.isGameFocused ? 'ACTIVE' : 'DISABLED'}
                </span>
                <div className="flex items-center space-x-1">
                  {testStatus === 'testing' && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                  {testStatus === 'passed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {testStatus === 'failed' && <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm">
                    {testStatus === 'testing' && 'Testing...'}
                    {testStatus === 'passed' && 'Game OK'}
                    {testStatus === 'failed' && 'Game Error'}
                    {testStatus === 'idle' && 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md p-6">
              <div 
                id="game-container"
                ref={gameContainerRef}
                className="w-full aspect-[4/3] bg-black rounded-lg overflow-hidden game-canvas pixel-perfect"
              />
              
              <div className="mt-4 text-center">
                <p className="text-white/70 text-sm">
                  Use arrow keys or WASD to move. Space to shoot/restart.
                </p>
                <div className={`mt-2 p-2 rounded text-sm font-medium ${
                  gameFocus.isGameFocused 
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                }`}>
                  {gameFocus.isGameFocused 
                    ? '🎮 Game controls are ACTIVE - You can use keyboard to play!' 
                    : '💬 Game controls are DISABLED - Currently typing in chat'
                  }
                </div>
                {/* Debug info */}
                <div className="mt-2 p-2 bg-blue-500/20 border border-blue-500/50 rounded text-blue-400 text-xs">
                  🐛 Debug: Focus State = {gameFocus.isGameFocused.toString()} | 
                  Timestamp: {Date.now()}
                </div>
                {testStatus === 'failed' && (
                  <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                    Game failed to load properly. Try undoing recent changes.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Chat Panel */}
            <div className="h-96">
              <ChatPanel
                gameSlug={game.slug}
                versionId={currentVersion?.id}
                onCodeChange={handleCodeChange}
                onSaveVersion={handleVersionSave}
                onRegisterChatInput={gameFocus.registerChatInput}
              />
            </div>

            {/* Version Manager - temporarily disabled for debugging */}
            {/* <VersionManager
              gameId={game.id}
              currentVersion={currentVersion}
              onVersionLoad={handleVersionLoad}
              onVersionSave={handleVersionSave}
            /> */}
            <div className="bg-white/10 border-white/20 backdrop-blur-md p-6 rounded">
              <p className="text-white">Version Manager (disabled for debugging)</p>
            </div>

            {/* Leaderboard */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-semibold">Leaderboard</h3>
              </div>
              
              <div className="space-y-2">
                {scores.length > 0 ? (
                  scores.map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-white/80">
                          {score.users?.email?.split('@')[0] || 'Anonymous'}
                        </span>
                      </div>
                      <span className="text-white font-mono">
                        {score.score.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-sm">No scores yet. Be the first!</p>
                )}
              </div>
              
              {!user && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/60 text-xs">
                    Sign in to save your scores and compete on the leaderboard!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}