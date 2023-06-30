import packageJson from '../../package.json';

export interface GlobalConfigVariables {
    debug: boolean;
}

export class GlobalConfig {

    public static readonly FPS_TARGET = 60;
    public static readonly TICK_DURATION = 1000 / GlobalConfig.FPS_TARGET;
    public static readonly MIN_ZOOM = 0.3;
    public static readonly MAX_ZOOM = 2;

    public static readonly THIN_WALLS_COUNT = 5;
    public static readonly FLOOR_COUNT = 17;
    public static readonly FURNITURES_COUNT = 4;

    public static readonly GAME_VERSION = packageJson.version;
    public static readonly GAME_CONFIG: GlobalConfigVariables = {
        debug: false,
    };
}
