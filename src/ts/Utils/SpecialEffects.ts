import { DepthLayers } from './Enums';
import { Helper } from './Helpers/Helper';

export class SpecialEffects {

    private scene: Phaser.Scene;

    private confettiEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.confettiEmitter = scene.add.particles(
            Helper.width(0.5),
            Helper.height(-0.2),
            'confetti',
            {
                frame: {
                    frames: [
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '9',
                        '10',
                        '11',
                        '12',
                        '13',
                        '14',
                        '15',
                        '16',
                        '17',
                    ],
                },
                lifespan: 5000,
                gravityY: 1000,
                speedX: { min: -200, max: 200 },
                speedY: 100,
                scale: { min: 0.75, max: 1 },
                rotate: { min: 0, max: 360 },
                quantity: 3,
                frequency: 100,
                emitZone: {
                    type: 'random',
                    quantity: 1,
                    source: new Phaser.Geom.Rectangle(-Helper.width(0.5), 0, Helper.width(), 5),
                },
                // on: false,
            },
        ).setDepth(DepthLayers.SpecialEffects);
    }

    public startConfetti(): void {
        this.confettiEmitter.start();
    }

    public stopConfetti(): void {
        this.confettiEmitter.stop();
    }

    public explodeConfetti(x: number, y: number): void {
        this.confettiEmitter.explode(10, x, y);
    }
}
