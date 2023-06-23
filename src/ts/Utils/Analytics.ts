import gameanalytics from 'gameanalytics';
import { GlobalConfig } from '../GlobalConfig';

/**
 * Game Analytics helper class
 * https://gameanalytics.com
 */
export class Analytics {

    // this should be somehow injected?
    private readonly GAME_KEY = '265d847cd8123b04a60fc676bc20797c';

    private sendEvents: boolean;

    constructor(sendEvents: boolean = false, logEvents: boolean = true) {
        console.log(`SEND EVENTS: ${sendEvents}, LOG EVENTS: ${logEvents}`);
        gameanalytics.GameAnalytics.setEnabledEventSubmission(sendEvents);
        gameanalytics.GameAnalytics.setEnabledInfoLog(logEvents);
        gameanalytics.GameAnalytics.configureBuild(GlobalConfig.GAME_VERSION);
        gameanalytics.GameAnalytics.initialize(this.GAME_KEY, GlobalConfig.getGameAnalyticsSecretKey());
    }

    public registerGameStartEvent(): void {
        gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Start, 'game');
    }

    public registerGameCompletedEvent(): void {
        gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Complete, 'game');
    }

    public registerGameFailedEvent(score: number): void {
        gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Fail, 'game', undefined, undefined, score);
    }

    public registerFacebookHyperlinkClicked(): void {
        gameanalytics.GameAnalytics.addDesignEvent('gui:facebook');
    }

    public registerSettingsClicked(): void {
        gameanalytics.GameAnalytics.addDesignEvent('gui:settings');
    }

    public registerPrivacyPolicyClicked(): void {
        gameanalytics.GameAnalytics.addDesignEvent('gui:policy');
    }

    public registerMusicMuted(source: 'settings' | 'pause', muted: boolean): void {
        gameanalytics.GameAnalytics.addDesignEvent(`gui:${source}:music:${muted ? 'off' : 'on'}`);
    }

    public registerSoundMuted(source: 'settings' | 'pause', muted: boolean): void {
        gameanalytics.GameAnalytics.addDesignEvent(`gui:${source}:sound:${muted ? 'off' : 'on'}`);
    }

    public registerRulesClicked(): void {
        gameanalytics.GameAnalytics.addDesignEvent(`gui:settings:rules`);
    }

    public registerLanguageChange(language: string): void {
        gameanalytics.GameAnalytics.addDesignEvent(`gui:settings:language:${language}`);
    }

    public registerGamePaused(): void {
        gameanalytics.GameAnalytics.addDesignEvent('gui:pause');
    }

    public registerGameLeft(): void {
        gameanalytics.GameAnalytics.addDesignEvent('gui:pause:leave');
    }

    public registerGameContinue(): void {
        gameanalytics.GameAnalytics.addDesignEvent('gui:pause:conitnue');
    }

    public registerCouponChosen(grade: number): void {
        gameanalytics.GameAnalytics.addDesignEvent(`coupon-chosen:${grade}`);
    }
}
