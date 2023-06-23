
export enum ScalingStyle {
    VerticalView = 'VerticalView',
    Universal = 'Universal',
    // Canvas will become smaller if we scale the screen.
    Fixed = 'Fixed',
}

export enum Resolution {
    FullHD = 'FullHD',
    HD = 'HD',
}

export class ScaleHelper {
    // used for VerticalView ScalingStyle
    public static readonly MIN_DEVICE_RATIO = 1.2;
    public static readonly MAX_DEVICE_RATIO = 2.17;

    public static readonly resolutionsDimensions: Record<Resolution, { width: number, height: number}> = {
        [Resolution.HD]: { width: 720, height: 1280 },
        [Resolution.FullHD]: { width: 1280, height: 720 },
    };

    // locked base resolution of the game, used to calculate actual game world size
    public static resolution: Resolution = Resolution.FullHD;

    // actual game size with slight offsets to fill up the whole screen, used for positioning
    public static world = {
        ...this.resolutionsDimensions[this.resolution],
    };

    public static setResolution(resolution: Resolution): void {
        this.resolution = resolution;
        this.world = {
            ...this.resolutionsDimensions[this.resolution],
        };
    }


    public static updateWorldDimensions(scaleManager: Phaser.Scale.ScaleManager): void {
        const resolution = this.resolutionsDimensions[this.resolution];
        const deviceRatio = window.innerHeight / window.innerWidth;

        let newWidth = this.vertical ? resolution.height : resolution.width;
        let newHeight = this.vertical ? resolution.width : resolution.height;

        const gameRatio = newHeight / newWidth;
        
        if (gameRatio < deviceRatio) {
            newHeight = deviceRatio * newWidth;
        } else {
            newWidth = newHeight / deviceRatio;
        }
        this.world.width = newWidth;
        this.world.height = newHeight;
        scaleManager.setGameSize(newWidth, newHeight);
    }

    public static get deviceRatio() {
        return window.innerHeight / window.innerWidth;
    }

    public static get vertical() {
        return this.deviceRatio > 1;
    }
}
