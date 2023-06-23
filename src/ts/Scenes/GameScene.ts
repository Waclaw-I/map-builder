import { SceneTemplate } from './SceneTemplate';
import { MyScene } from '../Utils/Helpers/ScenesHelper';
import { GlobalConfig } from '../GlobalConfig';
import { Character, Direction } from '../GameObjects/GameScene/Character';

export class GameScene extends SceneTemplate {

    private graphics: Phaser.GameObjects.Graphics;

    private player: Character;

    private timer: number;

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super(MyScene.Game);
    }

    public preload(): void {
        super.preload();
    }

    public create(): void {
        this.timer = 0;
        this.cursors = this.input.keyboard?.createCursorKeys();

        this.graphics = this.add.graphics(this);

        this.graphics.fillStyle(0xff0000);
        this.graphics.fillCircle(500, 500, 20);

        this.player = new Character(this, 500, 500, 10);
        this.cameras.main.startFollow(this.player);

        const map = this.add.tilemap('map', 256, 512);

        const solidWall = map.addTilesetImage('solidWall', 'solidWall');
        const floor = map.addTilesetImage('floor', 'floor');

        if (floor && solidWall) {
            map.createLayer('floor', [ floor ])?.setCullPadding(4, 4);
            map.createLayer('wall', [ solidWall ])?.setCullPadding(4, 4);
        }

        this.bindEventHandlers();
        this.bindSceneEventHandlers();
    }

    public update(time: number, dt: number): void {
        this.timer += dt;
        while (this.timer > GlobalConfig.TICK_DURATION) {
            this.handleCursorsInput();
            this.timer -= GlobalConfig.TICK_DURATION;
        }
    }

    private handleCursorsInput() {
        let moveDirection: Direction | undefined = undefined;
        if (this.cursors?.up.isDown) {
            moveDirection = Direction.N;
            if (this.cursors?.left.isDown) {
                moveDirection = Direction.NW;
            }
            if (this.cursors?.right.isDown) {
                moveDirection = Direction.NE;
            }
        } else if (this.cursors?.down.isDown) {
            moveDirection = Direction.S;
            if (this.cursors?.left.isDown) {
                moveDirection = Direction.SW;
            }
            if (this.cursors?.right.isDown) {
                moveDirection = Direction.SE;
            }
        } else if (this.cursors?.left.isDown) {
            moveDirection = Direction.W;
        } else if (this.cursors?.right.isDown) {
            moveDirection = Direction.E;
        }
        if (moveDirection !== undefined) {
            this.player.move(moveDirection);
        } else {
            this.player.stopRunning();
        }
    }

    private handleScrollWheel(dy: number): void {
        const currentZoom = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(currentZoom + 0.1 * (dy < 0 ? 1 : -1), GlobalConfig.MIN_ZOOM, GlobalConfig.MAX_ZOOM));
    }

    private bindEventHandlers(): void {
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], dx: number, dy: number) => {
            this.handleScrollWheel(dy);
        });
    }

    private bindSceneEventHandlers(): void {
        this.events.once('shutdown', () => {
        });
    }
}
