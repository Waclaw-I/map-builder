import { Gamestate } from '../../Gamestate';
import { Helper } from '../Helpers/Helper';
import { MapManager } from '../MapManager';
import { FloorEditorTool } from './Tools/FloorEditorTool';
import { MapEditorTool } from './Tools/MapEditorTool';
import { WallEditorTool } from './Tools/WallEditorTool';

export enum MapEditorToolName {
    WallEditor = 'WallEditor',
    FloorEditor = 'FloorEditor',
}

export class MapEditor extends Phaser.Events.EventEmitter {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    private gamestate: Gamestate;

    private editorTools: Record<MapEditorToolName, MapEditorTool>;
    private activeToolName?: MapEditorToolName;

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();

        this.scene = scene;
        this.mapManager = mapManager;

        this.gamestate = Helper.getGamestate();

        this.editorTools = {
            [MapEditorToolName.WallEditor]: new WallEditorTool(this.scene, this.mapManager),
            [MapEditorToolName.FloorEditor]: new FloorEditorTool(this.scene, this.mapManager),
        };

        this.bindEventHandlers();
    }

    public handleKeyDownEvent(key: string): void {
        switch (key) {
            case 'w': {
                this.equipTool(MapEditorToolName.WallEditor);
                break;
            }
            case 'f': {
                this.equipTool(MapEditorToolName.FloorEditor);
                break;
            }
        }
    }

    public equipTool(tool?: MapEditorToolName): void {
        if (this.activeToolName === tool) {
            return;
        }
        // turn off previous tool
        this.currentlyActiveTool?.activate(false);

        this.activeToolName = tool;
        if (tool !== undefined) {
            this.currentlyActiveTool?.activate(true);
        }
    }

    private bindEventHandlers(): void {
        this.scene.input.keyboard?.on(`${Phaser.Input.Keyboard.KeyCodes.ONE}`, () => {
        });
        this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            if (!this.gamestate.isMapEditorOn()) {
                return;
            }
            const coords = this.mapManager.getFloorTileIndexAtWorldXY(pointer.worldX, pointer.worldY);
            if (coords === undefined) {
                return;
            }
            this.mapManager.placeWall(coords);
        });
    }

    private get currentlyActiveTool(): MapEditorTool | undefined {
        return this.activeToolName ? this.editorTools[this.activeToolName] : undefined;
    }
}
