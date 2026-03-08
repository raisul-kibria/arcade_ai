'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers'
import { AuthDialog } from '@/components/auth-dialog'
import { UserMenu } from '@/components/user-menu'
import { Gamepad2 } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Gamepad2 className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Arcade AI</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#games" className="text-white/80 hover:text-white transition-colors">
            Games
          </Link>
          <Link href="/games" className="text-white/80 hover:text-white transition-colors">
            Library
          </Link>
          <Link href="/#leaderboard" className="text-white/80 hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/#about" className="text-white/80 hover:text-white transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <Button 
              onClick={() => setShowAuth(true)}
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </header>
  )
}