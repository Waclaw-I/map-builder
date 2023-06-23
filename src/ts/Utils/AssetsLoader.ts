interface AssetGroupConfig {
    [groupName: string]: { [assetKey: string]: string | string[] };
}

export class AssetsLoader {

    public static loadAssets(json: AssetGroupConfig, scene: Phaser.Scene): void {
        Object.keys(json).forEach((group) => {
            Object.keys(json[group]).forEach((key) => {
                if (Array.isArray(json[group][key])) {
                    scene.load[group](key, ...json[group][key]);
                } else {
                    scene.load[group](key, json[group][key]);
                }
            });
        });
    }
}
