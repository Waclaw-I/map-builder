import { KeyFrame, Point } from '@home-based-studio/phaser3-utils';

export interface FrameEdges {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface NineSliceImageConfig extends FrameEdges {
    position: Point;
    image: KeyFrame;
    width: number;
    height: number;
}

export class NineSliceImage extends Phaser.GameObjects.Container {

    private config: NineSliceImageConfig;

    private image: any;

    constructor(scene: Phaser.Scene, config: NineSliceImageConfig) {
        super(scene, config.position.x, config.position.y);

        this.config = config;


        // @ts-ignore
        this.image = this.scene.add.ninePatch(
            0,
            0,
            config.width,
            config.height,
            config.image.key,
            config.image.frame,
            {
                top: config.top,
                bottom: config.bottom,
                left: config.left,
                right: config.right,
            },
        );

        this.add(this.image);

        this.setSize(config.width, config.height);

        this.scene.add.existing(this);
    }

    public setTexture(key: string, frame?: string | number): void {
        this.image.setTexture(key, frame);
    }

    public resize(width?: number, height?: number): void {
        const wVal = Math.max(this.config.left + this.config.right, width ?? this.config.width);
        const hVal = Math.max(this.config.top + this.config.bottom, height ?? this.config.height);
        this.image.resize(wVal, hVal);
        this.setSize(wVal, hVal);
    }

    public setTintFill(color: number): void {
        this.image.setTintFill(color);
    }
    public setTint(color: number): void {
        this.image.setTint(color);
    }
    public clearTint(): void {
        this.image.clearTint();
    }
}
