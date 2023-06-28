import { ThinWall } from '../GameObjects/GameScene/ThinWall';
import { Tile, TileEdge } from '../GameObjects/GameScene/Tile';
import { Wall } from '../GameObjects/GameScene/Wall';

export enum MapManagerEvent {
    CollisionGridUpdated = 'CollisionGridUpdated',
    WallPointedOver = 'WallPointedOver',
    WallPointedOut = 'WallPointedOut',
    WallPressedDown = 'WallPressedDown',
}

// NOTE: This could be improved by switching to rxjs. Phaser Events system does not support types for passing data.
export interface CollisionGridUpdatedEventData {
    coords: { x: number, y: number };
    collides: boolean;
}
export class MapManager extends Phaser.Events.EventEmitter {

    private scene: Phaser.Scene;

    private map: Phaser.Tilemaps.Tilemap;
    private tilesets: Map<string, Phaser.Tilemaps.Tileset | null>;
    private tilemapLayers: Map<string, Phaser.Tilemaps.TilemapLayer | undefined>;

    private walls: (Wall | undefined)[][];
    private wallArray: Wall[];
    private collisionGrid: number[][];

    private wallsHidden: boolean;

    private thinWallTilesMap: Tile[][];
    // Each tile can have two walls, on N and W side.
    private thinWalls: Record<TileEdge, ThinWall | undefined>[][];
    private thinWallsArray: ThinWall[];

    constructor(scene: Phaser.Scene, mapKey: string) {
        super();

        this.scene = scene;

        this.wallsHidden = false;

        this.initializeMap(mapKey);
        this.initializeThinWallMap();
        this.initializeThinWalls();
        this.initializeWalls();
        this.initializeCollisionGrid();


        new ThinWall(this.scene, { x: 0, y: 0}, TileEdge.N);
        // new ThinWall(this.scene, { x: 0, y: 0}, TileEdge.W);
        // new ThinWall(this.scene, { x: 1, y: 0}, TileEdge.N);
        // new ThinWall(this.scene, { x: 2, y: 0}, TileEdge.N);
    }

    public placeThinWall(coords: { x: number, y: number }, edge: TileEdge): void {
        const wall = new ThinWall(this.scene, coords, edge);
        wall.place();
        this.thinWallTilesMap[coords.y][coords.x]?.setEdge(edge, true);
        const spot = this.thinWalls[coords.y][coords.x][edge];
        if (spot !== undefined) {
            this.removeThinWall(spot);
        }
        this.thinWalls[coords.y][coords.x][edge] = wall;
        this.thinWallsArray.push(wall);
        // this.updateCollisionGrid(coords.x, coords.y, true);

        // this.bindWallEventHandlers(wall);
    }

    public placeWall(coords: { x: number, y: number}): void {
        const wall = new Wall(this.scene, coords, this.wallsHidden);
        wall.place();
        const spot = this.walls[coords.y][coords.x];
        if (spot !== undefined) {
            this.removeWall(spot);
        }
        this.walls[coords.y][coords.x] = wall;
        this.wallArray.push(wall);
        this.updateCollisionGrid(coords.x, coords.y, true);

        this.bindWallEventHandlers(wall);
    }

    public removeWall(wall: Wall): boolean {

        const index = this.wallArray.indexOf(wall);
        if (index !== -1) {
            this.wallArray.splice(index, 1);
        }

        const coords = wall.getCoords();
        this.updateCollisionGrid(coords.x, coords.y, false);
        this.walls[coords.y][coords.x]?.destroy();
        this.walls[coords.y][coords.x] = undefined;
        return true;
    }

