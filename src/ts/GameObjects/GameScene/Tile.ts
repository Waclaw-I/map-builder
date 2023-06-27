export enum TileEdge {
    N,
    W,
}

export class Tile {

    private x: number;
    private y: number;
    // is this edge of the tile occupied with wall
    private edges: Record<TileEdge, boolean>;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.edges = {
            [TileEdge.N]: false,
            [TileEdge.W]: false,
        };
    }

    public setEdge(edge: TileEdge, occupied: boolean) {
        this.edges[edge] = occupied;
    }
}
