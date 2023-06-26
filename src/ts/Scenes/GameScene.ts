import { SceneTemplate } from './SceneTemplate';
import { MyScene } from '../Utils/Helpers/ScenesHelper';
import { GlobalConfig } from '../GlobalConfig';
import { Character, Direction } from '../GameObjects/GameScene/Character';
import { PathfindingManager } from '../Utils/PathfindingManager';
import { Wall } from '../GameObjects/GameScene/Wall';
import { MapManager } from '../Utils/MapManager';

export class GameScene extends SceneTemplate {

    private pathFindingManager: PathfindingManager;
    private graphics: Phaser.GameObjects.Graphics;

    private player: Character;

    private timer: number;

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private mapManager: MapManager;

    constructor() {
        super(MyScene.Game);
    }

    public preload(): void {
        super.preload();
    }

    public create(): void {
        this.graphics = this.add.graphics().setDepth(500);
        this.timer = 0;
        this.cursors = this.input.keyboard?.createCursorKeys();

        this.mapManager = new MapManager(this, 'map');

        this.pathFindingManager = new PathfindingManager(
            this,
            this.mapManager.getCollisionGrid(),
            this.mapManager.getTileDimensions(),
        );

        const mapDimensions = this.mapManager.getDimensionsInTiles();
        const spawnTileCoords = { x: Math.floor(mapDimensions.width / 2), y: Math.floor(mapDimensions.height / 2) };
        const spawnTile = this.mapManager.getFloorTileAt(spawnTileCoords.x, spawnTileCoords.y);
        this.player = new Character(this, spawnTile?.pixelX ?? 100, spawnTile?.pixelY ?? 100, 10);
        this.cameras.main.startFollow(this.player);

        this.bindEventHandlers();
        this.bindSceneEventHandlers();
    }

    public update(time: number, dt: number): void {
        this.timer += dt;
        while (this.timer > GlobalConfig.TICK_DURATION) {
            this.handleCursorsInput();
            this.player.update(time, dt);
            this.timer -= GlobalConfig.TICK_DURATION;
        }
        this.graphics.clear();
        this.graphics.fillStyle(0xff0000).fillCircle(this.player.x, this.player.y, 5);
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
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const tile = this.mapManager.getFloorTileAtWorldXY(pointer.worldX, pointer.worldY);
            if (tile) {
                // tile.tint = 0xff0000;
            }
        });
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (coords === undefined) {
                return;
            }
            if (pointer.rightButtonDown()) {
                this.moveTo(coords);
            } else {
                new Wall(this, coords);
            }
        });
    }

    private bindSceneEventHandlers(): void {
        this.events.once('shutdown', () => {
        });
    }

    private moveTo(destination: { x: number; y: number }) {
        const playerPosition = this.mapManager.getFloorTileIndexAtWorldXY(this.player.x, this.player.y);
        if (playerPosition === undefined) {
            return;
        }
        this.pathFindingManager
            .findPath(playerPosition, destination, false)
            .then((path) => {
                path.shift(); // get rid of the tile that player is already standing on.
                if (path && path.length > 0) {
                    this.player.setPathToFollow(this.mapPathToPixels(path, 0, 32)).catch((reason) => console.warn(reason));
                }
            })
            .catch((reason) => console.warn(reason));
    }

    private mapPathToPixels(path: { x: number, y: number }[], xOffset = 0, yOffset = 0): { x: number, y: number }[] {
        return path.map((coords) => {
            const tile = this.mapManager.getFloorTileAt(coords.x, coords.y);
            return { x: (tile?.pixelX ?? 0) + xOffset, y: (tile?.pixelY  ?? 0) + yOffset };
        });
    }
}
