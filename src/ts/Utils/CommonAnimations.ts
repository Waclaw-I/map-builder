import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';

export class CommonAnimations {

    public static bounce(scene: Phaser.Scene, endScale?: number, ...targets: unknown[]): void {
        scene.tweens.add({
            targets,
            duration: 100,
            scale: endScale ? endScale * 0.9 : 0.9,
            ease: 'Sine.easeIn',
            onComplete: () => {
                scene.tweens.add({
                    targets,
                    duration: 300,
                    scale: endScale ?? 1,
                    ease: Easing.BounceEaseOut,
                });
            },
        });
    }

    public static bounceDown(scene: Phaser.Scene, startScale?: number, ...targets: unknown[]): void {
        scene.tweens.add({
            targets,
            duration: 100,
            scale: startScale ? startScale * 0.9 : 0.9,
            ease: 'Sine.easeIn',
        });
    }

    public static bounceUp(scene: Phaser.Scene, endScale?: number, ...targets: unknown[]): void {
        scene.tweens.add({
            targets,
            duration: 300,
            scale: endScale ?? 1,
            ease: Easing.BounceEaseOut,
        });
    }

    public static showWithBounce(scene: Phaser.Scene, endScale?: number, ...targets: unknown[]): Phaser.Tweens.Tween {
        const tween = scene.tweens.add({
            targets,
            duration: 200,
            scale: endScale ? endScale * 1.1 : 1.1,
            ease: Easing.SineEaseIn,
            onComplete: () => {
                scene.tweens.add({
                    targets,
                    duration: 200,
                    scale: endScale ?? 1,
                    ease: Easing.SineEaseOut,
                    onComplete: () => {
                        tween.emit('done');
                    },
                });
            },
        });
        return tween;
    }

    public static hideWithBounce(scene: Phaser.Scene, startScale?: number, ...targets: unknown[]): Phaser.Tweens.Tween {
        const tween = scene.tweens.add({
            targets,
            duration: 200,
            scale: startScale ? startScale * 1.1 : 1.1,
            ease: Easing.SineEaseIn,
            onComplete: () => {
                scene.tweens.add({
                    targets,
                    duration: 200,
                    scale: 0,
                    ease: Easing.SineEaseOut,
                    onComplete: () => {
                        tween.emit('done');
                    },
                });
            },
        });
        return tween;
    }

    public static fade(scene: Phaser.Scene, reverse?: boolean, alpha?: number, ...targets: unknown[]): Phaser.Tweens.Tween {
        const tween = scene.tweens.add({
            targets,
            duration: 200,
            alpha: alpha ?? reverse ? 1 : 0,
            ease: Easing.SineEaseIn,
            onComplete: () => {
                tween.emit('done');
            },
        });
        return tween;
    }

    public static asyncAnimation(tween: Phaser.Tweens.Tween): Promise<void> {
        return new Promise<void>((resolve) => {
            tween.on('done', () => {
                resolve();
            });
        });
    }
}
