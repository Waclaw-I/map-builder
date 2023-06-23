import { SceneTemplate } from './SceneTemplate';
import { ToastManager } from '../Utils/ToastsManager';

export class UiScene extends SceneTemplate {

    private toastManager: ToastManager;

    constructor() {
        super('UiScene');
    }

    public create(): void {
        this.toastManager = new ToastManager(this);
        
        this.bindEventHandlers();

        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            // this.cameras.resize(gameSize.width, gameSize.height);
        });

    }

    private bindEventHandlers(): void {
        this.events.on('wake', () => {
            this.toastManager.destroyCurrentToast();
        });
    }
}
