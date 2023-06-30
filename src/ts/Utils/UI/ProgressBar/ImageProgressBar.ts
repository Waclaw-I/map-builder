
// TODO: Move to HBS-utils

import { KeyFrame } from '@home-based-studio/phaser3-utils';
import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { CommonAnimations } from '../../CommonAnimations';
import { Color } from '../../Enums';

export interface ImageProgressBarConfig {
    emptyBarImage: KeyFrame;
    fullBarImage: KeyFrame;
    progress?: number;
    vertical?: boolean;
    reversed?: boolean;
}

export class ImageProgressBar extends Phaser.GameObjects.Container {

    private fullBarImage: Phaser.GameObjects.Image;
    private emptyBarImage: Phaser.GameObjects.Image;

    private currentProgress: number;
    private vertical: boolean;
    private reversed: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, config: ImageProgressBarConfig) {
        super(scene, x, y);

        this.emptyBarImage = this.scene.add.image(0, 0, config.emptyBarImage.key, config.emptyBarImage.frame);
        this.fullBarImage = this.scene.add.image(0, 0, config.fullBarImage.key, config.fullBarImage.frame);
        this.setBarProgress(config.progress ?? 0).catch(e => console.warn(e));
        this.currentProgress = 0;
        this.vertical = config.vertical ?? false;
        this.reversed = config.reversed ?? false;

        this.add([
            this.emptyBarImage,
            this.fullBarImage,
        ]);

        if (config.progress !== undefined) {
            this.setBarProgress(config.progress).catch(e => console.warn(e));
        }

        this.setSize(this.emptyBarImage.displayWidth, this.emptyBarImage.displayHeight);

        this.scene.add.existing(this);
    }

    public async setBarProgress(progress: number, animationDuration: number = 0): Promise<void> {
        return new Promise((resolve) => {
            const clampedProgress = Phaser.Math.Clamp(progress, 0, 1);
            if (animationDuration === 0) {
                this.changeBarProgress(clampedProgress);
                this.currentProgress = clampedProgress;
                resolve();
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
        this.setBarProgress(0).catch(e => console.warn(e));
        this.fullBarImage.setAlpha(1);
    }

    private changeBarProgress(progress: number): void {
        if (this.vertical) {
            if (this.reversed) {
                this.fullBarImage.setCrop(
                    0, 0, this.fullBarImage.width, this.fullBarImage.height * progress);
                return;
            }
            this.fullBarImage.setCrop(
                0, this.fullBarImage.height * (1 - progress), this.fullBarImage.width, this.fullBarImage.height);
            return;
        }
        if (this.reversed) {
            this.fullBarImage.setCrop(
                this.fullBarImage.width * (1 - progress), 0, this.fullBarImage.width, this.fullBarImage.height);
            return;
        }
        this.fullBarImage.setCrop(0, 0, this.fullBarImage.width * progress, this.fullBarImage.height);
    }

    public getBarProgress(): number {
        return this.currentProgress;
    }
}
