import { BootScene } from '../../Scenes/BootScene';
import { GameScene } from '../../Scenes/GameScene';
import { LoadScene } from '../../Scenes/LoadScene';
import { SceneTemplate } from '../../Scenes/SceneTemplate';
import { UiScene } from '../../Scenes/UiScene';
import { EventsHelper } from './EventsHelper';

// NOTE: Ignoring Boot, Sound and Load scenes due to their singular purpose.
// NOTE: 'Scenes' is a Phaser namespace, thus prefix 'My' was needed.
export enum MyScene {
    Game = 'GameScene',
    UiScene = 'UiScene',
}

export class ScenesHelper {
    public static getScenesForPhaser(): Array<typeof Phaser.Scene> {
        return [
            BootScene,
            LoadScene,
            GameScene,
            UiScene,
        ];
    }

    private static sceneManager: Phaser.Scenes.SceneManager;
    public static currentScene: Phaser.Scene;

    public static initialize(sceneManager: Phaser.Scenes.SceneManager): void {
        this.sceneManager = sceneManager;
    }
    
    public static getScene(key: string): Phaser.Scene {
        return this.currentScene.scene.get(key);
    }

    public static changeScene(scene: string, shutdown: boolean = false, data?: Record<string, any>): void {
        const scenePlugin = ScenesHelper.currentScene.scene;
        if (shutdown) {
            scenePlugin.stop(ScenesHelper.currentScene.scene.key);
        } else {
            scenePlugin.sleep(ScenesHelper.currentScene.scene.key);
        }
        scenePlugin.isSleeping(scene) ? scenePlugin.wake(scene, data) : scenePlugin.launch(scene, data);
        scenePlugin.bringToTop(scene);
        scenePlugin.bringToTop(MyScene.UiScene);
        ScenesHelper.currentScene = scenePlugin.get(scene);
        scenePlugin.scene.sys.game.events.emit(EventsHelper.events.sceneChanged, scene);
    }

    public static pauseCurrentScene(pause: boolean = true): void {
        if (pause) {
            ScenesHelper.currentScene.scene.pause(this.currentScene);
        } else {
            ScenesHelper.currentScene.scene.resume(this.currentScene);
        }
    }

    public static sleepUiScene(sleep: boolean): void {
        const scenePlugin = ScenesHelper.currentScene.scene;
        if (sleep) {
            if (scenePlugin.isSleeping(MyScene.UiScene)) {
                return;
            }
            ScenesHelper.currentScene.scene.sleep(MyScene.UiScene);
        } else {
            if (scenePlugin.isActive(MyScene.UiScene)) {
                return;
            }
            ScenesHelper.currentScene.scene.wake(MyScene.UiScene);
        }
    }

    public static resizeScenes(ratio: number): void {
        for (const scene of this.sceneManager.getScenes(false)) {

            if (scene.scene.isActive() || scene.scene.isPaused()) {
                if ((scene as SceneTemplate).resize !== undefined) {
                    (scene as SceneTemplate).resize(ratio);
                }
            }
        }
    }
}

