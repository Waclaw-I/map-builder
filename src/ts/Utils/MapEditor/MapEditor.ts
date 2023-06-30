import { Helper } from '../Helpers/Helper';
import { MapManager } from '../MapManager';
import { FloorEditorTool } from './Tools/FloorEditorTool';
import { FurnitureEditorTool } from './Tools/FurnitureEditorTool';
import { MapEditorTool } from './Tools/MapEditorTool';
import { ThinWallEditorTool } from './Tools/ThinWallEditorTool';
import { WallEditorTool } from './Tools/WallEditorTool';

export enum ToolMode {
    Placing,
    Deleting,
}

export enum MapEditorToolName {
    WallEditor = 'WallEditor',
    ThinWallEditor = 'ThinWallEditor',
    FloorEditor = 'FloorEditor',
    FurnitureEditor = 'FurnitureEditor',
}

export class MapEditor extends Phaser.Events.EventEmitter {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private editorTools: Record<MapEditorToolName, MapEditorTool>;
    private activeToolName?: MapEditorToolName;

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();

        this.scene = scene;
        this.mapManager = mapManager;

        this.editorTools = {
            [MapEditorToolName.WallEditor]: new WallEditorTool(this.scene, this.mapManager),
            [MapEditorToolName.ThinWallEditor]: new ThinWallEditorTool(this.scene, this.mapManager),
            [MapEditorToolName.FloorEditor]: new FloorEditorTool(this.scene, this.mapManager),
            [MapEditorToolName.FurnitureEditor]: new FurnitureEditorTool(this.scene, this.mapManager),
        };
    }

    public clear(): void {
        this.currentlyActiveTool?.clear();
        this.equipTool(undefined);
    }

    public handleKeyDownEvent(key: string): void {
        this.currentlyActiveTool?.handleKeyDownEvent(key);
        switch (key) {
            case '1': {
                this.equipTool(MapEditorToolName.ThinWallEditor);
                break;
            }
            case '2': {
                this.equipTool(MapEditorToolName.FloorEditor);
                break;
            }
            case '3': {
                this.equipTool(MapEditorToolName.FurnitureEditor);
                break;
            }
            case '4': {
                this.equipTool(MapEditorToolName.WallEditor);
                break;
            }
        }
    }

    public equipTool(tool?: MapEditorToolName): void {
        if (this.activeToolName === tool) {
            return;
        }
        // turn off previous tool
        this.currentlyActiveTool?.clear();

        this.activeToolName = tool;
        if (tool !== undefined) {
            this.currentlyActiveTool?.activate();
        }
    }

    private get currentlyActiveTool(): MapEditorTool | undefined {
        return this.activeToolName ? this.editorTools[this.activeToolName] : undefined;
    }
}
