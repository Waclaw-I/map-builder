import { MapManager } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';

export class FloorEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();
        this.scene = scene;
        this.mapManager = mapManager;
    }

    public isActive(): boolean {
        return this.active;
    }

    public activate(activate: boolean): void {
        this.active = activate;
    }

    public handleKeyDownEvent(key: string): void {
        // switch (key) {
        //     case '1': {
        //         this.setMode(WallEditorToolMode.Placing);
        //         break;
        //     }
        //     case '2': {
        //         this.setMode(WallEditorToolMode.Deleting);
        //         break;
        //     }
        // }
    }
}
