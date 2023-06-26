import { MathHelper } from './Helpers/MathHelper';

export interface CartesianMapProjectionConfig {
    squareSize: number;
    colors: {
        floor: number;
        collider: number;
        player: number;
    }
}

export interface MapData {
    mapWidth: number;
    mapHeight: number;
    tileWidth: number;
    tileHeight: number;
}

export class CartesianMapProjection extends Phaser.GameObjects.Container {

    private mapWidth: number;
    private mapHeight: number;
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
        
        this.mapWidth = mapData.mapWidth;
        this.mapHeight = mapData.mapHeight;
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
        this.player.setPosition(
            Math.floor(cartesianCoords.x / this.widthRatio),
            Math.floor(cartesianCoords.y / this.heightRatio),
        );
    }

    public setCollision(x: number, y: number, collides: boolean): void {
        if (y >= this.mapHeight || x >= this.mapWidth) {
            return;
        }
        this.grid[y][x].fillColor = collides ? this.config.colors.collider : this.config.colors.floor;
    }

    private initializeProjection() {
        this.grid = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.grid.push([]);
            for (let x = 0; x < this.mapWidth; x++) {
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
                collider: 0x000000,
                player: 0xff0000,
            },
        };
    }
}
