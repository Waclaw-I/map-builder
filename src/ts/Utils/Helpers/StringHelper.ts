import { StringHelper as StringHelperBase } from '@home-based-studio/phaser3-utils';
import { MathHelper } from './MathHelper';

export class StringHelper extends StringHelperBase {

    public static getCurrentDate(): string {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        return `${day < 10 ? `0${day}` : day}.${month < 10 ? `0${month}` : month}.${year}`;
    }

    public static setMaxBitmapTextSize(text: Phaser.GameObjects.BitmapText, maxWidth: number, minFontSize?: number): void {
        while (text.width > maxWidth) {
            text.setFontSize(text.fontSize - 1);
            if (minFontSize && minFontSize >= text.fontSize) {
                return;
            }
            if (text.width <= 0) {
                return;
            }
        }
    }

    public static getRandomCharacter(): string {
        return MathHelper.randomFromArray('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''));
    }

    public static setMaxTextSize(text: Phaser.GameObjects.Text, maxWidth: number, maxHeight?: number, minFontSize?: number, unit: string = 'px'): void {
        while (text.width > maxWidth || text.height > (maxHeight ?? Infinity)) {
            text.setFontSize(this.getTextFontSize(`${text.style.fontSize}`, unit) - 1);
            if (minFontSize && minFontSize >= this.getTextFontSize(`${text.style.fontSize}`, unit)) {
                return;
            }
            if (text.width <= 0) {
                return;
            }
        }
    }

    private static getTextFontSize(fontSize: string, unit: string): number {
        return parseInt(fontSize.replace(unit, ''));
    }
}
