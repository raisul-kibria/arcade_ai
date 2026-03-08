import * as Phaser from 'phaser';
export class SnakeGame extends Phaser.Scene {
    constructor(config = {}, callbacks = {}) {
        super({ key: 'SnakeGame' });
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.moveTimer = 0;
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.config = {
            speed: config.speed || 150,
            gridSize: config.gridSize || 20,
            wrapAround: config.wrapAround || false,
            backgroundColor: config.backgroundColor || '#1a1a2e',
            snakeColor: config.snakeColor || '#00ff41',
            foodColor: config.foodColor || '#ff073a'
        };
        this.callbacks = callbacks;
    }
    create() {
        this.gridWidth = Math.floor(this.cameras.main.width / this.config.gridSize);
        this.gridHeight = Math.floor(this.cameras.main.height / this.config.gridSize);
        // Initialize snake in center
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = true;
        this.generateFood();
        this.setupInput();
        // Game loop
        this.time.addEvent({
            delay: this.config.speed,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
    }
    // Make update method public to satisfy Phaser.Scene interface
    update(time, delta) {
        // Phaser's built-in update - we use our own updateGame method
    }
    setupInput() {
        var _a;
        // Use Phaser's keyboard system but with better focus checking
        (_a = this.input.keyboard) === null || _a === void 0 ? void 0 : _a.on('keydown', (event) => {
            // Check if game should accept input
            if (!this.gameRunning && event.code !== 'Space')
                return;
            const isGameFocused = this.callbacks.getFocusState ? this.callbacks.getFocusState() : true;
            console.log('🎮 Snake game - Key pressed:', event.code, 'Game focused:', isGameFocused);
            if (!isGameFocused) {
                console.log('🚫 Snake game input blocked - chat is focused, allowing event to pass through');
                // Don't prevent default or stop propagation when chat is focused
                return;
            }
            // Only handle game-related keys and prevent their default behavior
            let handled = false;
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    if (this.gameRunning && this.direction.y !== 1)
                        this.nextDirection = { x: 0, y: -1 };
                    handled = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (this.gameRunning && this.direction.y !== -1)
                        this.nextDirection = { x: 0, y: 1 };
                    handled = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.gameRunning && this.direction.x !== 1)
                        this.nextDirection = { x: -1, y: 0 };
                    handled = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (this.gameRunning && this.direction.x !== -1)
                        this.nextDirection = { x: 1, y: 0 };
                    handled = true;
                    break;
                case 'Space':
                    if (!this.gameRunning) {
                        console.log('🔄 Snake game restarting...');
                        this.restartGame();
                    }
                    handled = true;
                    break;
            }
            // Only prevent default if we handled the key and game is focused
            if (handled) {
                console.log('🎯 Snake game handled key:', event.code);
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    updateGame() {
        var _a, _b;
        if (!this.gameRunning)
            return;
        // Check if game should be paused when out of focus
        const shouldBePaused = this.callbacks.getFocusState ? !this.callbacks.getFocusState() : false;
        if (shouldBePaused !== this.gamePaused) {
            this.gamePaused = shouldBePaused;
            console.log(shouldBePaused ? '⏸️ Snake game paused - chat focused' : '▶️ Snake game resumed - game focused');
        }
        // Don't update game logic when paused
        if (this.gamePaused)
            return;
        this.direction = Object.assign({}, this.nextDirection);
        // Calculate new head position
        const head = Object.assign({}, this.snake[0]);
        head.x += this.direction.x;
        head.y += this.direction.y;
        // Handle boundaries
        if (this.config.wrapAround) {
            if (head.x < 0)
                head.x = this.gridWidth - 1;
            if (head.x >= this.gridWidth)
                head.x = 0;
            if (head.y < 0)
                head.y = this.gridHeight - 1;
            if (head.y >= this.gridHeight)
                head.y = 0;
        }
        else {
            if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
                this.gameOver();
                return;
            }
        }
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        this.snake.unshift(head);
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            (_b = (_a = this.callbacks).onScore) === null || _b === void 0 ? void 0 : _b.call(_a, this.score);
            this.generateFood();
        }
        else {
            this.snake.pop();
        }
        this.render();
    }
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    render() {
        this.children.removeAll();
        // Background
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, parseInt(this.config.backgroundColor.replace('#', ''), 16));
        // Snake
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.config.gridSize + this.config.gridSize / 2;
            const y = segment.y * this.config.gridSize + this.config.gridSize / 2;
            const color = index === 0 ?
                parseInt(this.config.snakeColor.replace('#', ''), 16) :
                parseInt(this.config.snakeColor.replace('#', ''), 16) * 0.8;
            this.add.rectangle(x, y, this.config.gridSize - 2, this.config.gridSize - 2, color);
        });
        // Food
        const foodX = this.food.x * this.config.gridSize + this.config.gridSize / 2;
        const foodY = this.food.y * this.config.gridSize + this.config.gridSize / 2;
        this.add.rectangle(foodX, foodY, this.config.gridSize - 2, this.config.gridSize - 2, parseInt(this.config.foodColor.replace('#', ''), 16));
        // Score
        this.add.text(10, 10, `Score: ${this.score}`, {
            fontSize: '24px',
            color: '#ffffff'
        });
    }
    gameOver() {
        var _a, _b;
        this.gameRunning = false;
        (_b = (_a = this.callbacks).onGameOver) === null || _b === void 0 ? void 0 : _b.call(_a, this.score);
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Game Over!', {
            fontSize: '48px',
            color: '#ff073a'
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Press SPACE to restart', {
            fontSize: '24px',
            color: '#cccccc'
        }).setOrigin(0.5);
    }
    restartGame() {
        this.scene.restart();
    }
    destroy() {
        // Clean up event listeners - no longer needed as we're using Phaser events
    }
    getScore() {
        return this.score;
    }
}
export function init(container, config = {}, callbacks = {}) {
    const gameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: container,
        backgroundColor: config.backgroundColor || '#1a1a2e',
        pixelArt: true,
        scene: new SnakeGame(config, callbacks)
    };
    return new Phaser.Game(gameConfig);
}
//# sourceMappingURL=SnakeGame.js.map