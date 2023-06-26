import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { MathHelper } from '../../Utils/Helpers/MathHelper';

export class Wall extends Phaser.GameObjects.Image {

    // we need that to place wall correct visually.
    private readonly offsetX = 128;
    private readonly offsetY = 64;

    constructor(scene: Phaser.Scene, coords: { x: number, y: number}) {
        const isoPosition = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
        super(scene, isoPosition.x, isoPosition.y, 'grayWall');

        this.x -= this.displayWidth * 0.5;
        this.y -= this.displayHeight * 0.5;

        this.x += this.offsetX;
        // TODO: Calculate this offset the right way, pretty please.
        this.setDepth(100 + this.y + this.offsetY + 50);

        this.playPlaceAnimation();

        this.scene.add.existing(this);
    }

    private playPlaceAnimation(): void {
        if (this.scene) {
            this.alpha = 0;
            this.scene.tweens.add({
                targets: [ this ],
                duration: 500,
                ease: Easing.ExpoEaseOut,
                alpha: 1,
                y: `+=${this.offsetY}`,
            });
        }
    }
}
