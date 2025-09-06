export class IsometricGrid {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics;
    private hoverGraphics: Phaser.GameObjects.Graphics;
    private gridWidth: number;
    private gridHeight: number;
    private tileWidth = 64;
    private tileHeight = 32;
    private currentHoverTile: {x: number, y: number} | null = null;

    constructor(scene: Phaser.Scene, width: number, height: number) {
        this.scene = scene;
        this.gridWidth = width;
        this.gridHeight = height;
        this.graphics = scene.add.graphics();
        this.hoverGraphics = scene.add.graphics();
        this.drawGrid();
        this.setupHoverDetection();
    }

    drawGrid() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0x999999, 0.8);

        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const { screenX, screenY } = this.toScreenXY(x, y);
                this.drawTile(screenX, screenY);
            }
        }
    }

    private drawTile(x: number, y: number) {
        const points = [
            { x: x, y: y - this.tileHeight/2 },
            { x: x + this.tileWidth/2, y: y },
            { x: x, y: y + this.tileHeight/2 },
            { x: x - this.tileWidth/2, y: y }
        ];

        this.graphics.beginPath();
        this.graphics.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.graphics.lineTo(point.x, point.y));
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    toScreenXY(gridX: number, gridY: number) {
        const screenX = (gridX - gridY) * this.tileWidth/2 + 400;
        const screenY = (gridX + gridY) * this.tileHeight/2 + 100;
        return { screenX, screenY };
    }

    toGridXY(screenX: number, screenY: number) {
        screenX -= 400;
        screenY -= 100;
        const gridX = (screenX/this.tileWidth + screenY/this.tileHeight);
        const gridY = (screenY/this.tileHeight - screenX/this.tileWidth);
        return { 
            x: Math.floor(gridX), 
            y: Math.floor(gridY) 
        };
    }

    getTileAtWorldXY(x: number, y: number) {
        return this.toGridXY(x, y);
    }

    isValidTile(x: number, y: number): boolean {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    getValidTileAtWorldXY(x: number, y: number): {x: number, y: number} | null {
        const tile = this.toGridXY(x, y);
        if (this.isValidTile(tile.x, tile.y)) {
            return tile;
        }
        return null;
    }

    calculateTrajectory(fromX: number, fromY: number, directionX: number, directionY: number): {x: number, y: number} {
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / length;
        const normalizedY = directionY / length;

        const maxDistance = Math.max(this.gridWidth, this.gridHeight) * 2;
        const endX = fromX + normalizedX * maxDistance;
        const endY = fromY + normalizedY * maxDistance;

        const gridEndX = Math.min(Math.max(0, Math.round(endX)), this.gridWidth - 1);
        const gridEndY = Math.min(Math.max(0, Math.round(endY)), this.gridHeight - 1);

        return { x: gridEndX, y: gridEndY };
    }

    private setupHoverDetection() {
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.updateHoverIndicator(pointer.x, pointer.y);
        });
    }

    private updateHoverIndicator(x: number, y: number) {
        const tile = this.getValidTileAtWorldXY(x, y);
        
        this.hoverGraphics.clear();
        
        if (tile) {
            this.currentHoverTile = tile;
            this.drawHoverTile(tile.x, tile.y);
        } else {
            this.currentHoverTile = null;
        }
    }

    private drawHoverTile(gridX: number, gridY: number) {
        const { screenX, screenY } = this.toScreenXY(gridX, gridY);
        
        this.hoverGraphics.lineStyle(3, 0xffff00, 0.8);
        
        const points = [
            { x: screenX, y: screenY - this.tileHeight/2 },
            { x: screenX + this.tileWidth/2, y: screenY },
            { x: screenX, y: screenY + this.tileHeight/2 },
            { x: screenX - this.tileWidth/2, y: screenY }
        ];

        this.hoverGraphics.beginPath();
        this.hoverGraphics.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.hoverGraphics.lineTo(point.x, point.y));
        this.hoverGraphics.closePath();
        this.hoverGraphics.strokePath();
    }

    getCurrentHoverTile(): {x: number, y: number} | null {
        return this.currentHoverTile;
    }

    update() {
    }
}