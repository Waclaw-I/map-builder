export class AStarNode {
    public x: number;
    public y: number;
    public g: number;
    public h: number;
    public f: number;
    public parent: AStarNode | null;

    public northWall: boolean;
    public westWall: boolean;
    public occupied: boolean;
  
    constructor(x: number, y: number, northWall: boolean, westWall: boolean, occupied: boolean) {
        this.x = x;
        this.y = y;
        this.northWall = northWall;
        this.westWall = westWall;
        this.occupied = occupied;

        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
  
    calculateHeuristic(goal: AStarNode): void {
        // Using Manhattan distance as the heuristic
        this.h = Math.abs(this.x - goal.x) + Math.abs(this.y - goal.y);
    }
  
    calculateCost(): void {
        // Assuming a cost of 1 to move to any adjacent node
        this.g = this.parent ? this.parent.g + 1 : 0;
        this.f = this.g + this.h;
    }
}
