export enum TileEdge {
    N,
    W,
}

export class Tile {

    private x: number;
    private y: number;
    private collides: boolean;
    // is this edge of the tile occupied with wall
    private edges: Record<TileEdge, boolean>;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.collides = false;
        this.edges = {
            [TileEdge.N]: false,
            [TileEdge.W]: false,
        };
    }

    public setCollides(occupied: boolean) {
        this.collides = occupied;
    }

    public setEdge(edge: TileEdge, occupied: boolean) {
        this.edges[edge] = occupied;
    }

    public getEdge(edge: TileEdge): boolean {
        return this.edges[edge];
    }

    public isColliding(): boolean {
        return this.collides;
    }
}
