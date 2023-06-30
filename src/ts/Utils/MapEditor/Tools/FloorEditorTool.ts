import { KeyFrame } from '@home-based-studio/phaser3-utils';
import { MathHelper } from '../../Helpers/MathHelper';
import { MapManager } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';
import { GlobalConfig } from '../../../GlobalConfig';

export enum FloorEditorToolMode {
    Placing,
    Deleting,
}

export class FloorEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private floorPreview: Phaser.GameObjects.Image[];

    private selectedTextureNumber: number;

    private mode: FloorEditorToolMode;

    private placementShapeStart?: { x: number, y: number };
    private placementShapeEnd?: { x: number, y: number };
    private shapeChunkCoords: { x: number, y: number }[];

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();
        this.scene = scene;
        this.mapManager = mapManager;

        this.floorPreview = [];
        this.shapeChunkCoords = [];

        this.selectedTextureNumber = 0;

        this.bindEventHandlers();
    }

    public isActive(): boolean {
        return this.active;
    }

    public activate(): void {
        this.active = true;
        this.setMode(FloorEditorToolMode.Placing);
        this.createChunkPreviewIfNeeded();
    }

    public clear(): void {
        this.active = false;
        this.floorPreview.forEach(chunk => chunk.destroy());
        this.floorPreview = [];
        this.placementShapeStart = undefined;
        this.placementShapeEnd = undefined;
        // this.mapManager.getAllWalls().forEach(wall => wall.clearTint());
    }

    public handleKeyDownEvent(key: string): void {
        switch (key) {
            case '1': {
                this.setMode(FloorEditorToolMode.Placing);
                break;
            }
            case '2': {
                this.setMode(FloorEditorToolMode.Deleting);
                break;
            }
            case 'q': {
                this.nextTexture();
                this.createChunkPreviewIfNeeded();
            }
        }
    }

    private bindEventHandlers(): void {
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== FloorEditorToolMode.Placing) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            const position = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
            if (!this.placementShapeStart) {
                this.floorPreview[0].x = position.x + 64;
                this.floorPreview[0].y = position.y + 32;
            } else {
                this.placementShapeEnd = coords;
                if (this.placementShapeStart && this.placementShapeEnd) {
                    this.shapeChunkCoords = this.getShapeChunkCoords(this.placementShapeStart, this.placementShapeEnd);

                    // it would be a nice place to use Object Pool.
                    this.floorPreview.forEach(floorChunk => floorChunk.destroy());
                    this.floorPreview = [];

                    for (const chunkData of this.shapeChunkCoords) {
                        const chunkPos = MathHelper.cartesianToIsometric({ x: chunkData.x * 64, y: chunkData.y * 64 });
                        this.floorPreview.push(this.scene.add.image(
                            chunkPos.x + 64,
                            chunkPos.y + 32,
                            'floorAtlas',
                            this.selectedTextureNumber,
                        )
                            .setOrigin(0.5, 0.5)
                            .setAlpha(0.85)
                            .setDepth(1000 + pointer.y),
                        );
                    }
                }
            }

            // this.mapManager.on(MapManagerEvent.WallPointedOver, (wall: ThinWall) => {
            //     if (!this.active || this.mode !== FloorEditorToolMode.Deleting) {
            //         return;
            //     }
            //     wall.setTint(0xff0000);
            // });

            // this.mapManager.on(MapManagerEvent.WallPointedOut, (wall: ThinWall) => {
            //     if (!this.active || this.mode !== FloorEditorToolMode.Deleting) {
            //         return;
            //     }
            //     wall.clearTint();
            // });

            // this.mapManager.on(MapManagerEvent.WallPressedDown, (wall: ThinWall) => {
            //     if (!this.active || this.mode !== FloorEditorToolMode.Deleting) {
            //         return;
            //     }
            //     this.mapManager.removeThinWall(wall);
            // });
        });

        this.scene.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== FloorEditorToolMode.Placing) {
                return;
            }
            if (pointer.rightButtonReleased()) {
                return;
            }
            if (this.placementShapeStart) {
                this.floorPreview.forEach(wallChunk => wallChunk.destroy());
                this.floorPreview = [];
                this.createChunkPreviewIfNeeded();
                
                if (this.shapeChunkCoords.length === 0) {
                    this.mapManager.placeFloor(this.placementShapeStart, this.selectedTextureNumber);
                } else {
                    for (const coords of this.shapeChunkCoords) {
                        this.mapManager.placeFloor(coords, this.selectedTextureNumber);
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
            if (this.mode !== FloorEditorToolMode.Placing) {
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

    private getShapeChunkCoords(
        from: { x: number, y: number },
        to: { x: number, y: number },
    ): { x: number, y: number }[] {

        const start = { x: Math.min(from.x, to.x), y: Math.min(from.y, to.y) };
        const end = { x: Math.max(from.x, to.x), y: Math.max(from.y, to.y) };
        const positions: { x: number, y: number }[] = [];
        for (let x = start.x; x <= end.x; x++) {
            for (let y = start.y; y <= end.y; y++) {
                positions.push({ x, y });
            }
        }
        return positions;
    }

    private setMode(mode: FloorEditorToolMode): void {
        if (this.mode === mode) {
            return;
        }
        this.mode = mode;
        switch (mode) {
            case FloorEditorToolMode.Placing: {
                console.log('PLACING MODE');
                // this.mapManager.getAllWalls().forEach(wall => wall121.clearTint());
                this.createChunkPreviewIfNeeded();
                break;
            }
            case FloorEditorToolMode.Deleting: {
                console.log('DELETE MODE');
                this.floorPreview.forEach(floorChunk => floorChunk.destroy());
                this.floorPreview = [];
                this.placementShapeStart = undefined;
                this.placementShapeEnd = undefined;
                break;
            }
        }
    }

    private createChunkPreviewIfNeeded(): void {
        const oldPosition = this.floorPreview[0] ? { x: this.floorPreview[0].x, y: this.floorPreview[0].y } : undefined;
        this.floorPreview[0]?.destroy();
        this.floorPreview = [];

        const keyFrame = this.getPreviewTexture();
        const pointer = this.scene.input.activePointer;
        const position = oldPosition ?? { x: pointer.x, y: pointer.y };
        this.floorPreview.push(this.scene.add.image(position.x, position.y, keyFrame.key, keyFrame.frame)
            .setOrigin(0.5, 0.5)
            .setAlpha(0.85)
            .setDepth(1000 + pointer.y),
        );
    }

    private getPreviewTexture(): KeyFrame {
        return {
            key: 'floorAtlas',
            frame: this.selectedTextureNumber,
        };
    }

    private nextTexture(): void {
        this.selectedTextureNumber = ((this.selectedTextureNumber += 1) % GlobalConfig.FLOOR_COUNT);
    }
}
