import { SceneTemplate } from './SceneTemplate';

export class UiScene extends SceneTemplate {

    constructor() {
        super('UiScene');
    }

    public create(): void {
        this.bindEventHandlers();
    }

    public resize(): void {

    }

    private bindEventHandlers(): void {
    }
}
