
export class MapManager extends Phaser.Events.EventEmitter {

    private scene: Phaser.Scene;

    private map: Phaser.Tilemaps.Tilemap;
    private tilesets: Map<string, Phaser.Tilemaps.Tileset | null>;
    private tilemapLayers: Map<string, Phaser.Tilemaps.TilemapLayer | undefined>;

    private wallGrid: number[][];
    private collisionGrid: number[][];

    constructor(scene: Phaser.Scene, mapKey: string) {
        super();

        this.scene = scene;

        this.initializeMap(mapKey);
        this.initializeWallGrid();
        this.initializeCollisionGrid();
    }

    public getFloorTileAtWorldXY(x: number, y: number): Phaser.Tilemaps.Tile | null {
        // + 64 is a hack to fix weirdly working getTileAtWorldXY method
        return this.map.getTileAtWorldXY(x, y + 64, true, undefined, this.tilemapLayers.get('floor'));
    }

    public getFloorTileAt(x: number, y: number): Phaser.Tilemaps.Tile | null {
        return this.map.getTileAt(x, y, true, this.tilemapLayers.get('floor'));
    }

    public getFloorTileIndexAtWorldXY(x: number, y: number): { x: number; y: number } | undefined {
        const tile = this.getFloorTileAtWorldXY(x, y);
        if (tile) {
            return { x: tile?.x, y: tile?.y };
        }
        return;
    }

    public getDimensionsInTiles(): { width : number; height: number } {
        return { width: this.map.width, height: this.map.height };
    }

    public getTileDimensions(): { width: number, height: number } {
        return { width: this.map.tileWidth, height: this.map.tileHeight };
    }

    public getCollisionGrid(): number[][] {
        return this.collisionGrid;
    }

    public isColliding(x: number, y: number): boolean {
        const coords = this.getFloorTileIndexAtWorldXY(x, y);
        if (coords === undefined) {
            return true;
        }
        if (coords.x >= this.map.width || coords.y >= this.map.height) {
            return true;
        }
        return this.collisionGrid[coords.y][coords.x] === 0 ? false : true;
    }

    public updateCollisionGrid(x: number, y: number, collides: boolean): void {
        if (x >= this.map.width || y >= this.map.height) {
            console.warn('COLLISION GRID TILE OUT OF BOUNDS');
            return;
        }
        this.collisionGrid[y][x] = collides ? 1 : 0;
    }

    private initializeMap(mapKey: string): void {
        this.map = this.scene.add.tilemap(mapKey);
        this.tilesets = new Map<string, Phaser.Tilemaps.Tileset>();
        this.tilemapLayers = new Map<string, Phaser.Tilemaps.TilemapLayer>();

        const floorBrick = this.map.addTilesetImage('floorBrick', 'floorBrick');

        this.tilesets.set('floorBrick', floorBrick);
        
        if (floorBrick) {
            this.tilemapLayers.set('floor', this.map.createLayer('floor', [ floorBrick ])?.setCullPadding(4, 4));
        }
    }

    private initializeWallGrid(): void {
        this.wallGrid = new Array<number[]>(this.map.height);
        for (let j = 0; j < this.map.height; j += 1) {
            this.wallGrid[j] = new Array<number>(this.map.width).fill(0);
        }
    }

    private initializeCollisionGrid(): void {
        const floorLayer = this.map.getLayer('floor');
        this.collisionGrid = floorLayer?.data.map((row) => row.map((tile) => tile.index === -1 ? 1 : 0)) ?? [];
    }
}
