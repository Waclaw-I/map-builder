import { KeyFrame } from '@home-based-studio/phaser3-utils';
import { MathHelper } from '../../Helpers/MathHelper';
import { MapManager, MapManagerEvent } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';
import { GlobalConfig } from '../../../GlobalConfig';
import { Furniture } from '../../../GameObjects/GameScene/Furniture';
import { ToolMode } from '../MapEditor';

export class FurnitureEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private furniturePreview?: Phaser.GameObjects.Image;

    private selectedTextureNumber: number;
    private mode: ToolMode;


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
        this.setMode(ToolMode.Placing);
        this.updatePreview();
    }

    public clear(): void {
        this.active = false;
        this.furniturePreview?.destroy();
        this.furniturePreview = undefined;
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
                this.updatePreview();
            }
        }
    }

    private bindEventHandlers(): void {
        this.scene.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            if (!this.active) {
                return;
            }
            if (this.mode !== ToolMode.Placing) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            const position = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
            if (this.furniturePreview) {
                this.furniturePreview.x = position.x + 64;
                this.furniturePreview.y = position.y;
            }

            this.mapManager.on(MapManagerEvent.FurniturePointedOver, (furniture: Furniture) => {
                if (!this.active || this.mode !== ToolMode.Deleting) {
                    return;
                }
                furniture.setTint(0xff0000);
            });

            this.mapManager.on(MapManagerEvent.FurniturePointedOut, (furniture: Furniture) => {
                if (!this.active || this.mode !== ToolMode.Deleting) {
                    return;
                }
                furniture.clearTint();
            });

            this.mapManager.on(MapManagerEvent.FurniturePressedDown, (furniture: Furniture) => {
                if (!this.active || this.mode !== ToolMode.Deleting) {
                    return;
                }
                this.mapManager.removeFurniture(furniture);
            });
        });

        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (!this.active || this.mode !== ToolMode.Placing || pointer.rightButtonDown()) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (!coords) {
                return;
            }
            this.mapManager.placeFurniture(coords, this.selectedTextureNumber);
        });
    }

    private setMode(mode: ToolMode): void {
        if (this.mode === mode) {
            return;
        }
        this.mode = mode;
        switch (mode) {
            case ToolMode.Placing: {
                this.mapManager.getAllFurnitures().forEach(furniture => furniture.clearTint());
                this.updatePreview();
                break;
            }
            case ToolMode.Deleting: {
                this.furniturePreview?.destroy();
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
            // NOTE: Should it be always on top?
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
