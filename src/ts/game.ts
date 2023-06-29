import Phaser from 'phaser';
import * as WebFontLoader from 'phaser3-rex-plugins/dist/rexwebfontloaderplugin.min';
import * as InputTextPlugin from 'phaser3-rex-plugins/dist/rexinputtextplugin.min';

import { ScenesHelper } from './Utils/Helpers/ScenesHelper';
import { MathHelper } from '@home-based-studio/phaser3-utils';
import { Resolution, ScaleHelper, ScalingStyle } from './Utils/Helpers/ScaleHelper';
import { Helper } from './Utils/Helpers/Helper';
import { GlobalConfig } from './GlobalConfig';
import { DeviceData } from './Utils/DeviceData';


class Game {

    private game: Phaser.Game;
    private restartTimeout?: number;

    constructor(gameContainerId: string, scalingStyle: ScalingStyle, resolution: Resolution) {
        ScaleHelper.setResolution(resolution);
        let deviceRatio = window.innerHeight / window.innerWidth;
        if (scalingStyle === ScalingStyle.VerticalView) {
            deviceRatio = Phaser.Math.Clamp(deviceRatio, ScaleHelper.MIN_DEVICE_RATIO, ScaleHelper.MAX_DEVICE_RATIO);
        }

        const gameRatio = ScaleHelper.world.height / ScaleHelper.world.width;
        console.log(`deviceRatio:\t${MathHelper.toFixedNumber(deviceRatio, 2)}`);
        console.log(`gameRatio:\t${MathHelper.toFixedNumber(gameRatio)}`);

        // increase height
        if (gameRatio < deviceRatio) {
            ScaleHelper.world.height = Math.floor(deviceRatio * ScaleHelper.world.width);
        } else {
            ScaleHelper.world.width = Math.floor(ScaleHelper.world.height / deviceRatio);
        }

        console.log(`gameSize:\t${Math.floor(ScaleHelper.world.width)} | ${Math.floor(ScaleHelper.world.height)}`);

        this.game = new Phaser.Game(this.getGameConfig(gameContainerId, scalingStyle));
        ScenesHelper.initialize(this.game.scene);

        window.focus();

        if (scalingStyle === ScalingStyle.Universal) {
            window.onresize = () => {
                if (this.restartTimeout !== undefined) {
                    window.clearTimeout(this.restartTimeout);
                }
                this.restartTimeout = window.setTimeout(() => {
                    ScaleHelper.updateWorldDimensions(this.game.scale);
                    ScenesHelper.resizeScenes(Helper.gameRatio());
                    this.restartTimeout = undefined;
                }, 250);
            };
        }

        // if (scalingStyle === ScalingStyle.Fixed) {
        //     window.onresize = () => {
        //         if (this.restartTimeout !== undefined) {
        //             window.clearTimeout(this.restartTimeout);
        //         }
        //         this.restartTimeout = window.setTimeout(() => {
        //             // this.game.scale.resize(window.innerWidth, window.innerHeight);
        //             // ScaleHelper.updateWorldDimensions(this.game.scale);
        //             this.restartTimeout = undefined;
        //         }, 250);
        //     };
        // }
    }

    private getGameConfig(gameContainerId: string, scalingStyle: ScalingStyle): Phaser.Types.Core.GameConfig {
        const coreConfig = this.getCoreGameConfig(gameContainerId);
        switch (scalingStyle) {
            case ScalingStyle.Universal: {
                break;
            }
            case ScalingStyle.VerticalView: {
                break;
            }
        }
        return {
            ...coreConfig,
        };
    }

    private getCoreGameConfig(gameContainerId: string): Phaser.Types.Core.GameConfig {
        return {
            title: 'Map Builder',
            type: Phaser.AUTO,
            zoom: 1,
            scale: {
                autoCenter: Phaser.Scale.CENTER_BOTH,
                mode: Phaser.Scale.RESIZE,
                width: ScaleHelper.world.width,
                height: ScaleHelper.world.height,
                autoRound: true,
                parent: gameContainerId,
            },
            // backgroundColor: 0x87CEEB,
            transparent: true,
            disableContextMenu: true,
            audio: {
                disableWebAudio: false,
            },
            render: {
                batchSize: 1024,
                maxTextures: 2,
            },
            physics: undefined,
            input: {
                activePointers: 1,
            },
            scene: ScenesHelper.getScenesForPhaser(),
            version: GlobalConfig.GAME_VERSION,
            plugins: {
                global: [
                    { key: 'WebFontLoader', plugin: WebFontLoader, start: true },
                    { key: 'rexInputTextPlugin', plugin: InputTextPlugin, start: true },
                ],
            },
            dom: {
                createContainer: true,
            },
            fps: {
                min: 30,
                target: 60,
            },
            pixelArt: false,
            antialias: true,
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Helper.deviceData = new DeviceData(window);
    new Game('container', ScalingStyle.Fixed, Helper.deviceData.isMobile() ? Resolution.HD : Resolution.HD);
});
