import { KeyFrame, Point } from '@home-based-studio/phaser3-utils';
import { I18nText } from '../../../GameObjects/I18nText';
import { AudioManager } from '../../AudioManager';
import { Font } from '../../Enums';
import { TextStyles } from '../../TextStyles';

// TODO: Move to HBS-utils, give configuration options
export class TextButton extends Phaser.GameObjects.Container {

    private background: Phaser.GameObjects.Image;
    private text: I18nText;

    private idleKey: KeyFrame;
    private pressedKey: KeyFrame;

    constructor(
        scene: Phaser.Scene,
        pos: Point,
        backgroundIdleKey: KeyFrame,
        backgroundPressedKey: KeyFrame,
        textKey: string,
    ) {
        super(scene, pos.x, pos.y);

        this.idleKey = backgroundIdleKey;
        this.pressedKey = backgroundPressedKey;

        this.background = this.scene.add.image(0, 0, backgroundIdleKey.key, backgroundIdleKey.frame).setOrigin(0.5, 1);
        this.background.y += this.background.displayHeight * 0.5;
        this.text = new I18nText(
            this.scene,
            { x: 0, y: -10 },
            {
                textKey,
                style: TextStyles.getTextConfig(Font.AllerBold, 50),
            },
        )
            .setOrigin(0.5);

        this.add([
            this.background,
            this.text,
        ]);

        this.setSize(this.background.displayWidth, this.background.displayHeight);
        this.setInteractive({ cursor: 'pointer' });

        this.bindEventHandlers();

        this.scene.add.existing(this);
    }

    public setTexture(key: string, frame?: string | number): void {
        this.background.setTexture(key, frame);
    }

    public updateTextLanguage(): void {
        this.text.updateTextLanguage();
    }

    private bindEventHandlers(): void {
        this.on(Phaser.Input.Events.POINTER_UP, () => {
            this.background.setTexture(this.idleKey.key);
            this.text.y = -10;
        });
        this.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.background.setTexture(this.pressedKey.key);
            this.text.y = 5;
        });
        this.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.background.setTexture(this.idleKey.key);
            this.text.y = -10;
        });
    }
}
