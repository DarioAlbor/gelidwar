export class GameUI {
    private snowballCountElement: HTMLElement | null;
    private playersListElement: HTMLElement | null;
    private maxSnowballs: number = 5;
    private currentPlayerId: string | null = null;

    constructor() {
        this.snowballCountElement = document.getElementById('snowball-count');
        this.playersListElement = document.getElementById('players-list');
        this.initializeUI();
    }

    private initializeUI(): void {
        if (this.snowballCountElement) {
            this.snowballCountElement.textContent = '0';
        }
    }

    updateSnowballCount(count: number): void {
        if (this.snowballCountElement) {
            const clampedCount = Math.min(Math.max(0, count), this.maxSnowballs);
            this.snowballCountElement.textContent = clampedCount.toString();
            
            this.updateSnowballCounterColor(clampedCount);
        }
    }

    private updateSnowballCounterColor(count: number): void {
        if (!this.snowballCountElement) return;

        const counterElement = document.getElementById('snowball-counter');
        if (!counterElement) return;

        counterElement.classList.remove('low', 'medium', 'high', 'full');

        if (count === 0) {
            counterElement.classList.add('low');
        } else if (count <= 2) {
            counterElement.classList.add('medium');
        } else if (count <= 4) {
            counterElement.classList.add('high');
        } else if (count === this.maxSnowballs) {
            counterElement.classList.add('full');
        }
    }

    showMessage(message: string, duration: number = 2000): void {
        const messagesContainer = document.getElementById('game-messages');
        if (!messagesContainer) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        notificationElement.textContent = message;
        
        notificationElement.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            font-size: 14px;
            font-weight: 500;
            text-align: left;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            margin-bottom: 10px;
            max-width: 300px;
            opacity: 0;
            transform: translateX(-100%);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            border-left: 4px solid #4CAF50;
        `;

        messagesContainer.appendChild(notificationElement);

        setTimeout(() => {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notificationElement.style.opacity = '0';
            notificationElement.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.parentNode.removeChild(notificationElement);
                }
            }, 300);
        }, duration);
    }

    getMaxSnowballs(): number {
        return this.maxSnowballs;
    }

    isInventoryFull(currentCount: number): boolean {
        return currentCount >= this.maxSnowballs;
    }

    setCurrentPlayerId(playerId: string): void {
        this.currentPlayerId = playerId;
    }

    updateScoreboard(players: Array<{id: string, score: number}>): void {
        if (!this.playersListElement) return;

        this.playersListElement.innerHTML = '';

        if (players.length === 0) {
            this.playersListElement.innerHTML = '<div class="no-players">Waiting for players...</div>';
            return;
        }

        const sortedPlayers = players.sort((a, b) => b.score - a.score);

        sortedPlayers.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            
            if (player.id === this.currentPlayerId) {
                playerElement.classList.add('current-player');
            }

            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = this.truncatePlayerId(player.id);

            const playerScore = document.createElement('div');
            playerScore.className = 'player-score';
            playerScore.textContent = player.score.toString();

            playerElement.appendChild(playerName);
            playerElement.appendChild(playerScore);
            this.playersListElement.appendChild(playerElement);
        });
    }

    private truncatePlayerId(playerId: string): string {
        if (playerId.length <= 12) {
            return playerId;
        }
        return playerId.substring(0, 8) + '...';
    }
}