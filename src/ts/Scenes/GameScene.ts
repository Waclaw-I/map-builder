import { SceneTemplate } from './SceneTemplate';
import { MyScene } from '../Utils/Helpers/ScenesHelper';
import { GlobalConfig } from '../GlobalConfig';

export class GameScene extends SceneTemplate {

    private graphics: Phaser.GameObjects.Graphics;

    private player: Phaser.GameObjects.Image;

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
        this.graphics.fillCircle(0, 0, 20);
        this.graphics.fillCircle(100, 100, 20);
        this.graphics.fillCircle(500, 500, 20);
        this.graphics.fillCircle(900, 900, 20);

        this.player = this.add.image(500, 500, 'ballOn');
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
            this.handlePlayerMovement();
            this.timer -= GlobalConfig.TICK_DURATION;
        }
    }

    private handlePlayerMovement() {
        if (this.cursors?.left.isDown) {
            this.player.x -= 10;
        }
        if (this.cursors?.right.isDown) {
            this.player.x += 10;
        }
        if (this.cursors?.up.isDown) {
            this.player.y -= 10;
        }
        if (this.cursors?.down.isDown) {
            this.player.y += 10;
        }
    }

    private handleScrollWheel(dy: number): void {
        const currentZoom = this.cameras.main.zoom;
        this.cameras.main.setZoom(currentZoom + 0.1 * (dy < 0 ? 1 : -1));
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
