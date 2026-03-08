import * as Phaser from 'phaser';
export interface SnakeConfig {
    speed?: number;
    gridSize?: number;
    wrapAround?: boolean;
    backgroundColor?: string;
    snakeColor?: string;
    foodColor?: string;
}
export interface GameCallbacks {
    onScore?: (score: number) => void;
    onGameOver?: (finalScore: number) => void;
    getFocusState?: () => boolean;
}
export declare class SnakeGame extends Phaser.Scene {
    private snake;
    private food;
    private direction;
    private nextDirection;
    private config;
    private callbacks;
    private score;
    private gameRunning;
    private gamePaused;
    private moveTimer;
    private gridWidth;
    private gridHeight;
    constructor(config?: SnakeConfig, callbacks?: GameCallbacks);
    create(): void;
    update(time: number, delta: number): void;
    private setupInput;
    private updateGame;
    private generateFood;
    private render;
    private gameOver;
    private restartGame;
    destroy(): void;
    getScore(): number;
}
export declare function init(container: string, config?: SnakeConfig, callbacks?: GameCallbacks): Phaser.Game;
//# sourceMappingURL=SnakeGame.d.ts.map