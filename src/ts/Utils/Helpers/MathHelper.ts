import { MathHelper as HBSMathHelper, Point } from '@home-based-studio/phaser3-utils';

export class MathHelper extends HBSMathHelper {

    public static getAngleBetween(p1: Point, p2: Point): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

    public static getVelocityFromSpeedAndAngle(speed: number, rad: number): Point {
        return {
            x: speed * Math.cos(rad),
            y: speed * Math.sin(rad),
        };
    }

    public static randomWithWeights<T>(options: [T, number][]): T {
        if (options.length === 0) {
            throw new Error('No options for randomWithWeights provided!');
        }
        const cumulativeWeights: number[] = [];
        for (let i = 0; i < options.length; i += 1) {
            cumulativeWeights.push(options[i][1] + (cumulativeWeights[i - 1] || 0));
        }

        const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
        const randomNumber = maxCumulativeWeight * Math.random();

        for (let i = 0; i < options.length; i += 1) {
            if (cumulativeWeights[i] >= randomNumber) {
                return options[i][0];
            }
        }
        return options[0][0];
    }

    public static recordToArray<K extends string | number | symbol, V>(record: Record<K, V>, keys: K[]): { key: K; value: V }[] {
        const arr: { key: K; value: V }[] = [];
        for (const key of keys) {
            arr.push(
                { key, value: record[key] },
            );
        }
        return arr;
    }
}
