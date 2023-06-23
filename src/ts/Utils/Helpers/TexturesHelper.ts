
export class TexturesHelper {

    private static textureManager: Phaser.Textures.TextureManager;

    public static initialize(textureManager: Phaser.Textures.TextureManager): void {
        this.textureManager = textureManager;
    }

    public static getTextureDetails(textureKey: string): Phaser.Textures.TextureSource {
        return this.textureManager.get(textureKey).source[0];
    }

    public static createRoundedRectImage(key: string, radius?: number): string {
        const newKey = `${key}Rounded`;
        if (this.textureManager.exists(newKey)) {
            return newKey;
        }
        const source = this.textureManager.get(key).getSourceImage();
        const image = this.textureManager.createCanvas(newKey, source.width, source.width);
        const r = radius || (image?.width ?? 10) * 0.15;

        image?.context.beginPath();
        image?.context.moveTo(r, 0);
        image?.context.lineTo(image.width - r, 0);
        image?.context.quadraticCurveTo(image.width, 0, image.width, r);
        image?.context.lineTo(image.width, image.height - r);
        image?.context.quadraticCurveTo(image.width, image.height, image.width - r, image.height);
        image?.context.lineTo(r, image.height);
        image?.context.quadraticCurveTo(0, image.height, 0, image.height - r);
        image?.context.lineTo(0, r);
        image?.context.quadraticCurveTo(0, 0, r, 0);
        image?.context.clip();

        image?.draw(0, 0, source as HTMLImageElement | HTMLCanvasElement);

        return newKey;
    }

    public static async loadImageFromURL(scene: Phaser.Scene, key: string, url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.textureManager.exists(key)) {
                resolve(key);
                return;
            }
            try {
                scene.load.image(key, url);
                scene.load.once('complete', () => {
                    resolve(key);
                });
                scene.load.once('loaderror', () => {
                    reject(`Could not load image ${key} from: ${url}`);
                });
                scene.load.start();
            } catch (e) {
                reject(e);
            }
        });
    }
}
