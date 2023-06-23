import packageJson from '../../package.json';
import configJson from 'configs/config.json';
import { Language } from './Utils/Enums';

export interface GlobalConfigVariables {
    debug: boolean;
    showHBSLogo: boolean;
    sendAnalyticalEvents: boolean;
    logAnalyticalEvents: boolean;
    defaultLanguage: Language;
}

export class GlobalConfig {

    public static readonly FPS_TARGET = 60;
    public static readonly TICK_DURATION = 1000 / GlobalConfig.FPS_TARGET;

    public static readonly HOMEPAGE_URL = 'https://www.facebook.com/Home-based-Studio-106555638161522';
    public static readonly HOME_BASED_STUDIO_URL = 'https://home-based.studio';
    public static readonly HOME_BASED_STUDIO_SHORT_LINK = 'Home-based Studio';
    public static readonly HOME_BASED_STUDIO_PRIVACY_POLICY_URL = 'https://home-based.studio/en/privacy-policy';
    public static readonly GAME_VERSION = packageJson.version;
    public static readonly GAME_CONFIG: GlobalConfigVariables = {
        debug: false,
        showHBSLogo: true,
        sendAnalyticalEvents: false,
        logAnalyticalEvents: false,
        defaultLanguage: Language.EN,
        ...configJson as Record<string, any>,
    };

    public static getGameAnalyticsSecretKey(): string {
        return configJson.gameAnalyticsSecretKey;
    }
}