    public removeThinWall(wall: ThinWall): boolean {

        const index = this.thinWallsArray.indexOf(wall);
        if (index !== -1) {
            this.wallArray.splice(index, 1);
        }

        const coords = wall.getCoords();
        const edge = wall.getEdge();
        // this.updateCollisionGrid(coords.x, coords.y, false);
        this.thinWalls[coords.y][coords.x][edge]?.destroy();
        this.thinWalls[coords.y][coords.x][edge] = undefined;
        return true;
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

    public isCollidingWithThinWalls(currentX: number, currentY: number, nextX: number, nextY: number): boolean {
        const nextCoords = this.getFloorTileIndexAtWorldXY(nextX, nextY);
        if (nextCoords === undefined) {
            return true;
        }
        if (nextCoords.x >= this.map.width || nextCoords.y >= this.map.height) {
            return true;
        }
        const currentCoords = this.getFloorTileIndexAtWorldXY(currentX, currentY);

        if (currentCoords === undefined) {
            return false;
        }

        console.log(currentCoords, nextCoords);

        // this way we can check if our next movement is crossing the tiles so we can look out for the wall

        // 0 - same tile, 1 - E, -1 - W
        const directionX = currentCoords.x - nextCoords.x;
        // 0 - same tile, 1 - N, -1 - S
        const directionY = currentCoords.y - nextCoords.y;


        if (directionX === 0 && directionY === 0) {
            return false;
        }
        const tile = this.thinWallTilesMap[currentCoords.y][currentCoords.x];
        const nextTile = this.thinWallTilesMap[nextCoords.y][nextCoords.x];
        // W    N
        if (directionX === -1 || directionY === 1) {
            if (directionX === -1 && nextTile.getEdge(TileEdge.W)) {
                console.log('BLOCKED');
                return true;
            }
            if (directionY === 1 && tile.getEdge(TileEdge.N)) {
                console.log('BLOCKED');
                return true;
            }
        }

        // for this coordinates we need to check walls of our destination tile
        // E    S
        if (directionX === 1 || directionY === -1) {
            if (directionX === 1 && tile.getEdge(TileEdge.W)) {
                console.log('BLOCKED');
                return true;
            }
            if (directionY === -1 && nextTile.getEdge(TileEdge.N)) {
                console.log('BLOCKED');
                return true;
            }
        }

        return false;
        // return this.collisionGrid[nextCoords.y][nextCoords.x] === 0 ? false : true;
    }

    public updateCollisionGrid(x: number, y: number, collides: boolean): void {
        if (x >= this.map.width || y >= this.map.height) {
            console.warn('COLLISION GRID TILE OUT OF BOUNDS');
            return;
        }
        this.collisionGrid[y][x] = collides ? 1 : 0;
        this.emit(MapManagerEvent.CollisionGridUpdated, { coords: { x, y }, collides } as CollisionGridUpdatedEventData);
    }

    public getAllWalls(): Wall[] {
        return this.wallArray;
    }

    public getAllThinWalls(): ThinWall[] {
        return this.thinWallsArray;
    }

    public switchHideWalls(): void {
        this.wallsHidden = !this.wallsHidden;
        this.wallArray.forEach(wall => wall.hide(this.wallsHidden));
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

    private initializeThinWallMap(): void {
        this.thinWallTilesMap = [];
        for (let y = 0; y < this.map.height; y++) {
            this.thinWallTilesMap.push([]);
            for (let x = 0; x < this.map.width; x++) {
                this.thinWallTilesMap[y].push(new Tile(x, y));
            }
        }
    }

    private initializeThinWalls(): void {
        this.thinWallsArray = [];
        const floorLayer = this.map.getLayer('floor');
        this.thinWalls = floorLayer?.data.map((row) => row.map(() => { return {[TileEdge.N]: undefined, [TileEdge.W]: undefined}; })) ?? [];
    }

    private initializeWalls(): void {
        this.wallArray = [];
        const floorLayer = this.map.getLayer('floor');
        this.walls = floorLayer?.data.map((row) => row.map(() => undefined)) ?? [];
    }

    private initializeCollisionGrid(): void {
        const floorLayer = this.map.getLayer('floor');
        this.collisionGrid = floorLayer?.data.map((row) => row.map((tile) => tile.index === -1 ? 1 : 0)) ?? [];
    }

    private bindWallEventHandlers(wall: Wall): void {
        wall.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.emit(MapManagerEvent.WallPointedOver, wall);
        });
        wall.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.emit(MapManagerEvent.WallPointedOut, wall);
        });
        wall.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.emit(MapManagerEvent.WallPressedDown, wall);
            }
        });
    }
}
