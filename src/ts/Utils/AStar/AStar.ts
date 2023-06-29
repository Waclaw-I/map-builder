import { Tile, TileEdge } from '../../GameObjects/GameScene/Tile';
import { AStarNode } from './AStarNode';

export function AStar(startCoords: { x: number, y: number }, goalCoords: { x: number, y: number }, grid: Tile[][]): { x: number, y: number }[] | null {
    const nodes: AStarNode[][] = [];
    for (let y = 0; y < grid.length; y++) {
        nodes.push([]);
        for (let x = 0; x < grid[y].length; x++) {
            const tile = grid[y][x];
            
            nodes[y].push(new AStarNode(x, y, tile.getEdge(TileEdge.N), tile.getEdge(TileEdge.W), tile.isColliding()));
        }
    }

    const openList: AStarNode[] = [ nodes[startCoords.y][startCoords.x] ];
    const closedList: AStarNode[] = [];

    const goal = nodes[goalCoords.y][goalCoords.x];
  
    while (openList.length > 0) {
        // Find the node with the lowest f value in the open list
        const currentNode = openList.reduce((minNode, node) =>
            node.f < minNode.f ? node : minNode,
        );
  
        // Move the current node from the open list to the closed list
        openList.splice(openList.indexOf(currentNode), 1);
        closedList.push(currentNode);
  
        // Check if the goal has been reached
        if (currentNode === goal) {
            const path: AStarNode[] = [];
            let node: AStarNode | null = currentNode;
  
            while (node !== null) {
                path.unshift(node);
                node = node.parent;
            }
            console.log(path);
            return path.map(node => { return { x: node.x, y: node.y}; });
        }
  
        // Generate neighboring nodes
        const neighbors: AStarNode[] = [];
        const { x, y } = currentNode;
  
        // west
        if (x > 0) {
            // no wall to the west, we can proceed
            if (!nodes[y][x].westWall && !nodes[y][x - 1].occupied) {
                neighbors.push(nodes[y][x - 1]);
            }
        }
        // east
        if (x < nodes[0].length - 1) {
            // no wall to the east, we can proceed
            if (!nodes[y][x + 1].westWall && !nodes[y][x + 1].occupied) {
                neighbors.push(nodes[y][x + 1]);
            }
        }
        // north
        if (y > 0) {
            // no wall to the north, we can proceed
            if (!nodes[y][x].northWall && !nodes[y - 1][x].occupied) {
                neighbors.push(nodes[y - 1][x]);
            }
        }
        // south
        if (y < nodes.length - 1) {
            // no wall to the south, we can proceed
            if (!nodes[y + 1][x].northWall && !nodes[y + 1][x].occupied) {
                neighbors.push(nodes[y + 1][x]);
            }
        }
  
        for (const neighbor of neighbors) {
            if (closedList.includes(neighbor)) {
                continue; // Skip if the neighbor is in the closed list
            }
  
            const tentativeG = currentNode.g + 1;
  
            if (!openList.includes(neighbor) || tentativeG < neighbor.g) {
                // Update the neighbor if it's not in the open list or has a better g value
                neighbor.parent = currentNode;
                neighbor.calculateHeuristic(goal);
                neighbor.calculateCost();
  
                if (!openList.includes(neighbor)) {
                    openList.push(neighbor);
                }
            }
        }
    }
  
    return null; // No path found
}
