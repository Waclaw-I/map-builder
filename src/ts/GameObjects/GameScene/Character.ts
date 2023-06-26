import { MathHelper } from '../../Utils/Helpers/MathHelper';
import { MapManager } from '../../Utils/MapManager';

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

export class Character extends Phaser.GameObjects.Container {

    private sprite: Phaser.GameObjects.Sprite;
    private pathToFollow?: { x: number; y: number }[];
    private followingPathPromiseResolve?: (result: { x: number; y: number; cancelled: boolean }) => void;
    private speed: number;
    private diagonalSpeed: number;

    private runningDirection?: Direction;

    constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
        super(scene, x, y);

        this.speed = speed;
        this.diagonalSpeed = speed * Math.sin(Math.PI / 4);
        this.runningDirection = undefined;

        this.sprite = this.scene.add.sprite(0, 0, 'characterIdle', 0)
            .setOrigin(0.5, 0.87);

        this.createAnimations();

        this.add([
            this.sprite,
        ]);

        this.scene.add.existing(this);
    }

    public update(time: number, dt: number) {
        if (this.pathToFollow) {
            const moveBy = this.computeFollowPathMovement();
            this.x += moveBy.x * this.speed;
            this.y += moveBy.y * this.speed;
            this.setDepth(100 + this.y);
        }
    }

    public async setPathToFollow(path: { x: number, y: number }[]): Promise<{ x: number; y: number; cancelled: boolean }> {
        this.pathToFollow = this.addYOffset(path);
        const isPreviousPathInProgress = this.pathToFollow !== undefined && this.pathToFollow.length > 0;
        return new Promise((resolve) => {
            this.followingPathPromiseResolve?.call(this, { x: this.x, y: this.y, cancelled: isPreviousPathInProgress });
            this.followingPathPromiseResolve = resolve;
        });
    }

    public stopRunning(): void {
        if (this.runningDirection) {
            this.sprite.anims.stop();
            this.playIdle();
            this.runningDirection = undefined;
        }
    }

    public move(direction: Direction, mapManager: MapManager): void {
        this.playRun(direction);
        this.runningDirection = direction;
        let nextX = this.x;
        let nextY = this.y;
        switch (direction) {
            case Direction.N: {
                nextY = this.y - this.speed;
                break;
            }
            case Direction.NE: {
                nextX = this.x + this.diagonalSpeed;
                nextY = this.y - this.diagonalSpeed;
                break;
            }
            case Direction.E: {
                nextX = this.x + this.speed;
                break;
            }
            case Direction.SE: {
                nextX = this.x + this.diagonalSpeed;
                nextY = this.y + this.diagonalSpeed;
                break;
            }
            case Direction.S: {
                nextY = this.y + this.speed;
                break;
            }
            case Direction.SW: {
                nextX = this.x - this.diagonalSpeed;
                nextY = this.y + this.diagonalSpeed;
                break;
            }
            case Direction.W: {
                nextX = this.x - this.speed;
                break;
            }
            case Direction.NW: {
                nextX = this.x - this.diagonalSpeed;
                nextY = this.y - this.diagonalSpeed;
                break;
            }
        }
        if (!mapManager.isColliding(nextX,nextY)) {
            this.x = nextX;
            this.y = nextY;
            this.setDepth(100 + this.y);
        }
    }

    public finishFollowingPath(cancelled = false): void {
        this.pathToFollow = undefined;
    }

    private playIdle(): void {
        this.sprite.anims.stop();
        this.sprite.setTexture('characterIdle', this.runningDirection);
    }

    private playRun(direction: Direction): void {
        if (this.runningDirection === direction) {
            return;
        }
        this.sprite.play(`run${direction}`);
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

    private addYOffset(path: { x: number; y: number }[]): { x: number; y: number }[] {
        return path.map((step) => {
            // return { x: step.x, y: step.y };
            return { x: step.x + 64, y: step.y };
        });
    }

    private computeFollowPathMovement(): { x: number, y: number} {
        if (this.pathToFollow !== undefined && this.pathToFollow.length === 0) {
            this.finishFollowingPath();
        }
        if (!this.pathToFollow) {
            return { x: 0, y: 0 };
        }
        const nextStep = this.pathToFollow[0];

        // Compute movement direction
        const xDistance = nextStep.x - this.x;
        const yDistance = nextStep.y - this.y;
        const distance = Math.pow(xDistance, 2) + Math.pow(yDistance, 2);
        if (distance < 50) {
            this.pathToFollow.shift();
        }
        return this.getMovementDirection(xDistance, yDistance, distance);
    }

    private getMovementDirection(xDistance: number, yDistance: number, distance: number): { x: number, y: number} {
        if (distance === 0) {
            return { x: 0, y: 0};
        }
        return { x: xDistance / Math.sqrt(distance), y: yDistance / Math.sqrt(distance) };
    }

    public getSpeed(): number {
        return this.speed;
    }
}
