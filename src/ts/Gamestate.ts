import { EventsHelper } from './Utils/Helpers/EventsHelper';

export class Gamestate {

    private globalEvents: Phaser.Events.EventEmitter;

    private mapEditorOn: boolean;

    constructor(globalEvents: Phaser.Events.EventEmitter) {
        this.globalEvents = globalEvents;

        this.mapEditorOn = false;
    }

    public turnMapEditorOn(on: boolean = true): void {
        if (this.mapEditorOn === on) {
            return;
        }
        this.mapEditorOn = on;
        this.globalEvents.emit(EventsHelper.events.mapEditor.switched, this.mapEditorOn);
    }

    public isMapEditorOn(): boolean {
        return this.mapEditorOn;
    }
}
