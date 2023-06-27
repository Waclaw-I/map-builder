import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { MathHelper } from '../../Utils/Helpers/MathHelper';

export class Wall extends Phaser.GameObjects.Image {

    // we need that to place wall correct visually.
    private readonly offsetX = 128;
    private readonly offsetY = 64;

    private coords: { x: number, y: number };

    constructor(scene: Phaser.Scene, coords: { x: number, y: number}, hidden = false) {
        const isoPosition = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
        super(scene, isoPosition.x, isoPosition.y, hidden ? 'grayPlain' : 'grayWall');

        this.coords = coords;

        this.x -= this.displayWidth * 0.5;
        this.y -= this.displayHeight * 0.5;

        this.x += this.offsetX;
        // TODO: Calculate this offset the right way, pretty please.
        this.setDepth(100 + this.y + this.offsetY + 50);

        this.setInteractive({ cursor: 'pointer'});

        this.scene.add.existing(this);
    }

    public hide(hide: boolean): void {
        hide === true ? this.showAsPlain() : this.showAsWall();
    }

    private showAsPlain(): void {
        this.setTexture('grayPlain');
    }

    private showAsWall(): void {
        this.setTexture('grayWall');
    }

    public getCoords(): { x: number, y: number } {
        return this.coords;
    }

    public place(): void {
        this.playPlaceAnimation();
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
