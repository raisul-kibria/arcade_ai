import * as Phaser from 'phaser';
export class SpaceShooterGame extends Phaser.Scene {
    constructor(config = {}, callbacks = {}) {
        super({ key: 'SpaceShooterGame' });
        this.bullets = [];
        this.enemies = [];
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.keys = {};
        this.shootTimer = 0;
        this.enemySpawnTimer = 0;
        this.stars = [];
        this.config = {
            playerSpeed: config.playerSpeed || 300,
            bulletSpeed: config.bulletSpeed || 500,
            enemySpeed: config.enemySpeed || 100,
            spawnRate: config.spawnRate || 1000,
            backgroundColor: config.backgroundColor || '#0a0a1a',
            playerColor: config.playerColor || '#00ff41',
            bulletColor: config.bulletColor || '#ffff00',
            enemyColor: config.enemyColor || '#ff073a'
        };
        this.callbacks = callbacks;
        this.player = {
            x: 400,
            y: 500,
            width: 40,
            height: 40,
            vx: 0,
            vy: 0,
            color: parseInt(this.config.playerColor.replace('#', ''), 16),
            active: true
        };
    }
    create() {
        this.score = 0;
        this.gameRunning = true;
        this.bullets = [];
        this.enemies = [];
        // Reset player position
        this.player.x = this.cameras.main.centerX;
        this.player.y = this.cameras.main.height - 80;
        this.player.vx = 0;
        this.player.vy = 0;
        // Create starfield
        this.createStarfield();
        this.setupInput();
        // Game loop
        this.time.addEvent({
            delay: 16,
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });
    }
    // Make update method public to satisfy Phaser.Scene interface
    update(time, delta) {
        this.updateGame(time, delta);
    }
    createStarfield() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.cameras.main.width,
                y: Math.random() * this.cameras.main.height,
                speed: Math.random() * 3 + 1
            });
        }
    }
    setupInput() {
        var _a, _b;
        this.keys = (_a = this.input.keyboard) === null || _a === void 0 ? void 0 : _a.addKeys('W,S,A,D,SPACE,UP,DOWN,LEFT,RIGHT');
        // Use Phaser's keyboard system for space restart with focus checking
        (_b = this.input.keyboard) === null || _b === void 0 ? void 0 : _b.on('keydown', (event) => {
            const isGameFocused = this.callbacks.getFocusState ? this.callbacks.getFocusState() : true;
            console.log('🚀 Space Shooter - Key pressed:', event.code, 'Game focused:', isGameFocused);
            if (!isGameFocused) {
                console.log('🚫 Space Shooter input blocked - chat is focused, allowing event to pass through');
                // Allow keys to work normally in chat when chat is focused
                return;
            }
            // Handle restart on space when game over
            if (event.code === 'Space' && !this.gameRunning) {
                console.log('🔄 Space Shooter restarting...');
                this.restartGame();
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            // Prevent default for game control keys when game is focused and running
            const gameKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
            if (gameKeys.includes(event.code) && this.gameRunning) {
                console.log('🎯 Space Shooter handled key:', event.code);
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    updateGame(time, delta) {
        if (!this.gameRunning)
            return;
        // Check if game should be paused when out of focus
        const shouldBePaused = this.callbacks.getFocusState ? !this.callbacks.getFocusState() : false;
        if (shouldBePaused !== this.gamePaused) {
            this.gamePaused = shouldBePaused;
            console.log(shouldBePaused ? '⏸️ Space Shooter paused - chat focused' : '▶️ Space Shooter resumed - game focused');
        }
        // Don't update game logic when paused
        if (this.gamePaused)
            return;
        const actualDelta = delta || 16;
        // Update starfield
        this.updateStarfield(actualDelta);
        // Handle player input
        this.handleInput(actualDelta);
        // Update bullets
        this.updateBullets(actualDelta);
        // Update enemies
        this.updateEnemies(actualDelta);
        // Spawn enemies
        this.spawnEnemies(actualDelta);
        // Check collisions
        this.checkCollisions();
        // Update timers
        this.shootTimer += actualDelta;
        this.enemySpawnTimer += actualDelta;
        this.render();
    }
    updateStarfield(delta) {
        this.stars.forEach(star => {
            star.y += star.speed * (delta / 16);
            if (star.y > this.cameras.main.height) {
                star.y = 0;
                star.x = Math.random() * this.cameras.main.width;
            }
        });
    }
    handleInput(delta) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        // Check if game should accept input
        if (this.callbacks.getFocusState && !this.callbacks.getFocusState()) {
            console.log('🚫 Space Shooter movement blocked - chat is focused');
            return;
        }
        this.player.vx = 0;
        this.player.vy = 0;
        if (((_a = this.keys.LEFT) === null || _a === void 0 ? void 0 : _a.isDown) || ((_b = this.keys.A) === null || _b === void 0 ? void 0 : _b.isDown)) {
            this.player.vx = -this.config.playerSpeed;
        }
        if (((_c = this.keys.RIGHT) === null || _c === void 0 ? void 0 : _c.isDown) || ((_d = this.keys.D) === null || _d === void 0 ? void 0 : _d.isDown)) {
            this.player.vx = this.config.playerSpeed;
        }
        if (((_e = this.keys.UP) === null || _e === void 0 ? void 0 : _e.isDown) || ((_f = this.keys.W) === null || _f === void 0 ? void 0 : _f.isDown)) {
            this.player.vy = -this.config.playerSpeed;
        }
        if (((_g = this.keys.DOWN) === null || _g === void 0 ? void 0 : _g.isDown) || ((_h = this.keys.S) === null || _h === void 0 ? void 0 : _h.isDown)) {
            this.player.vy = this.config.playerSpeed;
        }
        // Update player position
        this.player.x += this.player.vx * (delta / 1000);
        this.player.y += this.player.vy * (delta / 1000);
        // Keep player in bounds
        this.player.x = Math.max(this.player.width / 2, Math.min(this.cameras.main.width - this.player.width / 2, this.player.x));
        this.player.y = Math.max(this.player.height / 2, Math.min(this.cameras.main.height - this.player.height / 2, this.player.y));
        // Shooting
        if (((_j = this.keys.SPACE) === null || _j === void 0 ? void 0 : _j.isDown) && this.shootTimer >= 200) {
            this.shoot();
            this.shootTimer = 0;
        }
    }
    shoot() {
        this.bullets.push({
            x: this.player.x,
            y: this.player.y - this.player.height / 2,
            width: 4,
            height: 12,
            vx: 0,
            vy: -this.config.bulletSpeed,
            color: parseInt(this.config.bulletColor.replace('#', ''), 16),
            active: true
        });
    }
    updateBullets(delta) {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y += bullet.vy * (delta / 1000);
            return bullet.y > -bullet.height && bullet.active;
        });
    }
    spawnEnemies(delta) {
        if (this.enemySpawnTimer >= this.config.spawnRate) {
            this.enemySpawnTimer = 0;
            const enemy = {
                x: Math.random() * (this.cameras.main.width - 40) + 20,
                y: -30,
                width: 30,
                height: 30,
                vx: (Math.random() - 0.5) * 100,
                vy: this.config.enemySpeed + Math.random() * 50,
                color: parseInt(this.config.enemyColor.replace('#', ''), 16),
                active: true,
                health: 1
            };
            this.enemies.push(enemy);
        }
    }
    updateEnemies(delta) {
        this.enemies = this.enemies.filter(enemy => {
            enemy.x += enemy.vx * (delta / 1000);
            enemy.y += enemy.vy * (delta / 1000);
            // Bounce off walls
            if (enemy.x <= enemy.width / 2 || enemy.x >= this.cameras.main.width - enemy.width / 2) {
                enemy.vx *= -1;
            }
            return enemy.y < this.cameras.main.height + 50 && enemy.active && enemy.health > 0;
        });
    }
    checkCollisions() {
        // Bullet-enemy collisions
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                var _a, _b;
                if (this.isColliding(bullet, enemy) && bullet.active && enemy.active) {
                    bullet.active = false;
                    enemy.health--;
                    if (enemy.health <= 0) {
                        enemy.active = false;
                        this.score += 100;
                        (_b = (_a = this.callbacks).onScore) === null || _b === void 0 ? void 0 : _b.call(_a, this.score);
                    }
                }
            });
        });
        // Player-enemy collisions
        this.enemies.forEach(enemy => {
            if (this.isColliding(this.player, enemy) && enemy.active) {
                this.gameOver();
            }
        });
        // Check if enemies reached bottom
        if (this.enemies.some(enemy => enemy.y > this.cameras.main.height - 100)) {
            this.gameOver();
        }
        // Remove inactive objects
        this.bullets = this.bullets.filter(bullet => bullet.active);
        this.enemies = this.enemies.filter(enemy => enemy.active && enemy.health > 0);
    }
    isColliding(obj1, obj2) {
        return obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
            obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
            obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
            obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2;
    }
    render() {
        this.children.removeAll();
        // Background
        this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, parseInt(this.config.backgroundColor.replace('#', ''), 16));
        // Stars
        this.stars.forEach(star => {
            this.add.circle(star.x, star.y, 1, 0xffffff, 0.8);
        });
        // Player
        this.add.rectangle(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color);
        // Bullets
        this.bullets.forEach(bullet => {
            if (bullet.active) {
                this.add.rectangle(bullet.x, bullet.y, bullet.width, bullet.height, bullet.color);
            }
        });
        // Enemies
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                this.add.rectangle(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
            }
        });
        // UI
        this.add.text(20, 20, `Score: ${this.score}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(20, 50, `Enemies: ${this.enemies.length}`, { fontSize: '18px', color: '#cccccc' });
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
        backgroundColor: config.backgroundColor || '#0a0a1a',
        pixelArt: true,
        scene: new SpaceShooterGame(config, callbacks)
    };
    return new Phaser.Game(gameConfig);
}
//# sourceMappingURL=SpaceShooterGame.js.map