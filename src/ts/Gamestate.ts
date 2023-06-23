
export class Gamestate {

    private globalEvents: Phaser.Events.EventEmitter;

    private highscore: number;
    private currentScoreTresholdIndex: number;

    constructor(globalEvents: Phaser.Events.EventEmitter) {
        this.globalEvents = globalEvents;

        this.highscore = 0;
        this.currentScoreTresholdIndex = 0;
    }

    public setHighscore(score: number): void { this.highscore = score; }
    public getHighscore(): number { return this.highscore; }

    public setCurrentScoreTresholdIndex(value: number): void { this.currentScoreTresholdIndex = value; }
    public getCurrentScoreTresholdIndex(): number { return this.currentScoreTresholdIndex; }
}
