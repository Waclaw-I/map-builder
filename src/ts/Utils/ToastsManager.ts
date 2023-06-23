import { Point } from '@home-based-studio/phaser3-utils';
import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { Helper } from './Helpers/Helper';
import { Toast } from './UI/Toast';

export enum ToastOriginSide {
    Top = 'Top',
    Bottom = 'Bottom',
    Left = 'Left',
    Right = 'Right',
}

export class ToastManager extends Phaser.Events.EventEmitter {

    private scene: Phaser.Scene;

    private currentToast?: Toast;

    constructor(scene: Phaser.Scene) {
        super();

        this.scene = scene;
    }

    public destroyCurrentToast(): void {
        this.currentToast?.destroy();
    }

    public showToast(text: string, showTimeMS: number, durationMS: number, side: ToastOriginSide): void {
        const toast = new Toast(
            this.scene,
            this.getSpawnPositionFromOriginSide(side),
            text,
        );
        this.currentToast = toast;

        const destination = this.getDestinationPositionFromOriginSide(side);

        this.scene.add.tween({
            targets: [ toast ],
            duration: showTimeMS,
            x: destination.x,
            y: destination.y,
            ease: Easing.BackEaseOut,
            hold: durationMS,
            yoyo: 1,
            onComplete: () => {
                toast?.destroy();
                this.currentToast = undefined;
            },
        });

    }

    // TODO: Those values must be configurable
    private getSpawnPositionFromOriginSide(side: ToastOriginSide): Point {
        switch (side) {
            case ToastOriginSide.Bottom: return { x: Helper.width(0.5), y: Helper.height(1.15) };
            case ToastOriginSide.Top: return { x: Helper.width(0.5), y: Helper.height(-0.15) };
            case ToastOriginSide.Left: return { x: Helper.width(-0.5), y: Helper.height(0.5) };
            case ToastOriginSide.Right: return { x: Helper.width(0.5), y: Helper.height(0.5) };
        }
    }

    private getDestinationPositionFromOriginSide(side: ToastOriginSide): Point {
        switch (side) {
            case ToastOriginSide.Bottom: return { x: Helper.width(0.5), y: Helper.height(0.7) };
            case ToastOriginSide.Top: return { x: Helper.width(0.5), y: Helper.height(0.15) };
            case ToastOriginSide.Left: return { x: Helper.width(0.5), y: Helper.height(0.5) };
            case ToastOriginSide.Right: return { x: Helper.width(0.5), y: Helper.height(0.5) };
        }
    }
}
