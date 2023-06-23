
// TODO: Move to HBS-utils

import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { CommonAnimations } from '../../CommonAnimations';
import { Color } from '../../Enums';
import { NineSliceImage, NineSliceImageConfig } from '../NineSliceImage';

export interface NineSliceProgressBarConfig {
    emptyBarImage: NineSliceImageConfig;
    fullBarImage: NineSliceImageConfig;
    progress?: number;
}

// TODO: Get common things from ImageProgressBar, move to HBS utils
export class NineSliceProgressBar extends Phaser.GameObjects.Container {

    private fullBarImage: NineSliceImage;
    private emptyBarImage: NineSliceImage;

    private currentProgress: number;
    private vertical: boolean;

    private config: NineSliceProgressBarConfig;

    constructor(scene: Phaser.Scene, x: number, y: number, config: NineSliceProgressBarConfig) {
        super(scene, x, y);
        this.config = config;

        this.emptyBarImage = new NineSliceImage(this.scene, config.emptyBarImage);
        this.fullBarImage = new NineSliceImage(this.scene, config.fullBarImage);
        this.currentProgress = 0;

        this.add([
            this.emptyBarImage,
            this.fullBarImage,
        ]);

        if (config.progress !== undefined) {
            this.setBarProgress(config.progress);
        }

        this.setSize(this.emptyBarImage.displayWidth, this.emptyBarImage.displayHeight);

        this.scene.add.existing(this);
    }

    public async setBarProgress(progress: number, animationDuration: number = 0): Promise<void> {
        return new Promise((resolve, reject) => {
            const clampedProgress = Phaser.Math.Clamp(progress, 0, 1);
            if (animationDuration === 0) {
                this.changeBarProgress(clampedProgress);
                this.currentProgress = clampedProgress;
                resolve();
                return;
            }
            const tween = this.scene.tweens.addCounter({
                from: this.currentProgress,
                to: clampedProgress,
                duration: animationDuration,
                ease: Easing.QuadEaseOut,
                onUpdate: () => {
                    this.changeBarProgress(tween.getValue());
                },
                onComplete: () => {
                    this.currentProgress = clampedProgress;
                    resolve();
                },
            });
        });
    }

    public async resetBarProgressAnimation(): Promise<void> {
        this.fullBarImage.setTint(Color.White);
        await CommonAnimations.asyncAnimation(
            CommonAnimations.fade(this.scene, undefined, undefined, this.fullBarImage));
        this.fullBarImage.clearTint();
        this.setBarProgress(0);
        this.fullBarImage.setAlpha(1);
    }

    private changeBarProgress(progress: number): void {
        this.fullBarImage.setAlpha(progress === 0 ? 0 : 1);
        const fullWidth = this.config.fullBarImage.width;
        const currentWidth = fullWidth * progress;
        this.fullBarImage.x = this.config.fullBarImage.position.x - fullWidth * 0.5 + currentWidth * 0.5;
        this.fullBarImage.resize(currentWidth, this.config.fullBarImage.height);
    }

    public getBarProgress(): number {
        return this.currentProgress;
    }
}
