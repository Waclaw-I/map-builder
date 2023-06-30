import { AssetGroupConfig, AssetsLoader } from '../Utils/AssetsLoader';
import { Helper } from '../Utils/Helpers/Helper';
import { MyScene, ScenesHelper } from '../Utils/Helpers/ScenesHelper';

export class LoadScene extends Phaser.Scene {
    private loadingBarText: Phaser.GameObjects.Text;

    constructor() {
        super('LoadScene');
    }

    public preload(): void {
        this.cameras.main.fadeIn(500);

        AssetsLoader.loadAssets(this.cache.json.get('assets') as AssetGroupConfig, this);

        this.load.image('floorWood', '../../assets/tiled/map2Assets/floorWood.png');
        this.load.image('floorBrick', '../../assets/tiled/map2Assets/floorBrick.png');
        this.load.image('grass', '../../assets/tiled/map2Assets/grass.png');
        this.load.image('ground', '../../assets/tiled/map2Assets/ground.png');
        this.load.tilemapTiledJSON('map', '../../assets/tiled/map.json');
    }

    public create(): void {
        this.goToNextScene().catch((e) => { console.warn(e); });
    }

    public update(): void {
    }

    private async goToNextScene(): Promise<void> {
        this.cameras.main.fadeOut(500);
        await Helper.wait(this, 500);

        this.scene.run(MyScene.UiScene);
        this.scene.start(MyScene.Game);
        ScenesHelper.currentScene = this.scene.get(MyScene.Game);

        this.scene.bringToTop(MyScene.UiScene);
    }
}
