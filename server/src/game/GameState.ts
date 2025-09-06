import { Player, GameState } from '../types';

export class GameStateManager {
    private state: GameState = {
        players: new Map()
    };

    addPlayer(id: string): Player {
        const player: Player = {
            id,
            x: Math.floor(Math.random() * 32),
            y: Math.floor(Math.random() * 32),
            snowballs: 0,
            alive: true,
            score: 0
        };
        this.state.players.set(id, player);
        return player;
    }

    getPlayer(id: string): Player | undefined {
        return this.state.players.get(id);
    }

    removePlayer(id: string): void {
        this.state.players.delete(id);
    }

    updatePlayerPosition(id: string, x: number, y: number): void {
        const player = this.state.players.get(id);
        if (player) {
            player.x = x;
            player.y = y;
        }
    }

    getState(): any {
        return {
            players: Array.from(this.state.players.values())
        };
    }

    handleSnowballHit(attackerId: string, targetX: number, targetY: number): string | null {
        const attacker = this.state.players.get(attackerId);
        if (!attacker || !attacker.alive) return null;

        let hitPlayer: Player | null = null;
        for (const [playerId, player] of this.state.players) {
            if (playerId !== attackerId && player.alive && player.x === targetX && player.y === targetY) {
                hitPlayer = player;
                break;
            }
        }

        if (hitPlayer) {
            hitPlayer.alive = false;
            hitPlayer.snowballs = 0;
            
            attacker.score += 1;
            
            const hitPlayerId = this.getPlayerIdByObject(hitPlayer);
            console.log(`Player ${attackerId} hit player ${hitPlayerId} at position (${targetX}, ${targetY})`);
            console.log(`Player ${hitPlayerId} died`);
            return hitPlayerId;
        }
        
        return null;
    }

    revivePlayer(playerId: string): void {
        const player = this.state.players.get(playerId);
        if (player && !player.alive) {
            player.alive = true;
            player.snowballs = 0;
            console.log(`Player ${playerId} revived`);
        }
    }

    private getPlayerIdByObject(targetPlayer: Player): string {
        for (const [id, player] of this.state.players) {
            if (player === targetPlayer) {
                return id;
            }
        }
        return 'unknown';
    }

    canRevive(playerId: string): boolean {
        const player = this.state.players.get(playerId);
        return player ? !player.alive : false;
    }
}