import { Point } from '@home-based-studio/phaser3-utils';
import { Analytics } from '../Analytics';
import { DeviceData } from '../DeviceData';
import { Language } from '../Enums';
import { Translation } from '../Translations';
import { ScaleHelper } from './ScaleHelper';
import { TypesHelper } from './TypesHelper';

export class Helper {

    public static deviceData: DeviceData;
    public static registry: Phaser.Data.DataManager;

    public static width(fraction: number = 1): number {
        return ScaleHelper.world.width * fraction;
    }

    public static randomFromArray<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    public static height(fraction: number = 1): number {
        return ScaleHelper.world.height * fraction;
    }

    public static randomFrom(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public static center(): Point {
        return {
            x: this.width(0.5),
            y: this.height(0.5),
        };
    }

    public static getLanguage(): Language {
        return this.getTranslation().getLanguage();
    }

    public static translate(key: string, ...substitutions: any): string {
        return this.getTranslation().get(key, substitutions);
    }

    public static getTranslation(): Translation {
        return Helper.registry.get('translation');
    }

    public static getAnalytics(): Analytics {
        return Helper.registry.get('analytics');
    }

    public static getPossibleLanguage(): Language | undefined {
        return TypesHelper.getPossibleLanguageFromString(navigator.language);
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

    public static addPoints(p1: Point, p2: Point): Point {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    }

}
