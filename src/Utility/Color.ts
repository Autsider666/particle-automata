import {Random} from "./Excalibur/Random.ts";

export type ColorVarianceConfig = { min: number, max: number } | { value: number }

export type ColorVariance = {
    hue?: ColorVarianceConfig,
    saturation?: ColorVarianceConfig,
    lightness?: ColorVarianceConfig,
    alpha?: ColorVarianceConfig,
};

export type ColorTuple = [number, number, number, number];

const random = new Random(); //FIXME dirty dirty

export class Color {
    static varyColor(color: string, { //FIXME can't handle #FFFFFF, gives NaN for hue and saturation
        hue: hueModifier = {value: 0},
        saturation: saturationModifier = {value: 0},
        lightness: lightnessModifier = {value: 0},
        alpha: alphaModifier = {value: 0},
    }: ColorVariance = {}): string {
        const {h, s, l, a} = this.toHSLA(color);
        const hue = Math.floor(h * 360) + this.randomByConfig(hueModifier);
        let saturation = (s * 100) + this.randomByConfig(saturationModifier);
        saturation = Math.max(0, Math.min(100, saturation));
        let lightness = (l * 100) + this.randomByConfig(lightnessModifier);
        lightness = Math.max(0, Math.min(100, lightness));
        const alpha = Math.min(Math.max(a + this.randomByConfig(alphaModifier), 0), 1);

        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(1)})`;
    }

    static varyColorTuple(color: string): ColorTuple {
        return this.toRGBA(color);
    }

    protected static toRGBA(color: string): ColorTuple {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
        if (!result) {
            throw new Error('Invalid color hex: ' + color);
        }

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        const a = parseInt(result[4] ?? 1, 16) * 255;
        // r /= 255;
        // g /= 255;
        // b /= 255;
        return [r, g, b, a];
    }

    protected static toHSLA(color: string): { h: number, s: number, l: number, a: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
        if (!result) {
            throw new Error('Invalid color hex: ' + color);
        }

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        let a = parseInt(result[4] ?? 0, 16);
        r /= 255;
        g /= 255;
        b /= 255;
        a /= 255;
        if (a === 0) {
            a = 1;
        }

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        const d = max - min;
        if (max + min !== 0) {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        }
        switch (max) {
            case 0 :
                break;
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;

        return {h, s, l, a};
    }

    private static randomByConfig({value, min, max}: { value?: number, min?: number, max?: number }): number {
        if (value !== undefined) {
            return value;
        }

        return random.integer(min ?? 0, max ?? 0);
    };
}