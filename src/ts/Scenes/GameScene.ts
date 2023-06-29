import { SceneTemplate } from './SceneTemplate';
import { MyScene, ScenesHelper } from '../Utils/Helpers/ScenesHelper';
import { GlobalConfig } from '../GlobalConfig';
import { Character, Direction } from '../GameObjects/GameScene/Character';
import { TilesGridUpdatedEventData, MapManager, MapManagerEvent } from '../Utils/MapManager';
import { CartesianMapProjection } from '../Utils/CartesianMapProjection';
import { EventsHelper } from '../Utils/Helpers/EventsHelper';
import { MapEditor } from '../Utils/MapEditor/MapEditor';
import { AStar } from '../Utils/AStar/AStar';
import { ScaleHelper } from '../Utils/Helpers/ScaleHelper';
import { Helper } from '../Utils/Helpers/Helper';

export class GameScene extends SceneTemplate {

    private graphics: Phaser.GameObjects.Graphics;

    private player: Character;

    private timer: number;

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private mapManager: MapManager;
    private mapEditor: MapEditor;
    private mapProjection: CartesianMapProjection;

    private draggingCamera: boolean;
    private lastCameraDragPosition: { x: number, y: number };

    constructor() {
        super(MyScene.Game);
    }

    public preload(): void {
        super.preload();
    }

    public create(): void {
        this.timer = 0;
        this.cursors = this.input.keyboard?.createCursorKeys();

        this.draggingCamera = false;

        // TODO: ZOD would be nice here to check if data from JSON is in correct format.
        this.mapManager = new MapManager(this, 'map');
        this.mapEditor = new MapEditor(this, this.mapManager);
        this.mapProjection = new CartesianMapProjection(
            // NOTE: We pass in UI SCENE, not GAME SCENE. This way we can have our cartesian projection always on top, immovable
            ScenesHelper.getScene(MyScene.UiScene),
            16,
            16,
            {
                mapWidth: this.mapManager.getDimensionsInTiles().width,
                mapHeight: this.mapManager.getDimensionsInTiles().height,
                tileWidth: this.mapManager.getTileDimensions().width,
                tileHeight: this.mapManager.getTileDimensions().height,
            },
        )
            .setAlpha(0.5);

        const mapDimensions = this.mapManager.getDimensionsInTiles();
        const spawnTileCoords = { x: Math.floor(mapDimensions.width / 2), y: Math.floor(mapDimensions.height / 2) };
        const spawnTile = this.mapManager.getFloorTileAt(spawnTileCoords.x, spawnTileCoords.y);
        this.player = new Character(this, spawnTile?.pixelX ?? 100, spawnTile?.pixelY ?? 100, 10);
        this.cameras.main.startFollow(this.player);

        this.bindEventHandlers();
        this.bindSceneEventHandlers();
        this.bindGlobalEventHandlers();

        // one manual resize event to make sure our canvas is streched as far as possible
        ScaleHelper.updateWorldDimensions(this.game.scale);
        ScenesHelper.resizeScenes(Helper.gameRatio());
    }

    public update(time: number, dt: number): void {
        this.timer += dt;
        while (this.timer > GlobalConfig.TICK_DURATION) {
            this.handleCursorsInput();
            this.player.update(time, dt);
            this.mapProjection.updatePlayerPosition(this.player.x, this.player.y);
            this.timer -= GlobalConfig.TICK_DURATION;
        }
    }

    // TODO: ADD THIS TO THE REGISTRY, DECOUPLE MAP MANAGER FROM THE SCENE ENTIRELY, DIVIDE INTO LOGIC AND RENDER
    public getMapManager(): MapManager {
        return this.mapManager;
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
            this.player.move(moveDirection, this.mapManager);
        } else {
            this.player.stopRunningManually();
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
            if (this.gamestate.isMapEditorOn()) {
                if (!this.draggingCamera) {
                    return;
                }
                const dx = this.lastCameraDragPosition.x - pointer.x;
                const dy = this.lastCameraDragPosition.y - pointer.y;
                if (this.gamestate.isMapEditorOn()) {
                    this.cameras.main.scrollX += dx;
                    this.cameras.main.scrollY += dy;
                }
                this.lastCameraDragPosition = { x: pointer.x, y: pointer.y };
            }

        });
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (this.gamestate.isMapEditorOn() && pointer.rightButtonDown()) {
                this.draggingCamera = true;
                this.lastCameraDragPosition = { x: pointer.x, y: pointer.y};
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (coords === undefined) {
                return;
            }
            if (pointer.rightButtonDown()) {
                this.moveTo(coords);
                return;
            }
        });

        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            this.draggingCamera = false;
        });

        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            switch (key) {
                case 'e': {
                    this.gamestate.turnMapEditorOn(!this.gamestate.isMapEditorOn());
                    break;
                }
                case 'h': {
                    this.mapManager.switchHideWalls();
                    break;
                }
                case 'm': {
                    this.mapProjection.setVisible(!this.mapProjection.visible);
                    break;
                }
            }
            if (this.gamestate.isMapEditorOn()) {
                this.mapEditor.handleKeyDownEvent(key);
            }
        });

        this.mapManager.on(MapManagerEvent.CollisionGridUpdated, (data: TilesGridUpdatedEventData) => {
            this.mapProjection.setCollision(data.coords.x, data.coords.y, data.collides);
        });
    }

    private bindSceneEventHandlers(): void {
        this.events.once('shutdown', () => {
        });
    }

    private bindGlobalEventHandlers(): void {
        this.globalEvents.on(EventsHelper.events.mapEditor.switched, (on: boolean) => {
            if (on) {
                this.cameras.main.stopFollow();
                this.player.setAlpha(0.5);
            } else {
                this.cameras.main.startFollow(this.player);
                this.player.setAlpha(1);
                this.mapEditor.clear();
            }
        });
    }

    private moveTo(destination: { x: number; y: number }) {
        const playerPosition = this.mapManager.getFloorTileIndexAtWorldXY(this.player.x, this.player.y);
        if (playerPosition === undefined) {
            return;
        }
        const path = AStar(playerPosition, destination, this.mapManager.getTiles());
        if (path) {
            this.player.setPathToFollow(this.mapPathToPixels(path, 0, 32)).catch((reason) => console.warn(reason));
        }
    }

    private mapPathToPixels(path: { x: number, y: number }[], xOffset = 0, yOffset = 0): { x: number, y: number }[] {
        return path.map((coords) => {
            const tile = this.mapManager.getFloorTileAt(coords.x, coords.y);
            return { x: (tile?.pixelX ?? 0) + xOffset, y: (tile?.pixelY  ?? 0) + yOffset };
        });
    }
}
