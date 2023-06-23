import { Point } from '@home-based-studio/phaser3-utils';
import { I18nText } from '../../../GameObjects/I18nText';
import { Color, Font } from '../../Enums';
import { TextStyles } from '../../TextStyles';
import { SwitchButton } from '../Buttons/SwitchButton';

export enum SwitchTileEvent {
    Switch = 'Switch',
}

export class SwitchTile extends Phaser.GameObjects.Container {

    private background: Phaser.GameObjects.Image;
    private switchButton: SwitchButton;
    private labelText: I18nText;

    constructor(scene: Phaser.Scene, position: Point, textKey: string, state: boolean = false) {
        super(scene, position.x, position.y);

        this.initializeBackground();
        this.setSize(this.background.displayWidth, this.background.displayHeight);

        this.initializeSwitchButton(state);
        this.initializeLabelText(textKey);

        this.add([
            this.background,
            this.switchButton,
            this.labelText,
        ]);

        this.setInteractive({ cursor: 'pointer' });
        this.bindEventHandlers();

        this.scene.add.existing(this);
    }

    public updateTextLanguage(): void {
        this.labelText.updateTextLanguage();
    }

    private initializeBackground(): void {
        this.background = this.scene.add.image(0, 0, 'tile');
    }

    private initializeSwitchButton(state: boolean): void {
        this.switchButton = this.getSwitchButton(
            this.scene,
            { x: 230, y: -7 },
        ),
        this.switchButton.setSwitchState(state);
        this.switchButton.disableInteractive();
    }

    private initializeLabelText(textKey: string): void {
        this.labelText = new I18nText(
            this.scene,
            { x: -this.displayWidth * 0.5 + 53, y: -7 },
            {
                textKey,
                style: TextStyles.getTextConfig(Font.AllerBold, 40),
            },
        )
            .setOrigin(0, 0.5)
            .setTint(Color.Text1);
    }

    private bindEventHandlers(): void {
        this.on(Phaser.Input.Events.POINTER_UP, () => {
            this.switchButton.switch();
            this.emit(SwitchTileEvent.Switch, this.switchButton.getState());
        });
    }

    private getSwitchButton(scene: Phaser.Scene, position: Point, width?: number, height?: number): SwitchButton {
        return new SwitchButton(
            scene,
            {
                position,
                width: width ?? 140,
                height: height ?? 72,
                onBall: { key: 'ballOn'},
                offBall: { key: 'ballOff'},
                onBackground: { key: 'backgroundOn'},
                offBackground: { key: 'backgroundOff'},
                backgroundFrameEdges: {
                    top: 35,
                    bottom: 35,
                    left: 40,
                    right: 40,
                },
                on: true,
            },
        );
    }
}
