import { Color, Font } from './Enums';

export class TextStyles {

    public static TOAST = 'TOAST';
    public static RIBBON_GAME_OVER = 'RIBBON_GAME_OVER';
    public static GAME_VERSION_LABEL = 'GAME_VERSION_LABEL';

    public static getTextConfig(font: Font, size: number, color: string = '#ffffff'): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontFamily: font,
            fontSize: `${size}px`,
            color,
        };
    }

    public static getStyle(style: string): Phaser.Types.GameObjects.Text.TextStyle {
        let textConfig = {};
        switch (style) {
            case TextStyles.TOAST: {
                textConfig = {
                    fontFamily: Font.AllerBold,
                    fontSize: '40px',
                    color: '#144b69',
                };
                break;
            }
            case TextStyles.RIBBON_GAME_OVER: {
                textConfig = {
                    fontFamily: Font.AllerBold,
                    fontSize: '45px',
                    color: '#ffffff',
                    stroke: '#144b69',
                    strokeThickness: 14,
                };
                break;
            }
            case TextStyles.GAME_VERSION_LABEL: {
                textConfig = {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: 'white',
                };
                break;
            }
        }

        return textConfig;
    }

    public static fontSizeToNumber(fontSize: string): number {
        return Number(fontSize.substr(0, fontSize.length - 2));
    }
}
