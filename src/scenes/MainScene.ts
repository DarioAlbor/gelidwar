import { IsometricGrid } from '../game/utils/IsometricGrid';
import { Player } from '../game/entities/Player';
import { NetworkManager } from '../network/NetworkManager';

export class MainScene extends Phaser.Scene {
    private grid!: IsometricGrid;
    private player!: Player;
    private networkManager!: NetworkManager;
    public players: Map<string, Player> = new Map();

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        this.grid = new IsometricGrid(this, 32, 32);
        
        this.networkManager = new NetworkManager(this);
        
        this.player = new Player(this, 0, 0);
        
        if (this.input && this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }
        
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) {
                if (this.player.isPlayerMoving()) {
                    this.player.gameUI.showMessage('Cannot throw while moving', 2000);
                    return;
                }
                this.player.throwSnowball(pointer);
            } else {
                const tile = this.grid.getValidTileAtWorldXY(pointer.x, pointer.y);
                if (tile && this.player.alive) {
                    this.player.moveToTile(tile);
                } else if (!this.player.alive) {
                    this.player.gameUI.showMessage('Cannot move when dead', 2000);
                }
            }
        });

        if (this.input && this.input.keyboard) {
            this.input.keyboard.on('keydown-G', () => {
                this.player.pickupSnowball();
            });
        }
    }

    update() {
        this.grid.update();
        this.player.update();
    }
}