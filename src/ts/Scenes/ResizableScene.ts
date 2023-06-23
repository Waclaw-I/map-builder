import { SceneTemplate } from './SceneTemplate';

export abstract class ResizableScene extends SceneTemplate {

    constructor(sceneName: string) {
        super(sceneName);
    }

    public preload(): void {
        super.preload();
    }

    public abstract resize(ratio: number): void;
}
