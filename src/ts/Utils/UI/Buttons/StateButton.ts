
export class StateButton extends Phaser.GameObjects.Image {

    private idleKey: string;
    private pressedKey: string;

    constructor(scene: Phaser.Scene, x: number, y: number, idleKey: string, pressedKey: string) {
        super(scene, x, y, idleKey);

        this.idleKey = idleKey;
        this.pressedKey = pressedKey;

        this.setOrigin(0.5, 1);
        this.y += this.displayHeight * 0.5;

        this.setInteractive({ cursor: 'pointer' });
        this.bindEventHandlers();

        this.scene.add.existing(this);
    }

    private bindEventHandlers(): void {
        this.on(Phaser.Input.Events.POINTER_UP, () => {
            this.setTexture(this.idleKey);
        });
        this.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.setTexture(this.pressedKey);
        });
        this.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.setTexture(this.idleKey);
        });
    }
}
