import * as Phaser from 'phaser'

export interface TetrisConfig {
  speed?: number
  gridWidth?: number
  gridHeight?: number
  cellSize?: number
  backgroundColor?: string
  gridColor?: string
}

export interface GameCallbacks {
  onScore?: (score: number) => void
  onGameOver?: (finalScore: number) => void
  onLinesCleared?: (lines: number) => void
  getFocusState?: () => boolean
}

interface Tetromino {
  shape: number[][]
  color: number
  x: number
  y: number
}

export class TetrisGame extends Phaser.Scene {
  private config: Required<TetrisConfig>
  private callbacks: GameCallbacks
  private board: number[][] = []
  private currentPiece?: Tetromino
  private score = 0
  private lines = 0
  private level = 1
  private gameRunning = false
  private gamePaused = false
  private dropTimer = 0
  private lockDelay = 0
  private isLocking = false

  private tetrominoes = [
    { shape: [[1,1,1,1]], color: 0x00ffff }, // I
    { shape: [[1,1],[1,1]], color: 0xffff00 }, // O
    { shape: [[0,1,0],[1,1,1]], color: 0x800080 }, // T
    { shape: [[0,1,1],[1,1,0]], color: 0x00ff00 }, // S
    { shape: [[1,1,0],[0,1,1]], color: 0xff0000 }, // Z
    { shape: [[1,0,0],[1,1,1]], color: 0xff8000 }, // J
    { shape: [[0,0,1],[1,1,1]], color: 0x0000ff }, // L
  ]

  constructor(config: TetrisConfig = {}, callbacks: GameCallbacks = {}) {
    super({ key: 'TetrisGame' })
    
    this.config = {
      speed: config.speed || 500,
      gridWidth: config.gridWidth || 10,
      gridHeight: config.gridHeight || 20,
      cellSize: config.cellSize || 30,
      backgroundColor: config.backgroundColor || '#1a1a2e',
      gridColor: config.gridColor || '#333333'
    }
    
    this.callbacks = callbacks
  }

  create() {
    // Initialize board
    this.board = Array(this.config.gridHeight).fill(null).map(() => 
      Array(this.config.gridWidth).fill(0)
    )
    
    this.score = 0
    this.lines = 0
    this.level = 1
    this.gameRunning = true
    
    this.spawnPiece()
    this.setupInput()
    
    // Game loop
    this.time.addEvent({
      delay: 50,
      callback: this.updateGame,
      callbackScope: this,
      loop: true
    })
  }

  // Make update method public to satisfy Phaser.Scene interface
  update(time: number, delta: number) {
    this.updateGame(time, delta)
  }

  private setupInput() {
    // Use Phaser's keyboard system but with better focus checking
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.gameRunning || !this.currentPiece) {
        // Allow space for restart when game over
        if (event.code === 'Space' && !this.gameRunning) {
          const isGameFocused = this.callbacks.getFocusState ? this.callbacks.getFocusState() : true
          if (isGameFocused) {
            this.restartGame()
            event.preventDefault()
            event.stopPropagation()
          }
        }
        return
      }
      
      const isGameFocused = this.callbacks.getFocusState ? this.callbacks.getFocusState() : true
      console.log('🧩 Tetris game - Key pressed:', event.code, 'Game focused:', isGameFocused)
      
      if (!isGameFocused) {
        console.log('🚫 Tetris game input blocked - chat is focused, allowing event to pass through')
        // Don't prevent default or stop propagation when chat is focused
        return
      }
      
