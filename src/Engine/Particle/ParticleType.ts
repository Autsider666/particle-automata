import {Color, ColorVariance, HexColor, RGBATuple} from "../../Utility/Color.ts";

const genericColorVariance: ColorVariance = {
    hue: {value: 0},
    saturation: {min: -20, max: 0},
    lightness: {min: -10, max: 0},
    alpha: {value: 0},
} as const;

export interface ParticleTypeData {
    color: HexColor,
    colorVariance?: ColorVariance | false,
    colorTuple?: RGBATuple,
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

type ParticleTypeMap = {
    // Air: ElementData,
    // Smoke: ElementData,
    // Fire: ElementData,
    [key: string]: Readonly<ParticleTypeData>
};

export type ParticleType = keyof typeof particleTypes;

const particleTypes = {
    Air: {
        color: '#0f1726',
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
    Water: {
        color: '#1573a9',
        colorVariance: genericColorVariance,
        // colorVariance: {
        //     lightness: {min: -5, max: 10},
        //     saturation: {min: -10, max: 10},
        //     alpha: {min: -0.5, max: 0}
        // },
        density: 100,
        maxSpeed: 8,
        acceleration: 0.4,
        fluidity: 1, //FIXME
    }
} as const satisfies ParticleTypeMap;

const particleTypesButClones = {} as Record<ParticleType, ParticleTypeData>;
for (const key of Object.keys(particleTypes) as ParticleType[]) {
    Object.defineProperty(particleTypesButClones, key, {
        get: (): ParticleTypeData => {
            const newBase: ParticleTypeData = {...particleTypes[key]};


            const colorVariance = newBase.colorVariance;
            if (colorVariance) {
                newBase.colorTuple = Color.varyColorTuple(newBase.color, colorVariance);
                newBase.color = Color.varyColor(newBase.color, colorVariance) as typeof newBase.color;
            } else {
                newBase.colorTuple = Color.varyColorTuple(newBase.color);
            }

            return newBase;
        }
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