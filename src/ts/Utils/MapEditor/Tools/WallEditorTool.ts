import { Wall } from '../../../GameObjects/GameScene/Wall';
import { MathHelper } from '../../Helpers/MathHelper';
import { MapManager, MapManagerEvent } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';

export enum WallEditorToolMode {
    Placing,
    Deleting,
}

export class WallEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private wallPreview: Phaser.GameObjects.Image[];

    private mode: WallEditorToolMode;

    private placementShapeStart?: { x: number, y: number };
    private placementShapeEnd?: { x: number, y: number };
    private shapeChunkCoords: { x: number, y: number }[];

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();
        this.scene = scene;
        this.mapManager = mapManager;

        this.wallPreview = [];
        this.shapeChunkCoords = [];

        this.active = false;

        this.bindEventHandlers();
    }

    public isActive(): boolean {
        return this.active;
    }

    public activate(): void {
        this.active = true;
        this.setMode(WallEditorToolMode.Placing);
        this.createChunkPreviewIfNeeded();
    }

    public clear(): void {
        this.active = false;
        this.wallPreview.forEach(chunk => chunk.destroy());
        this.wallPreview = [];
        this.placementShapeStart = undefined;
        this.placementShapeEnd = undefined;
        this.mapManager.getAllWalls().forEach(wall => wall.clearTint());
    }

    public handleKeyDownEvent(key: string): void {
        switch (key) {
            case 'q': {
                this.setMode(WallEditorToolMode.Placing);
                break;
            }
            case 'w': {
                this.setMode(WallEditorToolMode.Deleting);
                break;
            }
        }
    }

    private setMode(mode: WallEditorToolMode): void {
        if (this.mode === mode) {
            return;
        }
        this.mode = mode;
        switch (mode) {
            case WallEditorToolMode.Placing: {
                console.log('PLACING MODE');
                this.mapManager.getAllWalls().forEach(wall => wall.clearTint());
                this.createChunkPreviewIfNeeded();
                break;
            }
            case WallEditorToolMode.Deleting: {
                console.log('DELETE MODE');
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
            if (!this.active) {
                return;
            }
            if (this.mode !== WallEditorToolMode.Placing) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            const position = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
            if (!this.placementShapeStart) {
                this.wallPreview[0].x = position.x + 64;
                this.wallPreview[0].y = position.y - 24;
            } else {
                this.placementShapeEnd = coords;
                if (this.placementShapeStart && this.placementShapeEnd) {
                    this.shapeChunkCoords = this.getShapeChunkCoords(this.placementShapeStart, this.placementShapeEnd);

                    // it would be a nice place to use Object Pool.
                    this.wallPreview.forEach(wallChunk => wallChunk.destroy());
                    this.wallPreview = [];

                    for (const chunkCoords of this.shapeChunkCoords) {
                        const chunkPos = MathHelper.cartesianToIsometric({ x: chunkCoords.x * 64, y: chunkCoords.y * 64 });
                        this.wallPreview.push(this.scene.add.image(
                            chunkPos.x + 64,
                            chunkPos.y - 24,
                            'grayWall',
                        )
                            .setOrigin(0.5, 0.5)
                            .setAlpha(0.5)
                            .setDepth(1000 + pointer.y),
                        );
                    }
                }
            }

            this.mapManager.on(MapManagerEvent.WallPointedOver, (wall: Wall) => {
                if (!this.active || this.mode !== WallEditorToolMode.Deleting) {
                    return;
                }
                wall.setTint(0xff0000);
            });

            this.mapManager.on(MapManagerEvent.WallPointedOut, (wall: Wall) => {
                if (!this.active || this.mode !== WallEditorToolMode.Deleting) {
                    return;
                }
                wall.clearTint();
            });

            this.mapManager.on(MapManagerEvent.WallPressedDown, (wall: Wall) => {
                if (!this.active || this.mode !== WallEditorToolMode.Deleting) {
                    return;
                }
                this.mapManager.removeWall(wall);
            });
        });
        
        this.scene.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== WallEditorToolMode.Placing) {
                return;
            }
            if (pointer.rightButtonReleased()) {
                return;
            }
            if (this.placementShapeStart) {
                this.wallPreview.forEach(wallChunk => wallChunk.destroy());
                this.wallPreview = [];
                this.createChunkPreviewIfNeeded();
                
                if (this.shapeChunkCoords.length === 0) {
                    this.mapManager.placeWall(this.placementShapeStart);
                } else {
                    for (const coords of this.shapeChunkCoords) {
                        this.mapManager.placeWall(coords);
                    }
                }
                this.placementShapeStart = undefined;
                this.placementShapeEnd = undefined;
                this.shapeChunkCoords = [];
            }
        });

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== WallEditorToolMode.Placing) {
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

    private getShapeChunkCoords(from: { x: number, y: number }, to: { x: number, y: number }): { x: number, y: number }[] {
        const start = { x: Math.min(from.x, to.x), y: Math.min(from.y, to.y) };
        const end = { x: Math.max(from.x, to.x), y: Math.max(from.y, to.y) };
        const positions: { x: number, y: number }[] = [];
        // horizontal walls
        for (let x = start.x; x <= end.x; x++) {
            positions.push({ x: x, y: start.y });
            // skip checking for second edge if we are placing a line
            if (start.y === end.y) {
                continue;
            }
            positions.push({ x: x, y: end.y });
        }
        // vertical walls
        // edges are already covered by the first loop
        for (let y = start.y + 1; y < end.y; y++) {
            positions.push({ x: start.x, y: y });
            // skip checking for second edge if we are placing a line
            if (start.x === end.x) {
                continue;
            }
            positions.push({ x: end.x, y: y });
        }

        return positions;
    }

    private createChunkPreviewIfNeeded(): void {
        if (this.wallPreview.length === 0) {
            const pointer = this.scene.input.activePointer;
            this.wallPreview.push(this.scene.add.image(pointer.x, pointer.y, 'grayWall')
                .setOrigin(0.5, 0.5)
                .setAlpha(0.5)
                .setDepth(1000 + pointer.y),
            );
        }
    }
}
