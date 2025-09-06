export class Pathfinding {
    private grid: any;
    private gridWidth: number = 32;
    private gridHeight: number = 32;

    constructor(grid: any) {
        this.grid = grid;
    }

    findPath(startX: number, startY: number, endX: number, endY: number): {x: number, y: number}[] {
        if (!this.isValidTile(endX, endY)) {
            return [];
        }

        if (startX === endX && startY === endY) {
            return [{x: endX, y: endY}];
        }

        const openSet: Node[] = [];
        const closedSet: Set<string> = new Set();
        const cameFrom: Map<string, Node> = new Map();

        const startNode = new Node(startX, startY, 0, this.heuristic(startX, startY, endX, endY));
        openSet.push(startNode);

        while (openSet.length > 0) {
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }

            const current = openSet.splice(currentIndex, 1)[0];
            const currentKey = `${current.x},${current.y}`;
            closedSet.add(currentKey);

            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(cameFrom, current);
            }

            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(neighborKey)) {
                    continue;
                }

                const tentativeG = current.g + 1;
                const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                
                if (!existingNode) {
                    const neighborNode = new Node(
                        neighbor.x, 
                        neighbor.y, 
                        tentativeG, 
                        this.heuristic(neighbor.x, neighbor.y, endX, endY)
                    );
                    openSet.push(neighborNode);
                    cameFrom.set(neighborKey, current);
                } else if (tentativeG < existingNode.g) {
                    existingNode.g = tentativeG;
                    existingNode.f = existingNode.g + existingNode.h;
                    cameFrom.set(neighborKey, current);
                }
            }
        }

        return [];
    }

    private getNeighbors(x: number, y: number): {x: number, y: number}[] {
        const neighbors: {x: number, y: number}[] = [];
        
        const directions = [
            {dx: 0, dy: -1},
            {dx: 1, dy: 0},
            {dx: 0, dy: 1},
            {dx: -1, dy: 0}
        ];

        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (this.isValidTile(newX, newY)) {
                neighbors.push({x: newX, y: newY});
            }
        }

        return neighbors;
    }

    private isValidTile(x: number, y: number): boolean {
        return this.grid.isValidTile(x, y);
    }

    private heuristic(x1: number, y1: number, x2: number, y2: number): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    private reconstructPath(cameFrom: Map<string, Node>, current: Node): {x: number, y: number}[] {
        const path: {x: number, y: number}[] = [];
        let node: Node | undefined = current;

        while (node) {
            path.unshift({x: node.x, y: node.y});
            const key = `${node.x},${node.y}`;
            node = cameFrom.get(key);
        }

        return path;
    }
}

class Node {
    public x: number;
    public y: number;
    public g: number;
    public h: number;
    public f: number;

    constructor(x: number, y: number, g: number, h: number) {
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
        this.f = g + h;
    }
}