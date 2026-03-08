export interface GameConfig {
  width: number
  height: number
  parent: string
  backgroundColor: string
  pixelArt: boolean
}

export interface GameScore {
  score: number
  timestamp: Date
  userId?: string
}

export interface GameState {
  isPlaying: boolean
  isPaused: boolean
  score: number
  level: number
}

export interface Position {
  x: number
  y: number
}

export interface Velocity {
  x: number
  y: number
}