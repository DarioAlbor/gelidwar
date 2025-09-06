import { MainScene } from '../../scenes/MainScene';

export class SnowballSystem {
    private scene: Phaser.Scene;
    private snowballs: Phaser.GameObjects.Arc[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    checkCollision(snowball: Phaser.GameObjects.Arc, player: Phaser.GameObjects.Rectangle): boolean {
        const bounds1 = snowball.getBounds();
        const bounds2 = player.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);
    }

    createSnowball(fromX: number, fromY: number, toX: number, toY: number, onHit?: () => void) {
        const snowball = this.scene.add.arc(fromX, fromY, 8, 0, 360, false, 0xffffff);
        this.snowballs.push(snowball);

        this.scene.tweens.add({
            targets: snowball,
            x: toX,
            y: toY,
            duration: 500,
            onUpdate: () => {
                // Verificar colisiones durante el movimiento
                const mainScene = this.scene.game.scene.scenes[0] as MainScene;
                if (mainScene.players) {
                    mainScene.players.forEach((player) => {
                        if (this.checkCollision(snowball, player.sprite)) {
                            if (onHit) onHit();
                            snowball.destroy();
                        }
                    });
                }
            },
            onComplete: () => {
                snowball.destroy();
                this.snowballs = this.snowballs.filter(b => b !== snowball);
            }
        });
    }

    update() {
        // Actualizar estado de las bolas de nieve
    }
}