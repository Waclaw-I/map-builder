import { KeyFrame } from '@home-based-studio/phaser3-utils';
import { MathHelper } from '../../Helpers/MathHelper';
import { MapManager } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';
import { GlobalConfig } from '../../../GlobalConfig';

export enum FurnitureEditorToolMode {
    Placing,
    Deleting,
}

export class FurnitureEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private furniturePreview?: Phaser.GameObjects.Image;

    private selectedTextureNumber: number;

    private mode: FurnitureEditorToolMode;


    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();
        this.scene = scene;
        this.mapManager = mapManager;

        this.furniturePreview = undefined;
        this.selectedTextureNumber = 0;

        this.bindEventHandlers();
    }

    public isActive(): boolean {
        return this.active;
    }

    public activate(): void {
        this.active = true;
        this.setMode(FurnitureEditorToolMode.Placing);
        this.updatePreview();
    }

    public clear(): void {
        this.active = false;
        this.furniturePreview?.destroy();
        this.furniturePreview = undefined;
    }

    public handleKeyDownEvent(key: string): void {
        switch (key) {
            case '1': {
                this.setMode(FurnitureEditorToolMode.Placing);
                break;
            }
            case '2': {
                this.setMode(FurnitureEditorToolMode.Deleting);
                break;
            }
            case 'q': {
                this.nextTexture();
                this.updatePreview();
            }
        }
    }

    private bindEventHandlers(): void {
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== FurnitureEditorToolMode.Placing) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            const position = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
            console.log(coords);
            if (this.furniturePreview) {
                this.furniturePreview.x = position.x + 64;
                this.furniturePreview.y = position.y;
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

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== FurnitureEditorToolMode.Placing) {
                return;
            }
            if (pointer.rightButtonReleased()) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            this.mapManager.placeFurniture(coords, this.selectedTextureNumber);
        });
    }

    private setMode(mode: FurnitureEditorToolMode): void {
        if (this.mode === mode) {
            return;
        }
        this.mode = mode;
        switch (mode) {
            case FurnitureEditorToolMode.Placing: {
                console.log('PLACING MODE');
                // this.mapManager.getAllWalls().forEach(wall => wall121.clearTint());
                this.updatePreview();
                break;
            }
            case FurnitureEditorToolMode.Deleting: {
                console.log('DELETE MODE');
                this.furniturePreview = undefined;
                break;
            }
        }
    }

    private updatePreview(): void {
        const pointer = this.scene.input.activePointer;
        if (!this.furniturePreview) {
            this.furniturePreview = this.scene.add.image(pointer.worldX, pointer.worldY, 'furniture', this.selectedTextureNumber);
        }
        const keyFrame = this.getPreviewTexture();
        this.furniturePreview?.setTexture(keyFrame.key, keyFrame.frame)
            .setOrigin(0.5, 0.5)
            .setAlpha(0.85)
            .setDepth(1000 + pointer.y);
    }

    private getPreviewTexture(): KeyFrame {
        return {
            key: 'furnitures',
            frame: this.selectedTextureNumber,
        };
    }

    private nextTexture(): void {
        this.selectedTextureNumber = ((this.selectedTextureNumber += 1) % GlobalConfig.FURNITURES_COUNT);
    }
}