import { GlobalConfig } from '../GlobalConfig';
import { Analytics } from '../Utils/Analytics';
import { AssetsLoader } from '../Utils/AssetsLoader';
import { AudioManager } from '../Utils/AudioManager';
import { Helper } from '../Utils/Helpers/Helper';
import { MyScene, ScenesHelper } from '../Utils/Helpers/ScenesHelper';

export class LoadScene extends Phaser.Scene {
    private loadingBarText: Phaser.GameObjects.Text;

    constructor() {
        super('LoadScene');
    }

    public preload(): void {
        this.cameras.main.fadeIn(500);

        this.registry.set(
            'analytics',
            new Analytics(
                GlobalConfig.GAME_CONFIG.sendAnalyticalEvents,
                GlobalConfig.GAME_CONFIG.logAnalyticalEvents,
            ),
        );

        AssetsLoader.loadAssets(this.cache.json.get('assets'), this);

        // this.load.image('bridge', '../../assets/tiled/bridge.png');
        this.load.image('floorWood', '../../assets/tiled/map2Assets/floorWood.png');
        this.load.image('floorBrick', '../../assets/tiled/map2Assets/floorBrick.png');
        this.load.tilemapTiledJSON('map', '../../assets/tiled/map.json');

        this.load.on('progress', (value) => {
            //
        });
    }

    public create(): void {
        AudioManager.initializeAudio(this);

        this.goToNextScene();
    }

    public update(time: number, dt: number): void {
    }

    private async goToNextScene(): Promise<void> {
        this.scene.run(MyScene.Popup);

        this.cameras.main.fadeOut(500);
        await Helper.wait(this, 500);

        this.scene.start(MyScene.Game);
        ScenesHelper.currentScene = this.scene.get(MyScene.Game);

        this.scene.run(MyScene.UiScene);
        this.scene.bringToTop(MyScene.UiScene);
        // ScenesHelper.sleepUiScene(true);

        this.scene.bringToTop(MyScene.Popup);
    }
}
