import { KeyFrame } from '@home-based-studio/phaser3-utils';
import { ThinWall } from '../../../GameObjects/GameScene/ThinWall';
import { TileEdge } from '../../../GameObjects/GameScene/Tile';
import { MathHelper } from '../../Helpers/MathHelper';
import { MapManager, MapManagerEvent } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';
import { GlobalConfig } from '../../../GlobalConfig';
import { ToolMode } from '../MapEditor';

export class ThinWallEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private mode: ToolMode;
    private selectedTextureNumber: number;

    private wallPreview: Phaser.GameObjects.Image[];
    private previewEdge: TileEdge;
    private placementShapeStart?: { x: number, y: number };
    private placementShapeEnd?: { x: number, y: number };
    private shapeChunkCoordsAndEdges: { coords: { x: number, y: number }, edge: TileEdge }[];

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();
        this.scene = scene;
        this.mapManager = mapManager;

        this.wallPreview = [];
        this.previewEdge = TileEdge.N;
        this.selectedTextureNumber = 0;
        this.shapeChunkCoordsAndEdges = [];

        this.active = false;

        this.bindEventHandlers();
    }

    public isActive(): boolean {
        return this.active;
    }

    public activate(): void {
        this.active = true;
        this.setMode(ToolMode.Placing);
        this.createChunkPreviewIfNeeded();
    }

    public clear(): void {
        this.active = false;
        // TODO: Objects Pool
        this.wallPreview.forEach(chunk => chunk.destroy());
        this.wallPreview = [];
        this.placementShapeStart = undefined;
        this.placementShapeEnd = undefined;
        this.mapManager.getAllWalls().forEach(wall => wall.clearTint());
    }

    public handleKeyDownEvent(key: string): void {
        switch (key) {
            case 'q': {
                this.setMode(ToolMode.Placing);
                break;
            }
            case 'w': {
                this.setMode(ToolMode.Deleting);
                break;
            }
            case 'e': {
                this.nextTexture();
                this.createChunkPreviewIfNeeded();
                break;
            }
            case 'r': {
                this.previewEdge = this.previewEdge === TileEdge.N ? TileEdge.W : TileEdge.N;
                this.createChunkPreviewIfNeeded();
                break;
            }
        }
    }

    private setMode(mode: ToolMode): void {
        if (this.mode === mode) {
            return;
        }
        this.mode = mode;
        switch (mode) {
            case ToolMode.Placing: {
                this.mapManager.getAllThinWalls().forEach(wall => wall.clearTint());
                this.createChunkPreviewIfNeeded();
                break;
            }
            case ToolMode.Deleting: {
                this.wallPreview.forEach(wallChunk => wallChunk.destroy());
                this.wallPreview = [];
                this.placementShapeStart = undefined;
                this.placementShapeEnd = undefined;
                break;
            }
        }
    }

    private bindEventHandlers(): void {
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!this.active || this.mode !== ToolMode.Placing) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            const position = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
            if (!this.placementShapeStart) {
                const offset = this.getOffset(this.previewEdge);
                this.wallPreview[0].x = position.x + offset.x;
                this.wallPreview[0].y = position.y - offset.y;
            } else {
                this.placementShapeEnd = coords;
                if (this.placementShapeStart && this.placementShapeEnd) {
                    this.shapeChunkCoordsAndEdges = this.getShapeChunkCoordsAndEdge(this.placementShapeStart, this.placementShapeEnd);

                    // TODO: Objects Pool
                    this.wallPreview.forEach(wallChunk => wallChunk.destroy());
                    this.wallPreview = [];

                    for (const chunkData of this.shapeChunkCoordsAndEdges) {
                        const chunkPos = MathHelper.cartesianToIsometric({ x: chunkData.coords.x * 64, y: chunkData.coords.y * 64 });
                        const keyFrame = this.getPreviewTexture(chunkData.edge);
                        const offset = this.getOffset(this.previewEdge);
                        this.wallPreview.push(this.scene.add.image(
                            chunkPos.x + offset.x,
                            chunkPos.y - offset.y,
                            keyFrame.key,
                            keyFrame.frame,
                        )
                            .setOrigin(0.5, 0.5)
                            .setAlpha(0.5)
                            .setDepth(1000 + pointer.y),
                        );
                    }
                }
            }

            this.mapManager.on(MapManagerEvent.WallPointedOver, (wall: ThinWall) => {
                if (!this.active || this.mode !== ToolMode.Deleting) {
                    return;
                }
                wall.setTint(0xff0000);
            });

            this.mapManager.on(MapManagerEvent.WallPointedOut, (wall: ThinWall) => {
                if (!this.active || this.mode !== ToolMode.Deleting) {
                    return;
                }
                wall.clearTint();
            });

            this.mapManager.on(MapManagerEvent.WallPressedDown, (wall: ThinWall) => {
                if (!this.active || this.mode !== ToolMode.Deleting) {
                    return;
                }
                this.mapManager.removeThinWall(wall);
            });
        });
        
        this.scene.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== ToolMode.Placing) {
                return;
            }
            if (pointer.rightButtonReleased()) {
                return;
            }
            if (this.placementShapeStart) {
                this.wallPreview.forEach(wallChunk => wallChunk.destroy());
                this.wallPreview = [];
                this.createChunkPreviewIfNeeded();
                
                if (this.shapeChunkCoordsAndEdges.length === 0) {
                    this.mapManager.placeThinWall(this.placementShapeStart, this.previewEdge, this.selectedTextureNumber);
                } else {
                    for (const chunkData of this.shapeChunkCoordsAndEdges) {
                        this.mapManager.placeThinWall(chunkData.coords, chunkData.edge, this.selectedTextureNumber);
                    }
                }
                this.placementShapeStart = undefined;
                this.placementShapeEnd = undefined;
                this.shapeChunkCoordsAndEdges = [];
            }
        });

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== ToolMode.Placing) {
                return;
            }
            if (pointer.rightButtonDown()) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (coords === undefined) {
                return;
            }
            this.placementShapeStart = coords;
            console.log(`start shape at: ${this.placementShapeStart?.x}, ${this.placementShapeStart?.y}`);
        });
    }

    private getShapeChunkCoordsAndEdge(
        from: { x: number, y: number },
        to: { x: number, y: number },
    ): { coords: { x: number, y: number }, edge: TileEdge }[] {

        const start = { x: Math.min(from.x, to.x), y: Math.min(from.y, to.y) };
        const end = { x: Math.max(from.x, to.x), y: Math.max(from.y, to.y) };
        const positions: { coords: { x: number, y: number }, edge: TileEdge }[] = [];
        // horizontal walls
        for (let x = start.x; x < end.x; x++) {
            positions.push({ coords: { x: x, y: start.y }, edge: TileEdge.N });
            // skip checking for second edge if we are placing a line
            if (start.y === end.y) {
                continue;
            }
            positions.push({ coords: { x: x, y: end.y }, edge: TileEdge.N });
        }
        // vertical walls
        // this time we are not skipping the edges as one Tile can have two walls attached to it
        for (let y = start.y + 0; y < end.y; y++) {
            positions.push({ coords: { x: start.x, y: y }, edge: TileEdge.W });
            // skip checking for second edge if we are placing a line
            if (start.x === end.x) {
                continue;
            }
            positions.push({ coords: { x: end.x, y: y }, edge: TileEdge.W });
        }

        return positions;
    }

    private createChunkPreviewIfNeeded(): void {
        const oldPosition = this.wallPreview[0] ? { x: this.wallPreview[0].x, y: this.wallPreview[0].y } : undefined;
        this.wallPreview[0]?.destroy();
        this.wallPreview = [];

        const keyFrame = this.getPreviewTexture(this.previewEdge);
        const pointer = this.scene.input.activePointer;
        const position = oldPosition ?? { x: pointer.x, y: pointer.y };
        this.wallPreview.push(this.scene.add.image(position.x, position.y, keyFrame.key, keyFrame.frame)
            .setOrigin(0.5, 0.5)
            .setAlpha(0.85)
            .setDepth(1000 + pointer.y),
        );
    }

    private getPreviewTexture(edge: TileEdge, short: boolean = false): KeyFrame {
        return {
            key: 'thinWall',
            frame: `${short ? 'short' : 'normal'}/${edge === TileEdge.N ? 'N' : 'W'}/${this.selectedTextureNumber}`,
        };
    }

    private nextTexture(): void {
        this.selectedTextureNumber = ((this.selectedTextureNumber += 1) % GlobalConfig.THIN_WALLS_COUNT);
    }

    private getOffset(edge: TileEdge): { x: number, y: number} {
        switch (edge) {
            case TileEdge.N: {
                return {
                    x: 96,
                    y: 48,
                };
            }
            case TileEdge.W: {
                return {
                    x: 32,
                    y: 48,
                };
            }
        }
    }
}
