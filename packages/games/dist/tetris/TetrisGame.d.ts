import * as Phaser from 'phaser';
export interface TetrisConfig {
    speed?: number;
    gridWidth?: number;
    gridHeight?: number;
    cellSize?: number;
    backgroundColor?: string;
    gridColor?: string;
}
export interface GameCallbacks {
    onScore?: (score: number) => void;
    onGameOver?: (finalScore: number) => void;
    onLinesCleared?: (lines: number) => void;
    getFocusState?: () => boolean;
}
export declare class TetrisGame extends Phaser.Scene {
    private config;
    private callbacks;
    private board;
    private currentPiece?;
    private score;
    private lines;
    private level;
    private gameRunning;
    private gamePaused;
    private dropTimer;
    private lockDelay;
    private isLocking;
    private tetrominoes;
    constructor(config?: TetrisConfig, callbacks?: GameCallbacks);
    create(): void;
    update(time: number, delta: number): void;
    private setupInput;
    private updateGame;
    private spawnPiece;
    private movePiece;
    private rotatePiece;
    private hardDrop;
    private isValidPosition;
    private lockPiece;
    private clearLines;
    private render;
    private gameOver;
    private restartGame;
    destroy(): void;
    getScore(): number;
}
export declare function init(container: string, config?: TetrisConfig, callbacks?: GameCallbacks): Phaser.Game;
//# sourceMappingURL=TetrisGame.d.ts.map