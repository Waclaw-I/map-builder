import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { MathHelper } from '../../Utils/Helpers/MathHelper';

export class Furniture extends Phaser.GameObjects.Image {

    private coords: { x: number, y: number };
    private textureNumber: number;

    private offset: { x: number, y: number };

    constructor(scene: Phaser.Scene, coords: { x: number, y: number}, textureNumber: number) {
        const isoPosition = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
        super(scene, isoPosition.x, isoPosition.y, 'furnitures', textureNumber);

        this.textureNumber = textureNumber;
        this.coords = coords;
        this.offset = { x: 64, y: 0};

        this.x += this.offset.x;
        this.y += this.offset.y;
        // TODO: Calculate this offset the right way, pretty please.
        this.setDepth(100 + this.y + this.offset.y + 50);

        this.setInteractive({ cursor: 'pointer'});

        this.scene.add.existing(this);
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
            this.y -= 64;
            this.scene.tweens.add({
                targets: [ this ],
                duration: 500,
                ease: Easing.ExpoEaseOut,
                alpha: 1,
                y: `+=${64}`,
            });
        }
    }
}
