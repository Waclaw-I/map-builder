
export enum Sound {
}

export enum Music {
}

type WebAudioSound = Phaser.Sound.WebAudioSound;

export class AudioManager {

    private static sounds: Map<Sound, WebAudioSound> = new Map<Sound, WebAudioSound>();
    private static music: Map<Music, WebAudioSound> = new Map<Music, WebAudioSound>();

    private static playingMusic: WebAudioSound | undefined;
    private static isMusicMuted: boolean;
    private static isSoundMuted: boolean;

    public static initializeAudio(scene: Phaser.Scene): void {

        // mute?:   boolean | Boolean indicating whether the sound should be muted or not.
        // volume?: number  | A value between 0 (silence) and 1 (full volume).
        // rate?:   number  | Defines the speed at which the sound should be played.
        // detune?: number  | Represents detuning of sound in [cents](https://en.wikipedia.org/wiki/Cent_%28music%29).
        // seek?:   number  | Position of playback for this sound, in seconds.
        // loop?:   boolean | Whether or not the sound or current sound marker should loop.
        // delay?:  number  | Time, in seconds, that should elapse before the sound actually starts its playback.

        const soundKeys: Map<Sound, Phaser.Types.Sound.SoundConfig> = new Map<Sound, Phaser.Types.Sound.SoundConfig>();

        const musicKeys: Map<Music, Phaser.Types.Sound.SoundConfig> = new Map<Music, Phaser.Types.Sound.SoundConfig>();

        // for (const [ key, config ] of soundKeys) {
        //     this.sounds.set(key, scene.sound.add(key, config) as WebAudioSound);
        // }

        // for (const [ key, config ] of musicKeys) {
        //     this.music.set(key, scene.sound.add(key, config) as WebAudioSound);
        // }
    }

    public static playSound(key: Sound): void {
        this.sounds.get(key)?.play();
    }

    public static stopSound(key: Sound): void {
        this.sounds.get(key)?.stop();
    }

    public static playMusic(key: Music): void {
        this.playingMusic = this.music.get(key);
        if (this.playingMusic?.isPlaying) {
            return;
        }
        this.playingMusic?.play();
    }

    public static isPlayingMusic(): boolean {
        return this.playingMusic ? this.playingMusic.isPlaying : false;
    }

    public static stopPlayingMusic(): void {
        this.playingMusic?.stop();
    }

    public static muteMusic(mute: boolean = true): void {
        this.isMusicMuted = mute;
        for (const musicData of this.music.values()) {
            musicData.mute = this.isMusicMuted;
        }
    }

    public static getIsMusicMuted(): boolean {
        return this.isMusicMuted;
    }

    public static getIsSoundMuted(): boolean {
        return this.isSoundMuted;
    }

    public static muteSounds(mute: boolean = true): void {
        this.isSoundMuted = mute;
        for (const soundData of this.sounds.values()) {
            soundData.mute = this.isSoundMuted;
        }
    }

    public static mute(): void {
        this.muteSounds();
        this.muteMusic();
    }

}
