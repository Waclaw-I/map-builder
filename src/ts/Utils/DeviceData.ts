import * as Bowser from 'bowser';

export class DeviceData {

    private osName: string;
    private osVersion: string;
    private osVersionFloat: number;
    private deviceType: string;
    private mobile: boolean;
    private browserName: string;
    private touchDevice: boolean;
    private ratio: number;
    private screenResolution = {
        width: 0,
        height: 0,
    };

    private browser: Bowser.Parser.Parser;

    constructor(window: Window) {
        this.initBrowser(window.navigator.userAgent);
        this.detect(window);
    }

    private initBrowser(userAgent: string): void {
        this.browser = Bowser.getParser(userAgent);
    }

    private detect(window: Window): void {
        this.osName = this.browser.getOSName(true);
        this.osVersion = this.browser.getOSVersion() || '';
        this.initFloatOsVersion();
        
        this.deviceType = this.browser.getPlatformType(true);
        this.mobile = ['tablet', 'mobile'].includes(this.deviceType);
        this.browserName = this.browser.getBrowserName().toLowerCase();
        this.touchDevice = ('ontouchstart' in window);
        this.initScreenResolution(window);

        this.ratio = window.innerHeight / window.innerWidth;
    }

    public isTouchDevice(): boolean {
        return this.touchDevice;
    }

    public isMobile(): boolean {
        return this.mobile;
    }

    public getOsName(): string {
        return this.osName;
    }

    public getOsVersion(): string {
        return this.osVersion;
    }

    public getOsVersionFloat(): number {
        return this.osVersionFloat;
    }

    public getDeviceType(): string {
        return this.deviceType;
    }

    public getBrowserName(): string {
        return this.browserName;
    }

    public getRatio(): number {
        return this.ratio;
    }

    public getScreenResolution(): { width: number, height: number } {
        return { ...this.screenResolution };
    }

    private initFloatOsVersion(): void {
        const osVersionFloatMatch = this.osVersion.match(/\d+\.\d+/);
        if (!osVersionFloatMatch) {
            this.osVersionFloat = 0;
            return;
        }
        const osVersionFloat = parseFloat(osVersionFloatMatch[0]);
        if (isNaN(osVersionFloat)) {
            this.osVersionFloat = 0;
        } else {
            this.osVersionFloat = osVersionFloat;
        }
    }

    private initScreenResolution(window: Window): void {
        this.screenResolution.width = window.screen.width;
        this.screenResolution.height = window.screen.height;
    }
}
