import { SceneTemplate } from './SceneTemplate';
import { Helper } from '../Utils/Helpers/Helper';
import { MyScene, ScenesHelper } from '../Utils/Helpers/ScenesHelper';
import { Color } from '../Utils/Enums';
import { PopupFactory, PopupType } from '../Utils/Factories/PopupFactory';

export interface BasePopupMetadata {
    id: string;
    pauseCurrentScene: boolean;
    hasOverlay: boolean;
    closeWithAwayClick: boolean;
}

export enum PopupEvent {
    Close = 'Close',
}

export interface IBasePopup {
    getMetadata: () => BasePopupMetadata;
    show: () => void;
    close: () => Record<string, any>;
    update: (time: number, dt: number) => void;
    destroy: () => void;
    on: (event: string | symbol, fn: Function, context?: any) => this;
}

export class PopupScene extends SceneTemplate {

    private overlay: Phaser.GameObjects.Rectangle;
    private popups: Map<string, IBasePopup>;

    private popupFactory: PopupFactory;

    constructor() {
        super(MyScene.Popup);

        this.popupFactory = new PopupFactory(this);
    }

    public preload(): void {
        super.preload();
    }

    public create(): void {
        this.popups = new Map<string, IBasePopup>();

        this.initializeOverlay();
        this.bindEventHandlers();
    }

    public update(time: number, dt: number): void {
        for (const popup of this.popups.values()) {
            popup.update(time, dt);
        }
    }

    private initializeOverlay(): void {
        this.overlay?.destroy();
        this.overlay = this.add.rectangle(
            Helper.width(0.5), Helper.height(0.5), Helper.width(), Helper.height(), Color.Black, 0.5,
        )
            .setVisible(false)
            .setInteractive();
    }

    public showPopup(type: PopupType, config?: Record<string, any>): void {

        const popup = this.popupFactory.getPopup(type, config);
        if (!popup) {
            return;
        }

        const id = popup.getMetadata().id;
        if (this.popups.has(id)) {
            this.destroyPopup(id);
        }
        this.popups.set(id, popup);

        this.bindPopupEventHandlers(popup, type);

        this.overlay.once(Phaser.Input.Events.POINTER_UP, () => {
            if (popup.getMetadata().closeWithAwayClick) {
                this.destroyPopup(popup.getMetadata().id);
            }
        });

        this.manageOverlayState();
        this.managePauseState();
        popup.show();
    }

    private bindEventHandlers(): void {
    }

    private bindPopupEventHandlers(popup: IBasePopup, popupType: PopupType): void {
        
        popup.on(PopupEvent.Close, () => {
            let leaveGame = false;
            switch (popupType) {
                // case PopupType.Pause: {
                //     const data = (popup as PausePopup).close();
                //     if (data?.leaveGame) {
                //         leaveGame = true;
                //     }
                //     break;
                // }
                default: {
                    //
                }
            }
            this.destroyPopup(popup.getMetadata().id);
        });
    }

    private destroyPopup(id: string): void {
        const popup = this.popups.get(id);
        if (!popup) {
            return;
        }
        popup.destroy();
        this.popups.delete(id);
        this.manageOverlayState();
        this.managePauseState();
    }

    private manageOverlayState(): void {
        const currentlyVisiblePopups = this.popups.values();
        let overlayNeeded = false;
        for (const popup of currentlyVisiblePopups) {
            overlayNeeded = popup.getMetadata().hasOverlay;
            if (overlayNeeded) {
                break;
            }
        }
        this.overlay.setVisible(overlayNeeded);
    }

    private managePauseState(): void {
        const currentlyVisiblePopups = this.popups.values();
        let pauseNeeeded = false;
        for (const popup of currentlyVisiblePopups) {
            pauseNeeeded = popup.getMetadata().pauseCurrentScene;
            if (pauseNeeeded) {
                break;
            }
        }
        ScenesHelper.pauseCurrentScene(pauseNeeeded);
    }
}
