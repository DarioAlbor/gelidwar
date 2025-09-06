import { GameUI } from '../../ui/GameUI';
import { Pathfinding } from '../utils/Pathfinding';

export class Player {
    private scene: Phaser.Scene;
    public sprite: Phaser.GameObjects.Rectangle;
    private snowballs: number = 0;
    private maxSnowballs: number = 5;
    public gameUI: GameUI;
    public x: number;
    public y: number;
    public alive: boolean = true;
    public score: number = 0;
    private pathfinding: Pathfinding;
    private currentPath: {x: number, y: number}[] = [];
    private pathIndex: number = 0;
    private isMoving: boolean = false;
    private movementTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite = scene.add.rectangle(400, 300, 32, 32, 0xff0000);
        this.gameUI = new GameUI();
        this.pathfinding = new Pathfinding((this.scene.game.scene.scenes[0] as any).grid);
        this.updateUI();
    }

    moveToTile(tile: {x: number, y: number}) {
        if (this.x === tile.x && this.y === tile.y) {
            return;
        }

        this.stopMovement();

        this.currentPath = this.pathfinding.findPath(this.x, this.y, tile.x, tile.y);
        
        if (this.currentPath.length === 0) {
            this.gameUI.showMessage('Cannot reach that tile', 2000);
            return;
        }

        this.pathIndex = 0;
        this.isMoving = true;
        this.moveToNextTile();
    }

    private moveToNextTile() {
        if (this.pathIndex >= this.currentPath.length) {
            this.isMoving = false;
            this.movementTimer = null;
            return;
        }

        const nextTile = this.currentPath[this.pathIndex];
        this.x = nextTile.x;
        this.y = nextTile.y;
        
        const pos = (this.scene.game.scene.scenes[0] as any).grid.toScreenXY(nextTile.x, nextTile.y);
        this.sprite.setPosition(pos.screenX, pos.screenY);

        (this.scene.game.scene.scenes[0] as any).networkManager.movePlayer(nextTile.x, nextTile.y);

        this.pathIndex++;

        this.movementTimer = this.scene.time.delayedCall(200, () => {
            this.moveToNextTile();
        });
    }

    throwSnowball(pointer: Phaser.Input.Pointer) {
        if (this.snowballs <= 0 || !this.alive) {
            if (!this.alive) {
                this.gameUI.showMessage('Cannot throw snowballs when dead', 2000);
            } else if (this.snowballs <= 0) {
                this.gameUI.showMessage('No snowballs available', 2000);
            }
            return;
        }
        
        const grid = (this.scene.game.scene.scenes[0] as any).grid;
        
        const targetTile = grid.getValidTileAtWorldXY(pointer.x, pointer.y);
        if (!targetTile) {
            this.gameUI.showMessage('Cannot throw outside play area', 2000);
            return;
        }
        
        (this.scene.game.scene.scenes[0] as any).networkManager.throwSnowball(targetTile.x, targetTile.y);
    }

    hit() {
        this.alive = false;
        this.sprite.setAlpha(0);
        
        this.stopMovement();
        
        this.gameUI.showMessage('You have been eliminated!', 2000);
        
        setTimeout(() => {
            this.showReviveButton();
        }, 3000);
    }

    private showReviveButton() {
        const reviveButton = this.scene.add.text(400, 300, '🔄 REVIVE', { 
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        }).setInteractive().setOrigin(0.5);
        
        reviveButton.on('pointerover', () => {
            reviveButton.setStyle({ backgroundColor: '#45a049' });
        });
        
        reviveButton.on('pointerout', () => {
            reviveButton.setStyle({ backgroundColor: '#4CAF50' });
        });
        
        reviveButton.on('pointerdown', () => {
            this.revive();
            reviveButton.destroy();
        });
    }

    revive() {
        this.alive = true;
        this.sprite.setAlpha(1);
        this.snowballs = 0;
        this.updateUI();
        
        this.gameUI.showMessage('You have revived! Pick up snowballs with G', 3000);
        
        (this.scene.game.scene.scenes[0] as any).networkManager.revivePlayer();
    }

    pickupSnowball() {
        (this.scene.game.scene.scenes[0] as any).networkManager.pickupSnowball();
    }

    private updateUI(): void {
        this.gameUI.updateSnowballCount(this.snowballs);
    }

    getSnowballCount(): number {
        return this.snowballs;
    }

    isPlayerMoving(): boolean {
        return this.isMoving;
    }

    private stopMovement(): void {
        if (this.movementTimer) {
            this.movementTimer.destroy();
            this.movementTimer = null;
        }
        this.isMoving = false;
        this.currentPath = [];
        this.pathIndex = 0;
    }

    getMaxSnowballs(): number {
        return this.maxSnowballs;
    }

    update() {
    }
}