      // Only handle game-related keys and prevent their default behavior
      let handled = false
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.movePiece(-1, 0)
          handled = true
          break
        case 'ArrowRight':
        case 'KeyD':
          this.movePiece(1, 0)
          handled = true
          break
        case 'ArrowDown':
        case 'KeyS':
          this.movePiece(0, 1)
          handled = true
          break
        case 'ArrowUp':
        case 'KeyW':
          this.rotatePiece()
          handled = true
          break
        case 'Space':
          this.hardDrop()
          handled = true
          break
      }
      
      // Only prevent default if we handled the key and game is focused
      if (handled) {
        console.log('🎯 Tetris game handled key:', event.code)
        event.preventDefault()
        event.stopPropagation()
      }
    })
  }

  private updateGame(time?: number, delta?: number) {
    if (!this.gameRunning || !this.currentPiece) return
    
    // Check if game should be paused when out of focus
    const shouldBePaused = this.callbacks.getFocusState ? !this.callbacks.getFocusState() : false
    if (shouldBePaused !== this.gamePaused) {
      this.gamePaused = shouldBePaused
      console.log(shouldBePaused ? '⏸️ Tetris game paused - chat focused' : '▶️ Tetris game resumed - game focused')
    }
    
    // Don't update game logic when paused
    if (this.gamePaused) return
    
    const actualDelta = delta || 50
    
    this.dropTimer += actualDelta
    
    if (this.isLocking) {
      this.lockDelay += actualDelta
      if (this.lockDelay >= 500) {
        this.lockPiece()
      }
    } else if (this.dropTimer >= this.config.speed - (this.level - 1) * 50) {
      this.dropTimer = 0
      if (!this.movePiece(0, 1)) {
        this.isLocking = true
        this.lockDelay = 0
      }
    }
    
    this.render()
  }

  private spawnPiece() {
    const pieceType = this.tetrominoes[Math.floor(Math.random() * this.tetrominoes.length)]
    this.currentPiece = {
      shape: pieceType.shape.map(row => [...row]),
      color: pieceType.color,
      x: Math.floor(this.config.gridWidth / 2) - Math.floor(pieceType.shape[0].length / 2),
      y: 0
    }
    
    if (!this.isValidPosition(this.currentPiece)) {
      this.gameOver()
    }
  }

  private movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece) return false
    
    const newPiece = {
      ...this.currentPiece,
      x: this.currentPiece.x + dx,
      y: this.currentPiece.y + dy
    }
    
    if (this.isValidPosition(newPiece)) {
      this.currentPiece = newPiece
      if (dx !== 0 && this.isLocking) {
        this.isLocking = false
        this.lockDelay = 0
      }
      return true
    }
    return false
  }

  private rotatePiece() {
    if (!this.currentPiece) return
    
    const rotated = this.currentPiece.shape[0].map((_, index) =>
      this.currentPiece!.shape.map(row => row[index]).reverse()
    )
    
    const newPiece = {
      ...this.currentPiece,
      shape: rotated
    }
    
    if (this.isValidPosition(newPiece)) {
      this.currentPiece = newPiece
      if (this.isLocking) {
        this.isLocking = false
        this.lockDelay = 0
      }
    }
  }

  private hardDrop() {
    if (!this.currentPiece) return
    
    while (this.movePiece(0, 1)) {
      // Keep dropping
    }
    this.lockPiece()
  }

  private isValidPosition(piece: Tetromino): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x
          const newY = piece.y + y
          
          if (newX < 0 || newX >= this.config.gridWidth || newY >= this.config.gridHeight) {
            return false
          }
          if (newY >= 0 && this.board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }

  private lockPiece() {
    if (!this.currentPiece) return
    
    // Place piece on board
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardY = this.currentPiece.y + y
          const boardX = this.currentPiece.x + x
          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color
          }
        }
      }
    }
    
    this.isLocking = false
    this.lockDelay = 0
    this.clearLines()
    this.spawnPiece()
  }

  private clearLines() {
    let linesCleared = 0
    
    for (let y = this.config.gridHeight - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1)
        this.board.unshift(Array(this.config.gridWidth).fill(0))
        linesCleared++
        y++ // Check same line again
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared
      const points = [0, 40, 100, 300, 1200][linesCleared] * this.level
      this.score += points
      this.level = Math.floor(this.lines / 10) + 1
      
      this.callbacks.onScore?.(this.score)
      this.callbacks.onLinesCleared?.(linesCleared)
    }
  }

  private render() {
    this.children.removeAll()
    
    // Background
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      parseInt(this.config.backgroundColor.replace('#', ''), 16)
    )
    
    const offsetX = (this.cameras.main.width - this.config.gridWidth * this.config.cellSize) / 2
    const offsetY = (this.cameras.main.height - this.config.gridHeight * this.config.cellSize) / 2
    
    // Draw board
    for (let y = 0; y < this.config.gridHeight; y++) {
      for (let x = 0; x < this.config.gridWidth; x++) {
        const cellX = offsetX + x * this.config.cellSize + this.config.cellSize / 2
        const cellY = offsetY + y * this.config.cellSize + this.config.cellSize / 2
        
        // Grid lines
        this.add.rectangle(
          cellX, cellY, 
          this.config.cellSize, this.config.cellSize, 
          parseInt(this.config.gridColor.replace('#', ''), 16)
        ).setStrokeStyle(1, 0x666666)
        
        // Filled cells
        if (this.board[y][x] !== 0) {
          this.add.rectangle(
            cellX, cellY,
            this.config.cellSize - 2, this.config.cellSize - 2,
            this.board[y][x]
          )
        }
      }
    }
    
    // Draw current piece
    if (this.currentPiece) {
      for (let y = 0; y < this.currentPiece.shape.length; y++) {
        for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
          if (this.currentPiece.shape[y][x]) {
            const cellX = offsetX + (this.currentPiece.x + x) * this.config.cellSize + this.config.cellSize / 2
            const cellY = offsetY + (this.currentPiece.y + y) * this.config.cellSize + this.config.cellSize / 2
            
            this.add.rectangle(
              cellX, cellY,
              this.config.cellSize - 2, this.config.cellSize - 2,
              this.currentPiece.color
            )
          }
        }
      }
    }
    
    // UI
    this.add.text(20, 20, `Score: ${this.score}`, { fontSize: '24px', color: '#ffffff' })
    this.add.text(20, 50, `Lines: ${this.lines}`, { fontSize: '20px', color: '#ffffff' })
    this.add.text(20, 80, `Level: ${this.level}`, { fontSize: '20px', color: '#ffffff' })
  }

  private gameOver() {
    this.gameRunning = false
    this.callbacks.onGameOver?.(this.score)
    
    this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    )
    
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Game Over!', {
      fontSize: '48px',
      color: '#ff073a'
    }).setOrigin(0.5)
    
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)
    
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Press SPACE to restart', {
      fontSize: '24px',
      color: '#cccccc'
    }).setOrigin(0.5)
  }

  private restartGame() {
    this.scene.restart()
  }

  destroy() {
    // Clean up event listeners - no longer needed as we're using Phaser events
  }

  getScore() {
    return this.score
  }
}

export function init(container: string, config: TetrisConfig = {}, callbacks: GameCallbacks = {}) {
  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: container,
    backgroundColor: config.backgroundColor || '#1a1a2e',
    pixelArt: true,
    scene: new TetrisGame(config, callbacks)
  }
  
  return new Phaser.Game(gameConfig)
}