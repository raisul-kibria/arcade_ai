import { useState, useCallback, useRef, useEffect } from 'react'

export interface GameFocusManager {
  isGameFocused: boolean
  setGameFocused: (focused: boolean) => void
  registerChatInput: (element: HTMLInputElement | null) => void
  registerGameContainer: (element: HTMLElement | null) => void
}

export function useGameFocus(): GameFocusManager {
  const [isGameFocused, setIsGameFocused] = useState(true)
  const chatInputRef = useRef<HTMLInputElement | null>(null)
  const gameContainerRef = useRef<HTMLElement | null>(null)

  const handleChatFocus = useCallback(() => {
    console.log('🔴 Chat input focused - disabling game controls')
    setIsGameFocused(false)
  }, [])

  const handleChatBlur = useCallback(() => {
    console.log('🟢 Chat input blurred - enabling game controls') 
    setIsGameFocused(true)
  }, [])

  const handleDocumentKeyDown = useCallback((event: KeyboardEvent) => {
    // If chat is focused and it's a game control key, let the event pass through normally
    if (!isGameFocused) {
      const gameKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
      if (gameKeys.includes(event.code)) {
        console.log('Document level: allowing game key to pass through to chat:', event.code)
        // Don't prevent default - let the key work normally in the chat input
        return
      }
    }
  }, [isGameFocused])

  const setGameFocused = useCallback((focused: boolean) => {
    setIsGameFocused(focused)
  }, [])

  const registerChatInput = useCallback((element: HTMLInputElement | null) => {
    console.log('🔧 Registering chat input element:', element)
    
    // Remove previous listeners
    if (chatInputRef.current) {
      console.log('🧹 Removing previous listeners from:', chatInputRef.current)
      chatInputRef.current.removeEventListener('focus', handleChatFocus)
      chatInputRef.current.removeEventListener('blur', handleChatBlur)
    }

    chatInputRef.current = element

    // Add new listeners
    if (element) {
      console.log('🎯 Adding focus/blur listeners to chat input')
      element.addEventListener('focus', handleChatFocus)
      element.addEventListener('blur', handleChatBlur)
    }
  }, [handleChatFocus, handleChatBlur])

  const registerGameContainer = useCallback((element: HTMLElement | null) => {
    gameContainerRef.current = element
  }, [])

  // Add document-level keydown listener to ensure proper event handling
  useEffect(() => {
    document.addEventListener('keydown', handleDocumentKeyDown, true) // Use capture phase
    
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown, true)
    }
  }, [handleDocumentKeyDown])

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (chatInputRef.current) {
        chatInputRef.current.removeEventListener('focus', handleChatFocus)
        chatInputRef.current.removeEventListener('blur', handleChatBlur)
      }
    }
  }, [handleChatFocus, handleChatBlur])

  return {
    isGameFocused,
    setGameFocused,
    registerChatInput,
    registerGameContainer
  }
}
