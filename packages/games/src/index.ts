// Game exports
export { SnakeGame, init as initSnake } from './snake/SnakeGame'
export { TetrisGame, init as initTetris } from './tetris/TetrisGame'
export { SpaceShooterGame, init as initSpaceShooter } from './space-shooter/SpaceShooterGame'

// Common types and utilities
export * from './types'
export * from './utils'

// Game configurations
export type { SnakeConfig, GameCallbacks as SnakeCallbacks } from './snake/SnakeGame'
export type { TetrisConfig, GameCallbacks as TetrisCallbacks } from './tetris/TetrisGame'
export type { SpaceShooterConfig, GameCallbacks as SpaceShooterCallbacks } from './space-shooter/SpaceShooterGame'