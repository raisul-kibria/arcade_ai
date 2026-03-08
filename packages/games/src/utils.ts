import { GameConfig } from './types'

export const createGameConfig = (containerId: string): GameConfig => ({
  width: 800,
  height: 600,
  parent: containerId,
  backgroundColor: '#000000',
  pixelArt: true
})

export const getRandomColor = (): number => {
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}