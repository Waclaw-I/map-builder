import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { Color } from '../Utils/Enums';
import { Helper } from '../Utils/Helpers/Helper';

export class HBSLogoScene extends Phaser.Scene {

    private background: Phaser.GameObjects.Rectangle;
    private logo: Phaser.GameObjects.Image;

    constructor() {
        super('HBSLogoScene');
    }

    public preload(): void {

    }

    public create(): void {
        this.background = this.add.rectangle(Helper.width(0.5), Helper.height(0.5), Helper.width(), Helper.height(), Color.HomeBasedStudioBlue);
        this.logo = this.add.image(Helper.width(0.5), Helper.height(0.5), 'hbsLogo').setAlpha(0);

        this.tweens.add({
            targets: [ this.logo ],
            duration: 2000,
            alpha: 1,
            ease: Easing.SineEaseOut,
            yoyo: true,
        });

        this.time.delayedCall(4000, () => {
            this.scene.start('LoadScene');
        });
    }
}
