import { MapManager } from '../../MapManager';
import { MapEditorTool } from './MapEditorTool';

export class WallEditorTool extends MapEditorTool {

    private scene: Phaser.Scene;
    private mapManager: MapManager;

    constructor(scene: Phaser.Scene, mapManager: MapManager) {
        super();
        this.scene = scene;
        this.mapManager = mapManager;

        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    public activate(activate: boolean): void {
        this.active = activate;
    }
}
