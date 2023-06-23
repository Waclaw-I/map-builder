import { SceneTemplate } from './SceneTemplate';
import { MyScene } from '../Utils/Helpers/ScenesHelper';
import { GlobalConfig } from '../GlobalConfig';
import { Character, Direction } from '../GameObjects/GameScene/Character';
import { PathfindingManager } from '../Utils/PathfindingManager';

export class GameScene extends SceneTemplate {

    private pathFindingManager: PathfindingManager;
    private graphics: Phaser.GameObjects.Graphics;

    private player: Character;

    private timer: number;

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private map: Phaser.Tilemaps.Tilemap;
    private tilemapLayers: Map<string, Phaser.Tilemaps.TilemapLayer | undefined>;

    constructor() {
        super(MyScene.Game);
    }

    public preload(): void {
        super.preload();
    }

    public create(): void {
        this.add.graphics().fillStyle(0xff0000).fillCircle(0, 0, 50);
        this.timer = 0;
        this.cursors = this.input.keyboard?.createCursorKeys();

        this.map = this.add.tilemap('map', 256, 128);
        this.tilemapLayers = new Map<string, Phaser.Tilemaps.TilemapLayer>();

        const solidWall = this.map.addTilesetImage('solidWall', 'solidWall');
        const floor = this.map.addTilesetImage('floor', 'floor');

        if (floor && solidWall) {
            this.tilemapLayers.set('floor', this.map.createLayer('floor', [ floor ])?.setCullPadding(4, 4));
            this.tilemapLayers.set('wall', this.map.createLayer('wall', [ solidWall ])?.setCullPadding(4, 4));
        }

        const wallLayer = this.map.getLayer('wall');
        const wallCollisionGrid = wallLayer?.data.map((row) => row.map((tile) => tile.index === -1 ? 0 : 1)) ?? [];

        this.pathFindingManager = new PathfindingManager(
            this,
            wallCollisionGrid,
            { width: this.map.tileWidth, height: this.map.tileHeight },
        );

        this.player = new Character(this, 0, 0, 10);
        this.cameras.main.startFollow(this.player);

        this.bindEventHandlers();
        this.bindSceneEventHandlers();

        console.log(this.tilemapLayers.get('floor'));
    }

    public update(time: number, dt: number): void {
        this.timer += dt;
        while (this.timer > GlobalConfig.TICK_DURATION) {
            this.handleCursorsInput();
            this.player.update(time, dt);
            this.timer -= GlobalConfig.TICK_DURATION;
        }
    }

    private handleCursorsInput() {
        let moveDirection: Direction | undefined = undefined;
        if (this.cursors?.up.isDown) {
            moveDirection = Direction.N;
            if (this.cursors?.left.isDown) {
                moveDirection = Direction.NW;
            }
            if (this.cursors?.right.isDown) {
                moveDirection = Direction.NE;
            }
        } else if (this.cursors?.down.isDown) {
            moveDirection = Direction.S;
            if (this.cursors?.left.isDown) {
                moveDirection = Direction.SW;
            }
            if (this.cursors?.right.isDown) {
                moveDirection = Direction.SE;
            }
        } else if (this.cursors?.left.isDown) {
            moveDirection = Direction.W;
        } else if (this.cursors?.right.isDown) {
            moveDirection = Direction.E;
        }
        if (moveDirection !== undefined) {
            this.player.move(moveDirection);
        } else {
            this.player.stopRunning();
        }
    }

    private handleScrollWheel(dy: number): void {
        const currentZoom = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(currentZoom + 0.1 * (dy < 0 ? 1 : -1), GlobalConfig.MIN_ZOOM, GlobalConfig.MAX_ZOOM));
    }

    private bindEventHandlers(): void {
        this.input.on(Phaser.Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], dx: number, dy: number) => {
            this.handleScrollWheel(dy);
        });
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            // if (pointer.worldX < 0 || pointer.worldY < 0) {
            //     return;
            // }
            console.log(this.map.getTileAtWorldXY(pointer.worldX, pointer.worldY, true, this.cameras.main, this.tilemapLayers.get('floor')));
            this.moveTo(this.getTileIndexAt(pointer.worldX, pointer.worldY));
        });
    }

    private bindSceneEventHandlers(): void {
        this.events.once('shutdown', () => {
        });
    }

    private moveTo(position: { x: number; y: number }) {
        this.pathFindingManager
            .findPath(this.getTileIndexAt(this.player.x, this.player.y), position, false)
            .then((path) => {
                path.shift(); // get rid of the tile that player is already standing on.
                console.log(structuredClone(path));
                console.log(this.mapPathToPixels(path));
                if (path && path.length > 0) {
                    this.player.setPathToFollow(this.mapPathToPixels(path)).catch((reason) => console.warn(reason));
                }
            })
            .catch((reason) => console.warn(reason));
    }

    private mapPathToPixels(path: { x: number, y: number }[]): { x: number, y: number }[] {
        return path.map((coords) => {
            const tile = this.getTileAtIndex(coords.x, coords.y);
            return { x: tile?.pixelX ?? 0, y: tile?.pixelY ?? 0 };
        });
    }

    private getTileAtIndex(x: number, y: number): Phaser.Tilemaps.Tile | null {
        const tile = this.map.getTileAt(x, y, true, this.tilemapLayers.get('floor'));
        return tile;
    }

    private getTileIndexAt(x: number, y: number): { x: number; y: number } {
        const tile = this.map.getTileAtWorldXY(x, y, true, this.cameras.main, this.tilemapLayers.get('floor'));
        return { x: tile?.x ?? 0, y: tile?.y ?? 0 };
    }
}
