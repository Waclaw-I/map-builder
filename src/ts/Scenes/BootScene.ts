import { Gamestate } from '../Gamestate';
import { GlobalConfig } from '../GlobalConfig';
import { Helper } from '../Utils/Helpers/Helper';
import { TexturesHelper } from '../Utils/Helpers/TexturesHelper';
import { TypesHelper } from '../Utils/Helpers/TypesHelper';
import { Translation } from '../Utils/Translations';

export class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    public preload(): void {
        this.load['rexWebFont']({
            'custom': {
                'families': [
                    'Aller-Bold',
                ],
                'urls': [
                    '../../assets/fonts/Aller-Bold/font-face.css',
                ],
            },
        });

        this.load.json('assets', '../../assets/assets.json');
        this.load.image('hbsLogo', '../../assets/images/hbsLogo.png');

        Helper.registry = this.registry;
        TexturesHelper.initialize(this.textures);
        this.initializeTranslation(Helper.getPossibleLanguage());
        this.registry.set('gamestate', new Gamestate(this.sys.game.events));
    }

    public create(): void { 
        this.scene.start(GlobalConfig.GAME_CONFIG.showHBSLogo ? 'HBSLogoScene' : 'LoadScene');
    }

    private initializeTranslation(language?: string): void {
        let pickedLanguage = GlobalConfig.GAME_CONFIG.defaultLanguage;
        if (language && TypesHelper.isStringOfLanguageType(language)) {
            pickedLanguage = language;
        }
        this.registry.set('translation', new Translation(pickedLanguage));
    }
}
