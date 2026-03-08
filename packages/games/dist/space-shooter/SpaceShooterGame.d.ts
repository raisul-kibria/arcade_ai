import * as Phaser from 'phaser';
export interface SpaceShooterConfig {
    playerSpeed?: number;
    bulletSpeed?: number;
    enemySpeed?: number;
    spawnRate?: number;
    backgroundColor?: string;
    playerColor?: string;
    bulletColor?: string;
    enemyColor?: string;
}
export interface GameCallbacks {
    onScore?: (score: number) => void;
    onGameOver?: (finalScore: number) => void;
    getFocusState?: () => boolean;
}
export declare class SpaceShooterGame extends Phaser.Scene {
    private config;
    private callbacks;
    private player;
    private bullets;
    private enemies;
    private score;
    private gameRunning;
    private gamePaused;
    private keys;
    private shootTimer;
    private enemySpawnTimer;
    private stars;
    constructor(config?: SpaceShooterConfig, callbacks?: GameCallbacks);
    create(): void;
    update(time: number, delta: number): void;
    private createStarfield;
    private setupInput;
    private updateGame;
    private updateStarfield;
    private handleInput;
    private shoot;
    private updateBullets;
    private spawnEnemies;
    private updateEnemies;
    private checkCollisions;
    private isColliding;
    private render;
    private gameOver;
    private restartGame;
    destroy(): void;
    getScore(): number;
}
export declare function init(container: string, config?: SpaceShooterConfig, callbacks?: GameCallbacks): Phaser.Game;
//# sourceMappingURL=SpaceShooterGame.d.ts.map