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

    constructor(scene: Phaser.Scene, mapKey: string) {
        super();

        this.scene = scene;

        this.wallsHidden = false;

        this.initializeMap(mapKey);
        this.initializeWalls();
        this.initializeCollisionGrid();
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
        this.emit(MapManagerEvent.CollisionGridUpdated, { coords: { x, y }, collides } as CollisionGridUpdatedEventData);
    }

    public getAllWalls(): Wall[] {
        return this.wallArray;
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
        wall.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.emit(MapManagerEvent.WallPressedDown, wall);
        });
    }
}
