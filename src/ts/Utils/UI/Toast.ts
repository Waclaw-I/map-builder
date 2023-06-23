import { KeyFrame, Point } from '@home-based-studio/phaser3-utils';
import { TextStyles } from '../TextStyles';
import { NineSliceImage } from './NineSliceImage';

export class Toast extends Phaser.GameObjects.Container {

    private background: NineSliceImage;
    private text: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, position: Point, text: string) {
        super(scene, position.x, position.y);

        this.background = new NineSliceImage(this.scene, {
            position: { x: 0, y: 0 },
            image: { key: 'tile9Slice' },
            width: 550,
            height: 150,
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
        });
        this.text = this.scene.add.text(0, 0, text, TextStyles.getStyle(TextStyles.TOAST))
            .setOrigin(0.5, 0.55);

        this.add([
            this.background,
            this.text,
        ]);

        this.scene.add.existing(this);
    }
}
