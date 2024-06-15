export type ColorVarianceConfig = { min: number, max: number } | { value: number }

export type ColorVariance = {
    hue?: ColorVarianceConfig,
    saturation?: ColorVarianceConfig,
    lightness?: ColorVarianceConfig,
    alpha?: ColorVarianceConfig,
};

const genericColorVariance: ColorVariance = {
    hue: {value: 0},
    saturation: {min: -20, max: 0},
    lightness: {min: -10, max: 0},
    alpha: {value: 0},
} as const;

export interface ParticleTypeData {
    color: HexColor,
    colorVariance?: ColorVariance | false
    canDraw?: boolean,
    drawProbability?: number,
    density?: number,
    maxSpeed?: number,
    acceleration?: number,
    velocity?: number,
    duration?: number | (() => number),
    fluidity?: number,
    burning?: boolean,
    fireSpreadSpeedModifier?: number,
    fuel?: number | (() => number),
    chanceToIgnite?: number,
    ephemeral?: boolean,
    immovable?: boolean,
}

export type HexColor = `#${string}`;

type ParticleTypeMap = {
    // Air: ElementData,
    // Smoke: ElementData,
    // Fire: ElementData,
    [key: string]: Readonly<ParticleTypeData>
};

export type ParticleType = keyof typeof particleTypes;

const particleTypes = {
    Air: {
        color: '#00000000',
        colorVariance: false,
        density: 1,
        maxSpeed: 0,
        acceleration: 0,
        ephemeral: true,
        canDraw: false,
    },
    Sand: {
        color: '#dcb159',
        colorVariance: genericColorVariance,
        density: 150,
        maxSpeed: 8,
        acceleration: 0.4,
        drawProbability: 0.25,
    },
    Stone: {
        color: '#8f8d8e',
        colorVariance: genericColorVariance,
        // density: 500,
        immovable: true,
    },
} as const satisfies ParticleTypeMap;

const particleTypesButClones = {} as Record<ParticleType, ParticleTypeData>;
for (const key of Object.keys(particleTypes) as ParticleType[]) {
    Object.defineProperty(particleTypesButClones, key, {
        get: ():ParticleTypeData => ({...particleTypes[key]})
    });
}

// type CloneElement = {
//     [key in keyof typeof particleTypes]: {
//         get clone():ParticleTypeData,
//     }
// }
//
// for (const key of Object.keys(particleTypes) as ParticleType[]) {
//     Object.defineProperty(particleTypes[key], 'clone', {
//         get: ():ParticleTypeData => ({...particleTypes[key]})
//     });
// }

export const ParticleType: Record<ParticleType, ParticleTypeData> = particleTypesButClones satisfies Record<ParticleType, ParticleTypeData>;