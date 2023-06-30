import { Point } from '@home-based-studio/phaser3-utils';
import { DeviceData } from '../DeviceData';
import { ScaleHelper } from './ScaleHelper';
import { Gamestate } from '../../Gamestate';

export class Helper {

    public static deviceData: DeviceData;
    public static registry: Phaser.Data.DataManager;

    public static width(fraction: number = 1): number {
        return ScaleHelper.world.width * fraction;
    }
    
    public static height(fraction: number = 1): number {
        return ScaleHelper.world.height * fraction;
    }

    public static center(): Point {
        return {
            x: this.width(0.5),
            y: this.height(0.5),
        };
    }

    public static getGamestate(): Gamestate {
        return Helper.registry.get('gamestate') as Gamestate;
    }

    public static openURL(url: string): void {
        if (url) {
            window.open(url);
        }
    }

    public static gameRatio(): number {
        return this.height() / this.width();
    }

    public static async copyToClipboard(text: string): Promise<void> {
        await navigator.clipboard.writeText(text);
    }

    public static async wait(scene: Phaser.Scene, ms: number): Promise<void> {
        return new Promise(resolve => scene.time.delayedCall(ms, resolve));
    }
}
