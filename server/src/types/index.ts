export interface Player {
    id: string;
    x: number;
    y: number;
    snowballs: number;
    alive: boolean;
    score: number;
}

export interface GameState {
    players: Map<string, Player>;
}

export interface GameStateResponse {
    players: Array<Player>;
}

export interface HitEvent {
    hitBy: string;
    target: string;
}