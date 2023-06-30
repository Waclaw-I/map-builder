import { Gamestate } from '../Gamestate';

/**
 * Easier acces to globalEvents and gamestate.
 * Remember to call super.preload() method!
 */
export abstract class SceneTemplate extends Phaser.Scene {

    protected globalEvents: Phaser.Events.EventEmitter;
    protected gamestate: Gamestate;

    constructor(sceneName: string) {
        super(sceneName);
    }

    public preload(): void {
        this.input.dragDistanceThreshold = 10;
        this.globalEvents = this.sys.game.events;
        this.gamestate = this.registry.get('gamestate') as Gamestate;
    }

    public abstract resize(ratio: number);
}
