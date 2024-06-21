import {Color, ColorVariance, HexColor, RGBATuple} from "../../Utility/Color.ts";
import {Distinct} from "../../Utility/Type/Distinct.ts";

const genericColorVariance: ColorVariance = {
    hue: {value: 0},
    saturation: {min: -20, max: 0},
    lightness: {min: -10, max: 0},
    alpha: {value: 0},
} as const;

// export interface ParticleTypeData {
//     baseColor: HexColor,
//     colorVariance?: ColorVariance | false,
//     canDraw?: boolean,
//     drawProbability?: number,
//     density?: number,
//     maxSpeed?: number,
//     acceleration?: number,
//     velocity?: number,
//     duration?: number | (() => number),
//     fluid?: boolean,
//     burning?: boolean,
//     fireSpreadSpeedModifier?: number,
//     fuel?: number | (() => number),
//     chanceToIgnite?: number,
//     ephemeral?: boolean,
//     immovable?: boolean,
// }

export type ParticleType = keyof typeof particleTypes;

const particleTypes = {
    Air: {
        baseColor: '#0f1726',
        density: 1,
        maxSpeed: 0,
        acceleration: 0,
        ephemeral: true,
        canDraw: false,
    },
    Sand: {
        baseColor: '#dcb159',
        colorVariance: genericColorVariance,
        density: 150,
        maxSpeed: 8,
        acceleration: 0.4,
        drawProbability: 0.25,
    },
    Stone: {
        baseColor: '#8f8d8e',
        colorVariance: genericColorVariance,
        // density: 500,
        immovable: true,
    },
    Water: {
        baseColor: '#1573a9',
        colorVariance: genericColorVariance,
        // colorVariance: {
        //     lightness: {min: -5, max: 10},
        //     saturation: {min: -10, max: 10},
        //     alpha: {min: -0.5, max: 0}
        // },
        density: 100,
        maxSpeed: 8,
        acceleration: 0.4,
        fluid: true,
    }
} as const;

export type ParticleIdentifier = Distinct<string, 'particle'>;

type BaseParticleData = {
    baseColor: HexColor;
    colorVariance?: ColorVariance,
    ephemeral?: boolean,
    density?: number,
    immovable?: boolean,
    fluid?: boolean,
    hidden?: boolean,
}

export type BaseParticle = BaseParticleData & {
    type: ParticleIdentifier,
    color: string,
    colorTuple: RGBATuple,
    ephemeral: boolean,
    density: number,
    immovable: boolean,
    fluid: boolean, // TODO maybe switch to checking if density is lower than a specific value?
}

class ParticleProvider {
    private emptyIdentifier: ParticleIdentifier;

    private readonly particleTemplates = new Map<ParticleIdentifier, Readonly<BaseParticleData>>();

    constructor(initialTypes: Record<string, Readonly<BaseParticleData>>, emptyType: string) {
        for (const [identifier, data] of Object.entries(initialTypes)) {
            this.add(identifier, data);
        }

        if (!this.has(emptyType)) {
            throw new Error('Invalid type provided for empty: ' + emptyType);
        }

        this.emptyIdentifier = this.toIdentifier(emptyType);
    }

    get empty(): BaseParticle {
        return this.prepareParticle(this.emptyIdentifier);
    }

    setEmptyParticleType(identifier: string): void {
        if (!this.has(identifier)) {
            throw new Error('Invalid particle identifier: ' + identifier);
        }
        this.emptyIdentifier = this.toIdentifier(identifier);
    }

    public has(identifier: string): boolean {
        return this.particleTemplates.has(this.toIdentifier(identifier));
    }

    public get(identifier: string): BaseParticle {
        return this.prepareParticle(this.toIdentifier(identifier));
    }

    public add(identifier: string, data: Readonly<BaseParticleData>, overwrite: boolean = false) {
        const particleIdentifier = this.toIdentifier(identifier);
        if (this.particleTemplates.has(particleIdentifier) && !overwrite) {
            throw new Error(' Already loaded a particle type of type ' + identifier);
        }

        this.particleTemplates.set(particleIdentifier, data);
    }

    private prepareParticle(identifier: ParticleIdentifier): BaseParticle {
        const particleTemplate = this.particleTemplates.get(identifier);
        if (!particleTemplate) {
            throw new Error('ParticleProvider does not contain a particleTemplate of type: ' + identifier);
        }

        let color: HexColor | string = particleTemplate.baseColor;
        let colorTuple = Color.varyColorTuple(color);
        const colorVariance = particleTemplate.colorVariance;
        if (colorVariance) {
            colorTuple = Color.varyColorTuple(color, colorVariance);
            color = Color.varyColor(color, colorVariance);
        }

        return {
            ...particleTemplate,
            type: identifier,
            color,
            colorTuple,
            ephemeral: particleTemplate.ephemeral ?? false,
            density: particleTemplate.density ?? 0,
            immovable: particleTemplate.immovable ?? false,
            fluid: particleTemplate.fluid ?? false,
        };
    }

    private toIdentifier(identifier: string): ParticleIdentifier {
        return identifier as ParticleIdentifier;
    }
}

type DynamicParticleMap = ParticleProvider & {
    [key: string | ParticleType]: BaseParticle,
};

export const ParticleType = new Proxy<DynamicParticleMap>(new ParticleProvider(particleTypes, 'Air') as DynamicParticleMap, {
    get(target: ParticleProvider, prop: string) {
        if (prop in target) {
            // @ts-expect-error Proxy stuff is hard.
            const result: unknown = target[prop];

            if (typeof result === 'function') {
                return result.bind(target);
            }

            return result;
        }

        return target.get(prop);
    },
}) satisfies DynamicParticleMap;