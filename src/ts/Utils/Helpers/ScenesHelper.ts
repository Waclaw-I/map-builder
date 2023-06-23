import { BootScene } from '../../Scenes/BootScene';
import { GameScene } from '../../Scenes/GameScene';
import { LoadScene } from '../../Scenes/LoadScene';
import { PopupScene } from '../../Scenes/PopupScene';
import { UiScene } from '../../Scenes/UiScene';
import { ResizableScene } from '../../Scenes/ResizableScene';
import { PopupType } from '../Factories/PopupFactory';
import { EventsHelper } from './EventsHelper';
import { HBSLogoScene } from '../../Scenes/HBSLogoScene';

// NOTE: Ignoring Boot, Sound and Load scenes due to their singular purpose.
// NOTE: 'Scenes' is a Phaser namespace, thus prefix 'My' was needed.
export enum MyScene {
    Game = 'GameScene',
    UiScene = 'UiScene',
    Popup = 'PopupScene',
}

export class ScenesHelper {
    public static getScenesForPhaser(): Array<typeof Phaser.Scene> {
        return [
            BootScene,
            HBSLogoScene,
            LoadScene,
            PopupScene,
            GameScene,
            UiScene,
        ];
    }

    private static sceneManager: Phaser.Scenes.SceneManager;
    public static currentScene: Phaser.Scene;

    public static initialize(sceneManager: Phaser.Scenes.SceneManager): void {
        this.sceneManager = sceneManager;
    }

    public static showPopup(popupType: PopupType, popupConfig?: Record<string, any>): void {
        const popupScene = this.getScene(MyScene.Popup) as PopupScene;

        popupScene.showPopup(popupType, popupConfig);
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
        scenePlugin.bringToTop(MyScene.Popup);
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
            if (scenePlugin.isSleeping('UiScene')) {
                return;
            }
            ScenesHelper.currentScene.scene.sleep('UiScene');
        } else {
            if (scenePlugin.isActive('UiScene')) {
                return;
            }
            ScenesHelper.currentScene.scene.wake('UiScene');
        }
    }

    public static resizeScenes(ratio: number): void {
        for (const scene of this.sceneManager.getScenes(false)) {

            if (scene.scene.isActive() || scene.scene.isPaused()) {
                if ((scene as ResizableScene).resize !== undefined) {
                    (scene as ResizableScene).resize(ratio);
                }
            }
        }
    }
}

