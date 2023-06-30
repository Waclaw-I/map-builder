import { Gamestate } from '../Gamestate';
import { Helper } from '../Utils/Helpers/Helper';
import { TexturesHelper } from '../Utils/Helpers/TexturesHelper';

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

        Helper.registry = this.registry;
        TexturesHelper.initialize(this.textures);
        this.registry.set('gamestate', new Gamestate(this.sys.game.events));
    }

    public create(): void {
        this.scene.start('LoadScene');
    }
}
