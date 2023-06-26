import { MathHelper } from './Helpers/MathHelper';

export interface CartesianMapProjectionConfig {
    squareSize: number;
    colors: {
        floor: number;
        wall: number;
        player: number;
    }
}

export interface MapData {
    map: number[][];
    tileWidth: number;
    tileHeight: number;
}

export class CartesianMapProjection extends Phaser.GameObjects.Container {

    private map: number[][];
    private tileWidth: number;
    private tileHeight: number;

    private grid: Phaser.GameObjects.Rectangle[][];
    private player: Phaser.GameObjects.Rectangle;

    private config: CartesianMapProjectionConfig;
    private widthRatio: number;
    private heightRatio: number;


    constructor(scene: Phaser.Scene, x: number, y: number, mapData: MapData, config?: CartesianMapProjectionConfig) {
        super(scene, x, y);

        this.config = config ?? this.getDefaultConfig();
        
        this.map = mapData.map;
        this.tileWidth = mapData.tileWidth;
        this.tileHeight = mapData.tileHeight;

        this.widthRatio = (this.tileWidth / this.config.squareSize) / 2; // divide by 2 to revert translation from cart to iso
        this.heightRatio = this.tileHeight / this.config.squareSize;

        this.initializeProjection();
        this.initializePlayer();
        this.scene.add.existing(this);
    }

    /**
     * 
     * @param x - X on isometric projection
     * @param y - Y on isometric projection
     */
    public updatePlayerPosition(x: number, y: number): void {
        const cartesianCoords = MathHelper.isometricToCartesian({ x, y });
        // console.log(cartesianCoords);
        // console.log(Math.floor(cartesianCoords.x / this.config.squareSize), Math.floor(cartesianCoords.y / this.config.squareSize));
        this.player.setPosition(
            Math.floor(cartesianCoords.x / this.widthRatio),
            Math.floor(cartesianCoords.y / this.heightRatio),
        );
    }

    private initializeProjection() {
        this.grid = [];
        for (let y = 0; y < this.map.length; y++) {
            this.grid.push([]);
            for (let x = 0; x < this.map[y].length; x++) {
                const rect = this.scene.add.rectangle(
                    this.config.squareSize * 0.5 + x * this.config.squareSize,
                    this.config.squareSize * 0.5 + y * this.config.squareSize,
                    this.config.squareSize,
                    this.config.squareSize,
                    this.config.colors.floor,
                )
                    .setStrokeStyle(1, 0x000000);
                this.grid[y].push(rect);
                this.add(rect);
            }
        }
    }

    private initializePlayer(): void {
        this.player = this.scene.add.rectangle(
            0,
            0,
            this.config.squareSize,
            this.config.squareSize,
            this.config.colors.player,
        );
        this.add(this.player);
    }

    private getDefaultConfig(): CartesianMapProjectionConfig {
        return {
            squareSize: 12,
            colors: {
                floor: 0x00ff00,
                wall: 0x000000,
                player: 0xff0000,
            },
        };
    }
}
