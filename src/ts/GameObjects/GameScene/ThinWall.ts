import { Easing, KeyFrame } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { MathHelper } from '../../Utils/Helpers/MathHelper';
import { TileEdge } from './Tile';

export class ThinWall extends Phaser.GameObjects.Image {

    private coords: { x: number, y: number };
    private edge: TileEdge;
    private textureNumber: number;

    private offset: { x: number, y: number };

    constructor(scene: Phaser.Scene, coords: { x: number, y: number}, edge: TileEdge, textureNumber: number) {
        const isoPosition = MathHelper.cartesianToIsometric({ x: coords.x * 64, y: coords.y * 64 });
        super(scene, isoPosition.x, isoPosition.y, 'thinWall', `normal/${edge === TileEdge.N ? 'N' : 'W'}/${textureNumber}`);
        this.edge = edge;
        this.textureNumber = textureNumber;

        this.coords = coords;

        this.offset = this.getOffset();

        this.x -= this.displayWidth * 0.5;
        this.y -= this.displayHeight * 0.5;

        this.x += this.offset.x;
        this.y += this.offset.y;
        // TODO: Calculate this offset the right way, pretty please.
        this.setDepth(100 + this.y + this.offset.y + 50);

        this.setInteractive({ cursor: 'pointer'});

        this.scene.add.existing(this);
    }

    public hide(hide: boolean): void {
        hide === true ? this.showAsShort() : this.showAsWall();
    }

    private showAsShort(): void {
        if (!this.scene) {
            return;
        }
        const keyFrame = this.getTexture(true);
        console.log(keyFrame);
        this.setTexture(keyFrame.key, keyFrame.frame);
    }

    private showAsWall(): void {
        if (!this.scene) {
            return;
        }
        const keyFrame = this.getTexture();
        this.setTexture(keyFrame.key, keyFrame.frame);
    }

    public getCoords(): { x: number, y: number } {
        return this.coords;
    }

    public getEdge(): TileEdge {
        return this.edge;
    }

    public place(): void {
        this.playPlaceAnimation();
    }

    private playPlaceAnimation(): void {
        if (this.scene) {
            this.alpha = 0;
            this.y -= 64;
            this.scene.tweens.add({
                targets: [ this ],
                duration: 500,
                ease: Easing.ExpoEaseOut,
                alpha: 1,
                y: `+=${64}`,
            });
        }
    }

    private getOffset(): { x: number, y: number} {
        switch (this.edge) {
            case TileEdge.N: {
                return {
                    x: 128,
                    y: 32,
                };
            }
            case TileEdge.W: {
                return {
                    x: 64,
                    y: 32,
                };
            }
        }
    }

    private getTexture(short: boolean = false): KeyFrame {
        return {
            key: 'thinWall',
            frame: `${short ? 'short' : 'normal'}/${this.edge === TileEdge.N ? 'N' : 'W'}/${this.textureNumber}`,
        };
    }
}
