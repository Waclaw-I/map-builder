import { KeyFrame, Point } from '@home-based-studio/phaser3-utils';
import { Easing } from '@home-based-studio/phaser3-utils/lib/utils/types/Types';
import { AudioManager } from '../../AudioManager';
import { FrameEdges, NineSliceImage } from '../NineSliceImage';

export interface SwitchButtonConfig {
    position: Point;
    on?: boolean;
    onBackground: KeyFrame;
    onBall: KeyFrame;
    offBackground: KeyFrame;
    offBall: KeyFrame;
    width: number;
    height: number;
    backgroundFrameEdges: FrameEdges;
}

export enum SwitchButtonEvent {
    Clicked = 'Clicked',
}

export class SwitchButton extends Phaser.GameObjects.Container {

    private onBackground: NineSliceImage;
    private offBackground: NineSliceImage;
    private ball: Phaser.GameObjects.Image;

    private config: SwitchButtonConfig;

    private isOn: boolean;

    constructor(scene: Phaser.Scene, config: SwitchButtonConfig) {
        super(scene, config.position.x, config.position.y);
        this.config = config;
        this.isOn = false;

        this.initializeOffBackground();
        this.initializeOnBackground();
        this.initializeBall();
        
        this.add([
            this.offBackground,
            this.onBackground,
            this.ball,
        ]);

        this.setSize(this.onBackground.displayWidth, this.onBackground.displayHeight);
        this.setInteractive({ cursor: 'pointer' });

        this.bindEventHandlers();

        if (this.config.on) {
            this.switch(true);
        }

        this.scene.add.existing(this);
    }

    public getState(): boolean {
        return this.isOn;
    }

    public setSwitchState(state: boolean): void {
        this.switch(true, state);
    }

    public switch(instant?: boolean, state?: boolean): void {
        if (state) {
            this.isOn = state;
        } else {
            this.isOn = !this.isOn;
        }

        const offPos = this.onBackground.x - this.onBackground.displayWidth * 0.5 + this.ball.displayWidth * 0.7;
        const onPos = this.onBackground.x + this.onBackground.displayWidth * 0.5 - this.ball.displayWidth * 0.7;

        this.onBackground.setVisible(this.isOn);
        this.offBackground.setVisible(!this.isOn);
        this.ball.setTexture(
            this.isOn ? this.config.onBall.key : this.config.offBall.key,
            this.isOn ? this.config.onBall.frame : this.config.offBall.frame,
        );

        if (instant) {
            this.ball.x = this.isOn ? onPos : offPos;
            return;
        }
        this.scene.tweens.add({
            targets: [ this.ball ],
            duration: 300,
            ease: Easing.ExpoEaseOut,
            x: this.isOn ? onPos : offPos,
        });
    }

    private initializeOffBackground(): void {
        this.offBackground = new NineSliceImage(this.scene, {
            position: { x: 0, y: 0 },
            image: this.config.offBackground,
            width: this.config.width,
            height: this.config.height,
            ...this.config.backgroundFrameEdges,
        });
    }

    private initializeOnBackground(): void {
        this.onBackground = new NineSliceImage(this.scene, {
            position: { x: 0, y: 0 },
            image: this.config.onBackground,
            width: this.config.width,
            height: this.config.height,
            ...this.config.backgroundFrameEdges,
        });
        this.onBackground.setVisible(false);
    }

    private initializeBall(): void {
        this.ball = this.scene.add.image(
            this.onBackground.x - this.onBackground.displayWidth * 0.5,
            0,
            this.config.offBall.key, this.config.offBall.frame);
        this.ball.x += this.ball.displayWidth * 0.5;
    }

    private bindEventHandlers(): void {
        this.on(Phaser.Input.Events.POINTER_UP, () => {
            this.switch();
            this.emit(SwitchButtonEvent.Clicked, this.isOn);
        });
    }
}
