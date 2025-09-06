import { io, Socket } from 'socket.io-client';

export class NetworkManager {
    private socket: Socket;
    private players: Map<string, any> = new Map();
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const backendUrl = (window as any).VITE_BACKEND_URL || 'http://localhost:3000';
        this.socket = io(backendUrl);
        this.setupListeners();
    }

    private setupListeners() {
        this.socket.on('gameState', (state: any) => {
            this.updateGameState(state);
        });

        this.socket.on('snowballThrown', (data: any) => {
            this.handleSnowballThrown(data);
        });

        this.socket.on('playerHit', (data: {hitBy: string, target: string}) => {
            if (data.target === this.socket.id) {
                (this.scene as any).player.hit();
            }
        });
    }

    private updateGameState(state: any) {
        if (!Array.isArray(state.players)) return;
        
        const localPlayerData = state.players.find((p: any) => p.id === this.socket.id);
        if (localPlayerData) {
            const localPlayer = (this.scene as any).player;
            if (localPlayer) {
                const oldSnowballs = localPlayer.snowballs;
                localPlayer.snowballs = localPlayerData.snowballs;
                localPlayer.alive = localPlayerData.alive;
                
                if (localPlayerData.snowballs > oldSnowballs) {
                    if (localPlayerData.snowballs === 5) {
                        localPlayer.gameUI.showMessage('Inventory full! (5/5)', 1500);
                    } else {
                        localPlayer.gameUI.showMessage(`Snowball picked up (${localPlayerData.snowballs}/5)`, 1000);
                    }
                }
                
                if (localPlayerData.snowballs < oldSnowballs) {
                    localPlayer.gameUI.showMessage(`Snowball thrown (${localPlayerData.snowballs}/5)`, 1000);
                }
                
                localPlayer.updateUI();
            }
        }
        
        state.players.forEach((player: any) => {
            if (player.id !== this.socket.id) {
                if (!this.players.has(player.id)) {
                    const playerSprite = this.scene.add.rectangle(0, 0, 32, 32, 0xff0000);
                    this.players.set(player.id, playerSprite);
                }
                
                const sprite = this.players.get(player.id);
                if (sprite) {
                    if (player.alive) {
                        const pos = (this.scene.game.scene.scenes[0] as any).grid.toScreenXY(player.x, player.y);
                        sprite.setPosition(pos.screenX, pos.screenY);
                        sprite.setAlpha(1);
                    } else {
                        sprite.setAlpha(0);
                    }
                }
            }
        });

        const currentPlayerIds = new Set(state.players.map((p: any) => p.id));
        this.players.forEach((sprite, id) => {
            if (!currentPlayerIds.has(id)) {
                sprite.destroy();
                this.players.delete(id);
            }
        });

        this.updateScoreboard(state.players);
    }

    private updateScoreboard(players: any[]) {
        const localPlayer = (this.scene as any).player;
        if (localPlayer && localPlayer.gameUI) {
            localPlayer.gameUI.setCurrentPlayerId(this.socket.id);
            localPlayer.gameUI.updateScoreboard(players);
        }
    }

    private handleSnowballThrown(data: any) {
        const fromPos = (this.scene.game.scene.scenes[0] as any).grid.toScreenXY(data.fromX, data.fromY);
        const toPos = (this.scene.game.scene.scenes[0] as any).grid.toScreenXY(data.toX, data.toY);
        
        const snowball = this.scene.add.circle(fromPos.screenX, fromPos.screenY, 8, 0xffffff);
        
        this.scene.tweens.add({
            targets: snowball,
            x: toPos.screenX,
            y: toPos.screenY,
            duration: 500,
            onComplete: () => snowball.destroy()
        });
    }

    movePlayer(x: number, y: number) {
        this.socket.emit('movePlayer', { x, y });
    }

    throwSnowball(toX: number, toY: number) {
        this.socket.emit('throwSnowball', { toX, toY });
    }

    pickupSnowball() {
        this.socket.emit('pickupSnowball');
    }

    reportHit(targetId: string) {
        this.socket.emit('hitPlayer', { target: targetId });
    }

    revivePlayer() {
        this.socket.emit('revivePlayer');
    }
}