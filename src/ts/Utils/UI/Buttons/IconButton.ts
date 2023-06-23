import { KeyFrame, Point } from '@home-based-studio/phaser3-utils';
import { AudioManager } from '../../AudioManager';

// TODO: Move to HBS-utils, give configuration options
export class IconButton extends Phaser.GameObjects.Container {

    private background: Phaser.GameObjects.Image;
    private image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, pos: Point, background: KeyFrame, image?: KeyFrame) {
        super(scene, pos.x, pos.y);

        this.background = this.scene.add.image(0, 0, background.key, background.frame);
        this.add(this.background);

        if (image) {
            this.image = this.scene.add.image(0, 0, image.key, image.frame);
            this.add(this.image);
        }

        this.setSize(this.background.displayWidth, this.background.displayHeight);
        this.setInteractive({ cursor: 'pointer' });

        this.scene.add.existing(this);
        
        this.bindEventHandlers();
    }

    private bindEventHandlers(): void {
        this.on(Phaser.Input.Events.POINTER_UP, () => {
        });
    }
}
