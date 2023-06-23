import { PausePopup, PausePopupConfig } from '../../GameObjects/Popups/PausePopup';
import { IBasePopup } from '../../Scenes/PopupScene';

export enum PopupType {
    Pause = 'PausePopup',
}

export class PopupFactory {

    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public getPopup(type: PopupType, config?: Record<string, any>): IBasePopup | undefined {
        try {
            switch (type) {
                case PopupType.Pause: return new PausePopup(this.scene, config as PausePopupConfig);
                default: return undefined;
            }
        } catch (error) {
            console.warn(error);
            return undefined;
        }
    }
}
