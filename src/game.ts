import 'phaser';
import { MainScene } from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-area',
    scene: MainScene,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
};

new Phaser.Game(config);
