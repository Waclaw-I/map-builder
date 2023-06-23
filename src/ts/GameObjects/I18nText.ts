import { Point } from '@home-based-studio/phaser3-utils';
import { Helper } from '../Utils/Helpers/Helper';

export interface I18nTextConfig {
    textKey: string;
    substitutions?: any[];
    style: Phaser.Types.GameObjects.Text.TextStyle;
}

export class I18nText extends Phaser.GameObjects.Text {

    private config: I18nTextConfig;

    constructor(scene: Phaser.Scene, position: Point, config: I18nTextConfig) {
        const text = Helper.translate(config.textKey, ...config.substitutions ?? []);
        super(scene, position.x, position.y, text, config.style);

        this.config = config;
    }

    // NOTE: This way we are not depending on hooking up to the global events. Minor inconvienience.
    public updateTextLanguage(): void {
        this.setText(Helper.translate(this.config.textKey, ...this.config.substitutions ?? []));
    }
}
