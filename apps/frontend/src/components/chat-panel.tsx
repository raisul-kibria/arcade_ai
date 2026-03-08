'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@radix-ui/themes'
import { MessageCircle, Send, Loader2, Save, Undo, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/components/providers'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatPanelProps {
  gameSlug: string
  versionId?: string
  onCodeChange?: (newCode: any) => void
  onSaveVersion?: () => void
  onRegisterChatInput?: (element: HTMLInputElement | null) => void
}

export function ChatPanel({ gameSlug, versionId, onCodeChange, onSaveVersion, onRegisterChatInput }: ChatPanelProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastModification, setLastModification] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Register the input with the parent component for focus management
    console.log('ChatPanel: Registering input ref with focus manager', inputRef.current)
    onRegisterChatInput?.(inputRef.current)
  }, [onRegisterChatInput])

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI game assistant. I can help you customize this ${gameSlug} game. Try asking me to:\n\n• Change colors or speeds\n• Adjust difficulty settings\n• Modify scoring systems\n• Tweak visual elements\n\nWhat would you like to change?`,
      timestamp: new Date()
    }])
  }, [gameSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_slug: gameSlug,
          version_id: versionId,
          user_prompt: userMessage.content
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get AI response')
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: formatAIResponse(result),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // Handle code modifications
      if (result.simple && result.patch) {
        setLastModification(result)
        setHasUnsavedChanges(true)
        onCodeChange?.(result)
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatAIResponse = (result: any): string => {
    if (result.simple) {
      if (result.patch) {
        return `I've made the requested changes to your game! ${result.description || 'The modifications have been applied.'}\n\nYou can see the changes in real-time. If you like them, click "Save Version" to make them permanent.`
      } else if (result.response) {
        return result.response
      } else {
        return result.description || 'I understand your request. The changes should be visible in your game now.'
      }
    } else {
      return `That's a complex request that would require significant changes. Here are some simpler alternatives you could try:\n\n${result.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`
    }
  }

  const handleUndo = () => {
    if (lastModification) {
      setHasUnsavedChanges(false)
      setLastModification(null)
      onCodeChange?.(null) // Signal to revert changes
      
      const undoMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Changes have been reverted to the previous version.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, undoMessage])
    }
  }

  const handleSave = () => {
    if (hasUnsavedChanges) {
      setHasUnsavedChanges(false)
      onSaveVersion?.()
      
      const saveMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Great! Your changes have been saved as a new version.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, saveMessage])
    }
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Assistant</h3>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUndo}
              variant="outline"
              size="sm"
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            >
              <Undo className="w-3 h-3 mr-1" />
              Undo
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!user}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 opacity-70 ${
                message.type === 'user' ? 'text-purple-200' : 'text-white/60'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white border border-white/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to modify the game..."
          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Status indicators */}
      {hasUnsavedChanges && (
        <div className="mt-2 flex items-center space-x-1 text-orange-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>You have unsaved changes</span>
        </div>
      )}

      {!user && (
        <div className="mt-2 text-white/60 text-xs">
          Sign in to save your customizations
        </div>
      )}
    </Card>
  )
}