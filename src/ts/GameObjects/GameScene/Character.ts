export enum Direction {
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW,
    N,
}

export class Character extends Phaser.GameObjects.Sprite {

    private speed: number;
    private diagonalSpeed: number;

    private runningDirection?: Direction;

    constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
        super(scene, x, y, 'characterIdle', 0);

        this.speed = speed;
        this.diagonalSpeed = speed * Math.sin(Math.PI / 4);
        this.runningDirection = undefined;

        this.setDepth(10000);

        this.createAnimations();

        this.scene.add.existing(this);
    }

    public stopRunning(): void {
        if (this.runningDirection) {
            this.anims.stop();
            this.playIdle();
            this.runningDirection = undefined;
        }
    }

    public move(direction: Direction): void {
        this.playRun(direction);
        this.runningDirection = direction;
        switch (direction) {
            case Direction.N: {
                this.y -= this.speed;
                break;
            }
            case Direction.NE: {
                this.x += this.diagonalSpeed;
                this.y -= this.diagonalSpeed;
                break;
            }
            case Direction.E: {
                this.x += this.speed;
                break;
            }
            case Direction.SE: {
                this.x += this.diagonalSpeed;
                this.y += this.diagonalSpeed;
                break;
            }
            case Direction.S: {
                this.y += this.speed;
                break;
            }
            case Direction.SW: {
                this.x -= this.diagonalSpeed;
                this.y += this.diagonalSpeed;
                break;
            }
            case Direction.W: {
                this.x -= this.speed;
                break;
            }
            case Direction.NW: {
                this.x -= this.diagonalSpeed;
                this.y -= this.diagonalSpeed;
                break;
            }
        }
    }

    private playIdle(): void {
        this.anims.stop();
        this.setTexture('characterIdle', this.runningDirection);
    }

    private playRun(direction: Direction): void {
        if (this.runningDirection === direction) {
            return;
        }
        this.play(`run${direction}`);
    }

    private createAnimations(): void {
        for (let i = 0; i < 8; i += 1) {
            this.scene.anims.create({
                key: `run${i}`,
                frames: [
                    { key: `characterRun${i}`, frame: 0 },
                    { key: `characterRun${i}`, frame: 1 },
                    { key: `characterRun${i}`, frame: 2 },
                    { key: `characterRun${i}`, frame: 3 },
                    { key: `characterRun${i}`, frame: 4 },
                    { key: `characterRun${i}`, frame: 5 },
                    { key: `characterRun${i}`, frame: 6 },
                    { key: `characterRun${i}`, frame: 7 },
                    { key: `characterRun${i}`, frame: 8 },
                ],
                frameRate: 20,
                repeat: -1,
            });
        }
    }

    public getSpeed(): number {
        return this.speed;
    }
}
