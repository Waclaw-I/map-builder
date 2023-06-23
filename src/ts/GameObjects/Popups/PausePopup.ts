import { Point } from '@home-based-studio/phaser3-utils';
import { TextStyles } from '../../Utils/TextStyles';
import { BasePopupMetadata, IBasePopup, PopupEvent } from '../../Scenes/PopupScene';
import { Font } from '../../Utils/Enums';
import { Helper } from '../../Utils/Helpers/Helper';
import { SwitchTile, SwitchTileEvent } from '../../Utils/UI/Components/SwitchTile';
import { AudioManager } from '../../Utils/AudioManager';
import { NineSliceImage } from '../../Utils/UI/NineSliceImage';
import { I18nText } from '../I18nText';
import { StateButton } from '../../Utils/UI/Buttons/StateButton';
import { GlobalConfig } from '../../GlobalConfig';

export interface PausePopupConfig {
    position: Point;
}

export interface PausePopupReturnData {
    
}

export class PausePopup extends Phaser.GameObjects.Container implements IBasePopup {

    private background: NineSliceImage;
    private closeButton: StateButton;

    private musicButton: SwitchTile;
    private soundButton: SwitchTile;

    private gameVersionLabel: Phaser.GameObjects.Text;
    private titleText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, config?: PausePopupConfig) {
        const usedConfig = config ?? {
            position: Helper.center(),
        };
        super(scene, usedConfig.position.x, usedConfig.position.y);

        this.initializeBackground();

        this.add(this.background);
        this.setSize(this.background.displayWidth, this.background.displayHeight);

        this.initializeTitleText();
        this.initializeGameVersionLabel();

        this.initializeCloseButton();
        this.initializeMusicButton();
        this.initializeSoundButton();

        this.add([
            this.closeButton,
            this.musicButton,
            this.soundButton,
            this.titleText,
            this.gameVersionLabel,
        ]);

        this.setVisible(false);

        this.bindEventHandlers();

        this.scene.add.existing(this);
    }

    public show(): void {
        this.setVisible(true);
    }

    public close(): PausePopupReturnData {
        return {};
    }

    public getMetadata(): BasePopupMetadata {
        return {
            id: 'pause',
            pauseCurrentScene: true,
            hasOverlay: true,
            closeWithAwayClick: true,
        };
    }

    private initializeTitleText(): void {
        this.titleText = new I18nText(
            this.scene,
            { x: 0, y: -this.displayHeight * 0.5 + 110 },
            {
                textKey: 'PAUSE',
                style: TextStyles.getTextConfig(Font.AllerBold, 46, '#144b69'),
            },
        );
        this.titleText.setOrigin(0.5);
    }

    private initializeGameVersionLabel(): void {
        this.gameVersionLabel = this.scene.add.text(
            Helper.width() * 0.5 - 10,
            Helper.height() * 0.5 - 10,
            `${GlobalConfig.GAME_VERSION}`,
            TextStyles.getStyle(TextStyles.GAME_VERSION_LABEL),
        );
        this.gameVersionLabel.setOrigin(1, 1);
    }

    private initializeBackground(): void {
        this.background = new NineSliceImage(this.scene, {
            position: { x: 0, y: 0 },
            image: { key: 'popupBackground' },
            width: 680,
            height: 1000,
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
        });
        this.background.setInteractive();
    }

    private initializeCloseButton(): void {
        this.closeButton = new StateButton(
            this.scene,
            this.displayWidth * 0.5 - 50,
            -this.displayHeight * 0.5 + 20,
            'closeIcon',
            'closeIconPressed',
        );
    }

    private initializeMusicButton(): void {
        this.musicButton = new SwitchTile(
            this.scene,
            { x: 0, y: -this.displayHeight * 0.225 },
            'MUSIC',
            !AudioManager.getIsMusicMuted(),
        );
        this.musicButton.setScale(0.95);
    }

    private initializeSoundButton(): void {
        this.soundButton = new SwitchTile(
            this.scene,
            { x: 0, y: -this.displayHeight * 0.075 },
            'SOUND',
            !AudioManager.getIsSoundMuted(),
        );
        this.soundButton.setScale(0.95);
    }

    private bindEventHandlers(): void {
        this.closeButton.on(Phaser.Input.Events.POINTER_UP, () => {
            this.emit(PopupEvent.Close);
        });
        this.soundButton.on(SwitchTileEvent.Switch, (isOn: boolean) => {
            AudioManager.muteSounds(!isOn);
            Helper.getAnalytics().registerSoundMuted('pause', !isOn);
        });

        this.musicButton.on(SwitchTileEvent.Switch, (isOn: boolean) => {
            AudioManager.muteMusic(!isOn);
            Helper.getAnalytics().registerMusicMuted('pause', !isOn);
        });
    }
}
